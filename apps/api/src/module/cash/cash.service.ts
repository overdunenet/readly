import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Raw } from 'typeorm';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { CashBalanceEntity } from '../domain/cash-balance.entity';
import { CashEntity } from '../domain/cash.entity';
import {
  CashHistoryEntity,
  CashHistoryType,
} from '../domain/cash-history.entity';

@Injectable()
export class CashService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async getBalance(userId: string): Promise<CashBalanceEntity | null> {
    return this.repositoryProvider.CashBalanceRepository.findOneBy({ userId });
  }

  /**
   * 캐시 충전 (PG 연동 전 수동 충전)
   * TODO: PG 연동 시 결제 승인 후 호출되도록 변경 예정
   */
  async charge(userId: string, amount: number): Promise<CashEntity> {
    if (amount < 1000 || amount > 1000000) {
      throw new BadRequestException(
        '충전 금액은 1,000원 이상 1,000,000원 이하입니다'
      );
    }

    // 1. cash 레코드 생성
    const cash = CashEntity.create(userId, amount);
    const savedCash = await this.repositoryProvider.CashRepository.save(cash);

    // 2. 잔액 동기화 (cash table SUM → cashBalance)
    const newBalance = await this.syncBalance(userId);

    // 3. cashHistory 기록
    const history = CashHistoryEntity.create({
      cashId: savedCash.id,
      userId,
      type: CashHistoryType.CHARGE,
      amount,
      balanceAfter: newBalance,
      description: `캐시 충전 ${amount.toLocaleString('ko-KR')}원`,
    });
    await this.repositoryProvider.CashHistoryRepository.save(history);

    return savedCash;
  }

  /**
   * 특정 사용자의 cash table current_amount 합계로 cashBalance를 동기화
   */
  async syncBalance(userId: string): Promise<number> {
    // SUM + UPSERT를 단일 쿼리로 처리
    const [row] =
      await this.repositoryProvider.CashBalanceRepository.manager.query(
        `INSERT INTO "cash_balances" ("user_id", "amount")
         SELECT $1, COALESCE(SUM("current_amount"), 0)::int FROM "cash" WHERE "user_id" = $1
         ON CONFLICT ("user_id") DO UPDATE SET "amount" = EXCLUDED."amount", "updated_at" = NOW()
         RETURNING "amount"`,
        [userId]
      );

    return row?.amount ?? 0;
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
          userId,
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
