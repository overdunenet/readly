import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { UserEntity, UserStatus } from '../domain/user.entity';

describe('CashController', () => {
  let app: TestingModule;
  let controller: CashController;
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
    controller = app.get(CashController);
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

  describe('getBalance', () => {
    describe('Given: 잔액이 없는 사용자', () => {
      describe('When: getBalance를 호출하면', () => {
        it('Then: { amount: 0 }을 반환한다', async () => {
          const user = await createTestUser();

          const result = await controller.getBalance({ userId: user.id });

          expect(result).toEqual({ amount: 0 });
        });
      });
    });

    describe('Given: 잔액 5,000원인 사용자', () => {
      describe('When: getBalance를 호출하면', () => {
        it('Then: { amount: 5000 }을 반환한다', async () => {
          const user = await createTestUser();
          await cashService.addCash(user.id, 5000, '테스트 충전');

          const result = await controller.getBalance({ userId: user.id });

          expect(result).toEqual({ amount: 5000 });
        });
      });
    });
  });

  describe('getHistory', () => {
    describe('Given: history 2건이 있는 사용자', () => {
      describe('When: getHistory를 호출하면', () => {
        it('Then: items에 id, cashId, type, amount, balanceAfter, description, createdAt 필드가 포함된다', async () => {
          const user = await createTestUser();
          await cashService.addCash(user.id, 3000, '첫 번째 충전');
          await cashService.addCash(user.id, 2000, '두 번째 충전');

          const result = await controller.getHistory({
            userId: user.id,
            limit: 10,
          });

          expect(result.items).toHaveLength(2);
          for (const item of result.items) {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('cashId');
            expect(item).toHaveProperty('type');
            expect(item).toHaveProperty('amount');
            expect(item).toHaveProperty('balanceAfter');
            expect(item).toHaveProperty('description');
            expect(item).toHaveProperty('createdAt');
          }
        });

        it('Then: nextCursor가 null이다 (마지막 페이지)', async () => {
          const user = await createTestUser();
          await cashService.addCash(user.id, 3000, '첫 번째 충전');
          await cashService.addCash(user.id, 2000, '두 번째 충전');

          const result = await controller.getHistory({
            userId: user.id,
            limit: 10,
          });

          expect(result.nextCursor).toBeNull();
        });
      });
    });
  });
});
