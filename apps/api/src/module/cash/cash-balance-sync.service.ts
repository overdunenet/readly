import { Injectable, Logger } from '@nestjs/common';
import { DataSources } from '@src/database/datasources';
import { CashBalanceEntity } from '../domain/cash-balance.entity';
import { CashEntity } from '../domain/cash.entity';

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

  /**
   * 모든 사용자의 캐시 잔액 정합성을 검증하고 불일치 시 재보정합니다.
   * 1일 1회 호출을 권장합니다.
   */
  async syncBalances(): Promise<{
    checked: number;
    corrected: number;
    details: Array<{
      userId: string;
      balanceAmount: number;
      cashSum: number;
    }>;
  }> {
    const queryRunner = DataSources.readly.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // cash 테이블의 current_amount 합계를 사용자별로 조회
      const cashSums: Array<{ userId: string; totalCurrentAmount: string }> =
        await manager
          .createQueryBuilder()
          .select('cash.user_id', 'userId')
          .addSelect('SUM(cash.current_amount)', 'totalCurrentAmount')
          .from(CashEntity, 'cash')
          .groupBy('cash.user_id')
          .getRawMany();

      let checked = 0;
      let corrected = 0;
      const details: Array<{
        userId: string;
        balanceAmount: number;
        cashSum: number;
      }> = [];

      for (const row of cashSums) {
        checked++;
        const cashSum = parseInt(row.totalCurrentAmount, 10);

        const balance = await manager.getRepository(CashBalanceEntity).findOne({
          where: { userId: row.userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!balance) {
          // 잔액 레코드가 없으면 생성
          const newBalance = CashBalanceEntity.create(row.userId);
          newBalance.amount = cashSum;
          await manager.getRepository(CashBalanceEntity).save(newBalance);
          corrected++;
          details.push({
            userId: row.userId,
            balanceAmount: 0,
            cashSum,
          });
          this.logger.warn(
            `잔액 레코드 생성: userId=${row.userId}, amount=${cashSum}`
          );
          continue;
        }

        if (balance.amount !== cashSum) {
          details.push({
            userId: row.userId,
            balanceAmount: balance.amount,
            cashSum,
          });
          this.logger.warn(
            `잔액 불일치 보정: userId=${row.userId}, ` +
              `balance=${balance.amount} → cash합계=${cashSum}`
          );
          balance.amount = cashSum;
          await manager.getRepository(CashBalanceEntity).save(balance);
          corrected++;
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `잔액 동기화 완료: checked=${checked}, corrected=${corrected}`
      );

      return { checked, corrected, details };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('잔액 동기화 실패', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
