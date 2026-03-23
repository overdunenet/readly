import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from '../shared/transaction/transaction.service';

/**
 * 캐시 잔액 정합성 검증 서비스
 *
 * cash.current_amount 합계와 cash_balances.amount를 비교하여 불일치 시 재보정합니다.
 * @nestjs/schedule 패키지가 없으므로 수동 호출 방식으로 구현합니다.
 * 향후 @Cron 데코레이터 추가 시 syncBalances() 메서드에 적용하면 됩니다.
 */
@Injectable()
export class CashBalanceSyncService {
  private readonly logger = new Logger(CashBalanceSyncService.name);

  constructor(private readonly transactionService: TransactionService) {}

  /**
   * 모든 사용자의 캐시 잔액 정합성을 검증하고 불일치 시 재보정합니다.
   * 1일 1회 호출을 권장합니다.
   */
  async syncBalances(): Promise<{ synced: number }> {
    const manager = this.transactionService.getTransaction()!;

    // 1. Table lock — sync 중 데이터 변경 방지 (트랜잭션 종료 시 자동 해제)
    //    SHARE MODE: 다른 트랜잭션의 SELECT 허용, INSERT/UPDATE/DELETE 차단
    //    EXCLUSIVE MODE: 다른 트랜잭션의 모든 쓰기 + LOCK 획득 차단 (SELECT만 허용)
    await manager.query(`LOCK TABLE "cash" IN SHARE MODE`);
    await manager.query(`LOCK TABLE "cash_balances" IN EXCLUSIVE MODE`);

    // 2. UPSERT 단일 쿼리 — for loop 제거
    const result = await manager.query(
      `INSERT INTO "cash_balances" ("user_id", "amount")
       SELECT "user_id", COALESCE(SUM("current_amount"), 0)::int
       FROM "cash"
       GROUP BY "user_id"
       ON CONFLICT ("user_id") DO UPDATE SET
         "amount" = EXCLUDED."amount",
         "updated_at" = NOW()
       WHERE "cash_balances"."amount" != EXCLUDED."amount"`
    );

    const synced = result[1] ?? 0;
    this.logger.log(`잔액 동기화 완료: synced=${synced}`);
    return { synced };
  }
}
