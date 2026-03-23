import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, MoreThan, Raw } from 'typeorm';
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
   * 캐시 추가 — cash row 생성 + history 기록 + 잔액 동기화
   */
  async addCash(
    userId: string,
    amount: number,
    description: string,
    type: CashHistoryType = CashHistoryType.CHARGE
  ): Promise<CashEntity> {
    const cash = CashEntity.create(userId, amount);
    const savedCash = await this.repositoryProvider.CashRepository.save(cash);

    const newBalance = await this.syncBalance(userId);

    const history = CashHistoryEntity.create({
      cashId: savedCash.id,
      userId,
      type,
      amount,
      balanceAfter: newBalance,
      description,
      groupKey: randomUUID(),
    });
    await this.repositoryProvider.CashHistoryRepository.save(history);

    return savedCash;
  }

  /**
   * 캐시 차감 — 가장 오래된 cash row부터 current_amount 차감 + history 기록 + 잔액 동기화
   */
  async removeCash(
    userId: string,
    amount: number,
    description: string,
    type: CashHistoryType = CashHistoryType.PURCHASE
  ): Promise<void> {
    const balance = await this.getBalance(userId);
    if (!balance || balance.amount < amount) {
      throw new BadRequestException('캐시 잔액이 부족합니다');
    }

    // 잔액이 남아있는 cash row를 오래된 순서로 조회
    const cashRows = await this.repositoryProvider.CashRepository.find({
      where: { userId, currentAmount: MoreThan(0) },
      order: { createdAt: 'ASC' },
    });

    const groupKey = randomUUID();
    let remaining = amount;

    // cash row 마다 차감 + history 기록
    for (const cash of cashRows) {
      if (remaining <= 0) break;

      const deduct = Math.min(cash.currentAmount, remaining);
      cash.currentAmount -= deduct;
      remaining -= deduct;
      await this.repositoryProvider.CashRepository.save(cash);

      const history = CashHistoryEntity.create({
        cashId: cash.id,
        userId,
        type,
        amount: -deduct,
        balanceAfter: 0, // syncBalance 후 일괄 업데이트
        description,
        groupKey,
      });
      await this.repositoryProvider.CashHistoryRepository.save(history);
    }

    // 잔액 동기화 후 history의 balanceAfter 일괄 업데이트
    const newBalance = await this.syncBalance(userId);
    await this.repositoryProvider.CashHistoryRepository.createQueryBuilder()
      .update()
      .set({ balanceAfter: newBalance })
      .where('group_key = :groupKey', { groupKey })
      .execute();
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

    return this.addCash(
      userId,
      amount,
      `캐시 충전 ${amount.toLocaleString('ko-KR')}원`
    );
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
