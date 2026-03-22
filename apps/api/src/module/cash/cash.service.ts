import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Raw } from 'typeorm';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { TransactionService } from '../shared/transaction/transaction.service';
import { CashBalanceEntity } from '../domain/cash-balance.entity';
import { CashEntity } from '../domain/cash.entity';
import {
  CashHistoryEntity,
  CashHistoryType,
} from '../domain/cash-history.entity';
import { PaymentEntity, PaymentStatus } from '../domain/payment.entity';

@Injectable()
export class CashService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly transactionService: TransactionService
  ) {}

  async getBalance(userId: string): Promise<{ amount: number }> {
    const balance =
      await this.repositoryProvider.CashBalanceRepository.findOneBy({
        userId,
      });

    return { amount: balance?.amount ?? 0 };
  }

  /**
   * 캐시 충전 (PG 연동 전 수동 충전)
   * TODO: PG 연동 시 이 메서드는 confirmCharge()로 대체 예정.
   * 현재는 PG 승인 없이 즉시 PAID 처리됨.
   */
  async charge(
    userId: string,
    amount: number
  ): Promise<{
    cashBalance: CashBalanceEntity;
    cash: CashEntity;
    history: CashHistoryEntity;
  }> {
    if (amount < 1000 || amount > 1000000) {
      throw new BadRequestException(
        '충전 금액은 1,000원 이상 1,000,000원 이하입니다'
      );
    }

    return this.transactionService.runInTransaction(async manager => {
      // 1. payment 레코드 생성
      const payment = PaymentEntity.create(userId, amount);
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      const savedPayment = await manager
        .getRepository(PaymentEntity)
        .save(payment);

      // 2. cashBalance UPSERT + SELECT FOR UPDATE (race condition 방지)
      await manager.query(
        `INSERT INTO "cash_balances" ("user_id", "amount") VALUES ($1, 0) ON CONFLICT ("user_id") DO NOTHING`,
        [userId]
      );
      const cashBalance = (await manager
        .getRepository(CashBalanceEntity)
        .findOne({
          where: { userId },
          lock: { mode: 'pessimistic_write' },
        })) as CashBalanceEntity;

      // 3. cashBalance.amount += amount
      cashBalance.amount += amount;
      await manager.getRepository(CashBalanceEntity).save(cashBalance);

      // 4. cash 레코드 생성
      const cash = CashEntity.create(userId, amount, savedPayment.id);
      const savedCash = await manager.getRepository(CashEntity).save(cash);

      // 5. cashHistory 기록
      const description = `캐시 충전 ${amount.toLocaleString()}원`;
      const history = CashHistoryEntity.create({
        cashId: savedCash.id,
        userId,
        type: CashHistoryType.CHARGE,
        amount,
        balanceAfter: cashBalance.amount,
        description,
      });
      const savedHistory = await manager
        .getRepository(CashHistoryEntity)
        .save(history);

      return { cashBalance, cash: savedCash, history: savedHistory };
    });
  }

  async getHistory(
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<{
    items: CashHistoryEntity[];
    nextCursor: string | null;
  }> {
    const where: FindOptionsWhere<CashHistoryEntity> = { userId };

    if (cursor) {
      const cursorRecord =
        await this.repositoryProvider.CashHistoryRepository.findOneBy({
          id: cursor,
        });

      if (cursorRecord) {
        where.createdAt = Raw(
          alias =>
            `(${alias} < :cursorDate OR (${alias} = :cursorDate AND "id" < :cursorId))`,
          { cursorDate: cursorRecord.createdAt, cursorId: cursorRecord.id }
        );
      }
    }

    const records = await this.repositoryProvider.CashHistoryRepository.find({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      take: limit + 1,
    });

    const hasNext = records.length > limit;
    const items = hasNext ? records.slice(0, limit) : records;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
