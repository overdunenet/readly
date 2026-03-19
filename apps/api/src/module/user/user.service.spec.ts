import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

describe('UserService', () => {
  let app: TestingModule;
  let entityManager: EntityManager;

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
  });

  afterAll(async () => {
    await app.close();
    await DataSources.readly.destroy();
  });

  beforeEach(async () => {
    entityManager = await getTestingEntityManager();
  });

  afterEach(async () => {
    // 트랜잭션 rollback → DB에 데이터 남지 않음
    if (entityManager?.queryRunner?.isTransactionActive) {
      await entityManager.queryRunner.rollbackTransaction();
    }
    if (entityManager?.queryRunner && !entityManager.queryRunner.isReleased) {
      await entityManager.queryRunner.release();
    }
  });

  describe('Given: 테스트 DB가 정상 연결된 상태', () => {
    it('Then: User를 저장하고 조회할 수 있다', async () => {
      // When: UserRepository로 유저를 저장한다
      const user = testingRepositoryProvider.UserRepository.create({
        email: 'test@example.com',
        nickname: 'tester',
      });
      const savedUser =
        await testingRepositoryProvider.UserRepository.save(user);

      // Then: 저장된 유저를 조회할 수 있다
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.nickname).toBe('tester');

      // And: findOneBy로 조회할 수 있다
      const foundUser =
        await testingRepositoryProvider.UserRepository.findOneBy({
          id: savedUser.id,
        });

      expect(foundUser).not.toBeNull();
      expect(foundUser!.email).toBe('test@example.com');
      expect(foundUser!.nickname).toBe('tester');
    });

    it('Then: 트랜잭션 rollback으로 이전 테스트 데이터가 남아있지 않다', async () => {
      // When: 이전 테스트에서 저장한 이메일로 조회한다
      const user = await testingRepositoryProvider.UserRepository.findOneBy({
        email: 'test@example.com',
      });

      // Then: rollback되어 데이터가 존재하지 않는다
      expect(user).toBeNull();
    });
  });
});
