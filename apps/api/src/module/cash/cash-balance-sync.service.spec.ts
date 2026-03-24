import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CashBalanceSyncService } from './cash-balance-sync.service';
import { CashService } from './cash.service';
import { UserEntity, UserStatus } from '../domain/user.entity';
import { CashEntity } from '../domain/cash.entity';

describe('CashBalanceSyncService', () => {
  let app: TestingModule;
  let syncService: CashBalanceSyncService;
  let cashService: CashService;
  let entityManager: EntityManager;

  const createTestUser = async (
    overrides?: Partial<{
      email: string;
      nickname: string;
      status: UserStatus;
    }>
  ) => {
    const user = new UserEntity();
    user.email =
      overrides?.email ??
      `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname =
      overrides?.nickname ?? `user-${Math.random().toString(36).slice(2, 7)}`;
    if (overrides?.status !== undefined) {
      user.status = overrides.status;
    }
    return testingRepositoryProvider.UserRepository.save(user);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    syncService = app.get(CashBalanceSyncService);
    cashService = app.get(CashService);
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  describe('syncBalances', () => {
    describe('Given: 사용자A(cash 합계 5,000원)의 cashBalance가 3,000원으로 불일치', () => {
      describe('When: syncBalances를 호출하면', () => {
        it('Then: cashBalance가 5,000원으로 보정된다', async () => {
          // Arrange: 사용자 생성 + addCash(5000)으로 정상 세팅
          const user = await createTestUser();
          await cashService.addCash(user.id, 5000, '테스트 충전');

          // cashBalance를 직접 3000으로 수정 (불일치 상태)
          await testingRepositoryProvider.CashBalanceRepository.update(
            { userId: user.id },
            { amount: 3000 }
          );

          // 불일치 확인
          const before =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(before!.amount).toBe(3000);

          // Act
          const result = await syncService.syncBalances();

          // Assert
          const after =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(after!.amount).toBe(5000);
        });
      });
    });

    describe('Given: 사용자B(cash 합계 10,000원)에 cashBalance 레코드가 없음', () => {
      describe('When: syncBalances를 호출하면', () => {
        it('Then: 10,000원짜리 cashBalance가 새로 생성된다', async () => {
          // Arrange: 사용자 생성 + CashEntity 직접 생성 (cashBalance 없이)
          const user = await createTestUser();

          const cash = CashEntity.create(user.id, 10000);
          await testingRepositoryProvider.CashRepository.save(cash);

          // cashBalance가 없는지 확인
          const before =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(before).toBeNull();

          // Act
          await syncService.syncBalances();

          // Assert
          const after =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(after).not.toBeNull();
          expect(after!.amount).toBe(10000);
        });
      });
    });

    describe('Given: 사용자C(cash 합계 5,000원)의 cashBalance가 5,000원으로 일치', () => {
      describe('When: syncBalances를 호출하면', () => {
        it('Then: cashBalance가 변경되지 않는다', async () => {
          // Arrange: addCash(5000)으로 정상 상태 세팅
          const user = await createTestUser();
          await cashService.addCash(user.id, 5000, '테스트 충전');

          const before =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(before!.amount).toBe(5000);

          // Act
          const result = await syncService.syncBalances();

          // Assert: amount 변경 없음
          const after =
            await testingRepositoryProvider.CashBalanceRepository.findOneBy({
              userId: user.id,
            });
          expect(after!.amount).toBe(5000);

          // synced 결과에 이 사용자가 포함되지 않아야 함
          // (다른 사용자 데이터가 없으므로 synced === 0)
          expect(result.synced).toBe(0);
        });
      });
    });
  });
});
