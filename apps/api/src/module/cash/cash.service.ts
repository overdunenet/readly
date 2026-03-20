import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { TransactionService } from '../shared/transaction/transaction.service';
import { CashBalanceEntity } from '../domain/cash-balance.entity';
import { CashEntity } from '../domain/cash.entity';
import { CashHistoryEntity } from '../domain/cash-history.entity';
import { PaymentEntity } from '../domain/payment.entity';

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

  async charge(
    userId: string,
    amount: number
  ): Promise<{
    cashBalance: number;
    cash: { id: string; initialAmount: number; currentAmount: number };
    history: {
      id: string;
      type: string;
      amount: number;
      balanceAfter: number;
      description: string;
    };
  }> {
    return this.transactionService.runInTransaction(async manager => {
      // 1. payment 레코드 생성
      const payment = PaymentEntity.create(userId, amount);
      payment.status = 'PAID';
      payment.paidAt = new Date();
      const savedPayment = await manager
        .getRepository(PaymentEntity)
        .save(payment);

      // 2. cashBalance SELECT FOR UPDATE (비관적 잠금)
      let cashBalance = await manager.getRepository(CashBalanceEntity).findOne({
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cashBalance) {
        cashBalance = CashBalanceEntity.create(userId);
        cashBalance = await manager
          .getRepository(CashBalanceEntity)
          .save(cashBalance);

        // 새로 생성한 경우 비관적 잠금으로 다시 조회
        cashBalance = (await manager.getRepository(CashBalanceEntity).findOne({
          where: { userId },
          lock: { mode: 'pessimistic_write' },
        })) as CashBalanceEntity;
      }

      // 3. cashBalance.amount += amount
      cashBalance.amount += amount;
      await manager.getRepository(CashBalanceEntity).save(cashBalance);

      // 4. cash 레코드 생성
      const cash = CashEntity.create(userId, amount, savedPayment.id);
      const savedCash = await manager.getRepository(CashEntity).save(cash);

      // 5. cashHistory 기록
      const description = `캐시 충전 ${amount.toLocaleString()}원`;
      const history = CashHistoryEntity.create(
        savedCash.id,
        userId,
        'CHARGE',
        amount,
        cashBalance.amount,
        description
      );
      const savedHistory = await manager
        .getRepository(CashHistoryEntity)
        .save(history);

      // 6. 반환
      return {
        cashBalance: cashBalance.amount,
        cash: {
          id: savedCash.id,
          initialAmount: savedCash.initialAmount,
          currentAmount: savedCash.currentAmount,
        },
        history: {
          id: savedHistory.id,
          type: savedHistory.type,
          amount: savedHistory.amount,
          balanceAfter: savedHistory.balanceAfter,
          description: savedHistory.description,
        },
      };
    });
  }

  async getHistory(
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<{
    items: Array<{
      id: string;
      cashId: string;
      type: string;
      amount: number;
      balanceAfter: number;
      description: string;
      createdAt: Date;
    }>;
    nextCursor: string | null;
  }> {
    const queryBuilder =
      this.repositoryProvider.CashHistoryRepository.createQueryBuilder(
        'history'
      )
        .where('history.userId = :userId', { userId })
        .orderBy('history.createdAt', 'DESC')
        .take(limit + 1);

    if (cursor) {
      const cursorRecord =
        await this.repositoryProvider.CashHistoryRepository.findOneBy({
          id: cursor,
        });

      if (cursorRecord) {
        queryBuilder.andWhere('history.createdAt < :cursorDate', {
          cursorDate: cursorRecord.createdAt,
        });
      }
    }

    const records = await queryBuilder.getMany();

    const hasNext = records.length > limit;
    const items = hasNext ? records.slice(0, limit) : records;

    return {
      items: items.map(item => ({
        id: item.id,
        cashId: item.cashId,
        type: item.type,
        amount: item.amount,
        balanceAfter: item.balanceAfter,
        description: item.description,
        createdAt: item.createdAt,
      })),
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
