import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CashService } from './cash.service';
import { UserEntity, UserStatus } from '../domain/user.entity';
import { CashBalanceEntity } from '../domain/cash-balance.entity';
import { CashHistoryType } from '../domain/cash-history.entity';

describe('CashService', () => {
  let app: TestingModule;
  let service: CashService;
  let entityManager: EntityManager;

  const createTestUser = async () => {
    const user = new UserEntity();
    user.email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname = `user-${Math.random().toString(36).slice(2, 7)}`;
    user.status = UserStatus.ACTIVE;
    return testingRepositoryProvider.UserRepository.save(user);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(CashService);
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
    describe('Given: 잔액 레코드가 없는 사용자', () => {
      describe('When: getBalance를 호출하면', () => {
        it('Then: null을 반환한다', async () => {
          const user = await createTestUser();

          const result = await service.getBalance(user.id);

          expect(result).toBeNull();
        });
      });
    });

    describe('Given: 잔액 5,000원인 사용자', () => {
      describe('When: getBalance를 호출하면', () => {
        it('Then: amount가 5000인 CashBalanceEntity를 반환한다', async () => {
          const user = await createTestUser();
          const balance = CashBalanceEntity.create(user.id);
          balance.amount = 5000;
          await testingRepositoryProvider.CashBalanceRepository.save(balance);

          const result = await service.getBalance(user.id);

          expect(result).not.toBeNull();
          expect(result!.amount).toBe(5000);
          expect(result!.userId).toBe(user.id);
        });
      });
    });
  });

  describe('addCash', () => {
    describe('Given: 캐시가 없는 사용자', () => {
      describe('When: 10,000원을 addCash하면', () => {
        let user: UserEntity;

        beforeEach(async () => {
          user = await createTestUser();
        });

        it('Then: cash 레코드가 생성되고 initialAmount/currentAmount가 10000이다', async () => {
          const cash = await service.addCash(user.id, 10000, '테스트 충전');

          expect(cash.userId).toBe(user.id);
          expect(cash.initialAmount).toBe(10000);
          expect(cash.currentAmount).toBe(10000);
          expect(cash.id).toBeDefined();
        });

        it('Then: cashBalance가 10,000원으로 생성된다', async () => {
          await service.addCash(user.id, 10000, '테스트 충전');

          const balance = await service.getBalance(user.id);
          expect(balance).not.toBeNull();
          expect(balance!.amount).toBe(10000);
        });

        it('Then: CHARGE 타입 history가 기록되고 balanceAfter가 10000이다', async () => {
          await service.addCash(user.id, 10000, '테스트 충전');

          const { items } = await service.getHistory(user.id);
          expect(items).toHaveLength(1);
          expect(items[0].type).toBe(CashHistoryType.CHARGE);
          expect(items[0].amount).toBe(10000);
          expect(items[0].balanceAfter).toBe(10000);
          expect(items[0].description).toBe('테스트 충전');
        });

        it('Then: history에 groupKey(UUID)가 설정된다', async () => {
          await service.addCash(user.id, 10000, '테스트 충전');

          const { items } = await service.getHistory(user.id);
          expect(items[0].groupKey).toBeDefined();
          expect(items[0].groupKey).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
          );
        });
      });
    });

    describe('Given: 이미 5,000원 잔액이 있는 사용자', () => {
      describe('When: 3,000원을 addCash하면', () => {
        it('Then: 새 cash 레코드가 추가되고 cashBalance가 8,000원이 된다', async () => {
          const user = await createTestUser();
          await service.addCash(user.id, 5000, '첫 충전');

          const newCash = await service.addCash(user.id, 3000, '추가 충전');

          expect(newCash.initialAmount).toBe(3000);
          expect(newCash.currentAmount).toBe(3000);

          const balance = await service.getBalance(user.id);
          expect(balance!.amount).toBe(8000);
        });
      });
    });
  });

  describe('removeCash', () => {
    describe('Given: 잔액이 0원인 사용자', () => {
      describe('When: 1,000원을 removeCash하면', () => {
        it('Then: BadRequestException("캐시 잔액이 부족합니다")을 던진다', async () => {
          const user = await createTestUser();
          await service.syncBalance(user.id);

          await expect(
            service.removeCash(user.id, 1000, '테스트 차감')
          ).rejects.toThrow(BadRequestException);

          await expect(
            service.removeCash(user.id, 1000, '테스트 차감')
          ).rejects.toThrow('캐시 잔액이 부족합니다');
        });
      });
    });

    describe('Given: 5,000원짜리 cash row 1개가 있는 사용자', () => {
      describe('When: 3,000원을 removeCash하면', () => {
        let user: UserEntity;

        beforeEach(async () => {
          user = await createTestUser();
          await service.addCash(user.id, 5000, '충전');
        });

        it('Then: 해당 cash row의 currentAmount가 2,000원이 된다', async () => {
          await service.removeCash(user.id, 3000, '차감');

          const cashRows = await testingRepositoryProvider.CashRepository.find({
            where: { userId: user.id },
          });
          expect(cashRows).toHaveLength(1);
          expect(cashRows[0].currentAmount).toBe(2000);
        });

        it('Then: cashBalance가 2,000원으로 동기화된다', async () => {
          await service.removeCash(user.id, 3000, '차감');

          const balance = await service.getBalance(user.id);
          expect(balance!.amount).toBe(2000);
        });

        it('Then: history의 amount가 -3000이다', async () => {
          await service.removeCash(user.id, 3000, '차감');

          const { items } = await service.getHistory(user.id);
          const purchaseHistory = items.find(
            h => h.type === CashHistoryType.PURCHASE
          );
          expect(purchaseHistory).toBeDefined();
          expect(purchaseHistory!.amount).toBe(-3000);
        });
      });
    });

    describe('Given: 2,000원, 3,000원 cash row 2개가 있는 사용자 (오래된 순)', () => {
      describe('When: 4,000원을 removeCash하면', () => {
        let user: UserEntity;

        beforeEach(async () => {
          user = await createTestUser();
          await service.addCash(user.id, 2000, '첫 충전');
          await service.addCash(user.id, 3000, '두번째 충전');
        });

        it('Then: 첫 번째 row의 currentAmount가 0원, 두 번째가 1,000원이 된다 (FIFO)', async () => {
          await service.removeCash(user.id, 4000, '차감');

          const cashRows = await testingRepositoryProvider.CashRepository.find({
            where: { userId: user.id },
            order: { createdAt: 'ASC' },
          });
          expect(cashRows).toHaveLength(2);
          expect(cashRows[0].currentAmount).toBe(0);
          expect(cashRows[1].currentAmount).toBe(1000);
        });

        it('Then: history가 2개 생성되고 동일한 groupKey를 공유한다', async () => {
          await service.removeCash(user.id, 4000, '차감');

          const { items } = await service.getHistory(user.id);
          const purchaseHistories = items.filter(
            h => h.type === CashHistoryType.PURCHASE
          );
          expect(purchaseHistories).toHaveLength(2);
          expect(purchaseHistories[0].groupKey).toBe(
            purchaseHistories[1].groupKey
          );
        });

        it('Then: 첫 번째 history amount는 -2000, 두 번째는 -2000이다', async () => {
          await service.removeCash(user.id, 4000, '차감');

          const { items } = await service.getHistory(user.id);
          const purchaseHistories = items
            .filter(h => h.type === CashHistoryType.PURCHASE)
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          expect(purchaseHistories[0].amount).toBe(-2000);
          expect(purchaseHistories[1].amount).toBe(-2000);
        });

        it('Then: 두 history 모두 balanceAfter가 1,000원이다', async () => {
          await service.removeCash(user.id, 4000, '차감');

          const { items } = await service.getHistory(user.id);
          const purchaseHistories = items.filter(
            h => h.type === CashHistoryType.PURCHASE
          );
          expect(purchaseHistories[0].balanceAfter).toBe(1000);
          expect(purchaseHistories[1].balanceAfter).toBe(1000);
        });
      });
    });
  });

  describe('charge', () => {
    describe('Given: 유효한 사용자', () => {
      let user: UserEntity;

      beforeEach(async () => {
        user = await createTestUser();
      });

      describe('When: 999원으로 charge하면', () => {
        it('Then: BadRequestException을 던진다', async () => {
          await expect(service.charge(user.id, 999)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.charge(user.id, 999)).rejects.toThrow(
            '충전 금액은 1,000원 이상 1,000,000원 이하입니다'
          );
        });
      });

      describe('When: 1,000,001원으로 charge하면', () => {
        it('Then: BadRequestException을 던진다', async () => {
          await expect(service.charge(user.id, 1000001)).rejects.toThrow(
            BadRequestException
          );
          await expect(service.charge(user.id, 1000001)).rejects.toThrow(
            '충전 금액은 1,000원 이상 1,000,000원 이하입니다'
          );
        });
      });

      describe('When: 10,000원으로 charge하면', () => {
        it('Then: addCash가 호출되어 cash 레코드가 생성된다', async () => {
          const cash = await service.charge(user.id, 10000);

          expect(cash.userId).toBe(user.id);
          expect(cash.initialAmount).toBe(10000);
          expect(cash.currentAmount).toBe(10000);
        });

        it('Then: description이 "캐시 충전 10,000원"이다', async () => {
          await service.charge(user.id, 10000);

          const { items } = await service.getHistory(user.id);
          expect(items).toHaveLength(1);
          expect(items[0].description).toBe('캐시 충전 10,000원');
        });
      });
    });
  });

  describe('syncBalance', () => {
    describe('Given: cash row가 없는 사용자', () => {
      describe('When: syncBalance를 호출하면', () => {
        it('Then: cashBalance가 0원으로 생성된다', async () => {
          const user = await createTestUser();

          const result = await service.syncBalance(user.id);

          expect(result).toBe(0);
          const balance = await service.getBalance(user.id);
          expect(balance).not.toBeNull();
          expect(balance!.amount).toBe(0);
        });
      });
    });

    describe('Given: currentAmount 3,000원, 2,000원인 cash row 2개', () => {
      describe('When: syncBalance를 호출하면', () => {
        it('Then: cashBalance가 5,000원으로 업데이트된다', async () => {
          const user = await createTestUser();
          await service.addCash(user.id, 3000, '첫 충전');
          await service.addCash(user.id, 2000, '두번째 충전');

          const result = await service.syncBalance(user.id);

          expect(result).toBe(5000);
          const balance = await service.getBalance(user.id);
          expect(balance!.amount).toBe(5000);
        });
      });
    });
  });

  describe('getHistory', () => {
    describe('Given: history 5건이 있는 사용자', () => {
      let user: UserEntity;

      beforeEach(async () => {
        user = await createTestUser();
        for (let i = 1; i <= 5; i++) {
          await service.addCash(user.id, 1000 * i, `충전 ${i}`);
        }
        // 커서 기반 페이지네이션 테스트를 위해 createdAt을 명확히 분리
        const histories =
          await testingRepositoryProvider.CashHistoryRepository.find({
            where: { userId: user.id },
            order: { id: 'ASC' },
          });
        const baseTime = Date.now();
        for (let i = 0; i < histories.length; i++) {
          await testingRepositoryProvider.CashHistoryRepository.update(
            { id: histories[i].id },
            {
              createdAt: new Date(baseTime - (histories.length - 1 - i) * 1000),
            }
          );
        }
      });

      describe('When: limit 3으로 getHistory를 호출하면', () => {
        it('Then: items 3건과 nextCursor를 반환한다', async () => {
          const result = await service.getHistory(user.id, undefined, 3);

          expect(result.items).toHaveLength(3);
          expect(result.nextCursor).not.toBeNull();
        });
      });

      describe('When: nextCursor로 다음 페이지를 요청하면', () => {
        it('Then: 나머지 2건과 nextCursor null을 반환한다', async () => {
          const firstPage = await service.getHistory(user.id, undefined, 3);
          const secondPage = await service.getHistory(
            user.id,
            firstPage.nextCursor!,
            3
          );

          expect(secondPage.items).toHaveLength(2);
          expect(secondPage.nextCursor).toBeNull();
        });
      });
    });

    describe('Given: 다른 사용자의 history cursor', () => {
      describe('When: 해당 cursor로 getHistory를 호출하면', () => {
        it('Then: cursor를 무시하고 첫 페이지를 반환한다', async () => {
          const user1 = await createTestUser();
          const user2 = await createTestUser();

          await service.addCash(user1.id, 1000, '유저1 충전');
          await service.addCash(user2.id, 2000, '유저2 충전 1');
          await service.addCash(user2.id, 3000, '유저2 충전 2');

          // user1의 history cursor를 가져온다
          const user1History = await service.getHistory(user1.id);
          const user1Cursor = user1History.items[0].id;

          // user2의 getHistory에 user1의 cursor를 전달한다
          const result = await service.getHistory(user2.id, user1Cursor, 10);

          // cursor의 userId가 user2가 아니므로 무시되고 첫 페이지가 반환된다
          expect(result.items).toHaveLength(2);
        });
      });
    });
  });
});
