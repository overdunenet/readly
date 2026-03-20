import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserService } from './user.service';
import { UserEntity, UserStatus } from '../domain/user.entity';

describe('UserService', () => {
  let app: TestingModule;
  let service: UserService;
  let entityManager: EntityManager;

  const createTestUser = async (
    overrides?: Partial<{
      email: string;
      nickname: string;
      profileImage: string | null;
      status: UserStatus;
    }>
  ) => {
    const user = new UserEntity();
    user.email =
      overrides?.email ??
      `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
    user.nickname =
      overrides?.nickname ?? `user-${Math.random().toString(36).slice(2, 7)}`;
    if (overrides?.profileImage !== undefined) {
      user.profileImage = overrides.profileImage;
    }
    if (overrides?.status !== undefined) {
      user.status = overrides.status;
    }
    return testingRepositoryProvider.UserRepository.save(user);
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(UserService);
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

  describe('updateProfile', () => {
    describe('Given: ACTIVE 상태의 유저가 존재할 때', () => {
      describe('When: nickname만 전달하면', () => {
        it('Then: 닉네임만 업데이트되고 profileImage는 변경되지 않는다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
            profileImage: 'original.png',
          });

          const result = await service.updateProfile(user.id, {
            nickname: 'new-nickname',
          });

          expect(result.nickname).toBe('new-nickname');
          expect(result.profileImage).toBe('original.png');
        });
      });

      describe('When: profileImage만 전달하면', () => {
        it('Then: 이미지만 업데이트되고 nickname은 변경되지 않는다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
            nickname: 'keep-this',
          });

          const result = await service.updateProfile(user.id, {
            profileImage: 'new-image.png',
          });

          expect(result.profileImage).toBe('new-image.png');
          expect(result.nickname).toBe('keep-this');
        });
      });

      describe('When: nickname과 profileImage를 동시에 전달하면', () => {
        it('Then: 둘 다 업데이트된다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
          });

          const result = await service.updateProfile(user.id, {
            nickname: 'both-updated',
            profileImage: 'both-image.png',
          });

          expect(result.nickname).toBe('both-updated');
          expect(result.profileImage).toBe('both-image.png');
        });
      });

      describe('When: profileImage를 null로 전달하면', () => {
        it('Then: 이미지가 삭제(null)된다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
            profileImage: 'to-be-deleted.png',
          });

          const result = await service.updateProfile(user.id, {
            profileImage: null,
          });

          expect(result.profileImage).toBeNull();
        });
      });

      describe('When: 자기 자신의 닉네임으로 변경하면', () => {
        it('Then: 중복이 아니므로 성공한다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
            nickname: 'same-nickname',
          });

          const result = await service.updateProfile(user.id, {
            nickname: 'same-nickname',
          });

          expect(result.nickname).toBe('same-nickname');
        });
      });

      describe('When: 닉네임을 변경해도', () => {
        it('Then: 상태는 ACTIVE를 유지한다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
          });

          const result = await service.updateProfile(user.id, {
            nickname: 'still-active',
          });

          expect(result.status).toBe(UserStatus.ACTIVE);
        });
      });
    });

    describe('Given: PENDING_PROFILE 상태의 유저가 존재할 때', () => {
      describe('When: 닉네임을 설정하면', () => {
        it('Then: ACTIVE로 상태가 전환된다', async () => {
          const user = await createTestUser({
            status: UserStatus.PENDING_PROFILE,
          });

          const result = await service.updateProfile(user.id, {
            nickname: 'onboarding-complete',
          });

          expect(result.nickname).toBe('onboarding-complete');
          expect(result.status).toBe(UserStatus.ACTIVE);
        });
      });
    });

    describe('Given: 존재하지 않는 userId로 요청할 때', () => {
      describe('When: updateProfile을 호출하면', () => {
        it('Then: NotFoundException이 발생한다', async () => {
          await expect(
            service.updateProfile('00000000-0000-0000-0000-000000000000', {
              nickname: 'ghost',
            })
          ).rejects.toThrow(NotFoundException);
        });
      });
    });

    describe('Given: PENDING_PHONE 상태의 유저가 존재할 때', () => {
      describe('When: updateProfile을 호출하면', () => {
        it('Then: ForbiddenException이 발생한다', async () => {
          const user = await createTestUser({
            status: UserStatus.PENDING_PHONE,
          });

          await expect(
            service.updateProfile(user.id, { nickname: 'not-allowed' })
          ).rejects.toThrow(ForbiddenException);
        });
      });
    });

    describe('Given: INACTIVE 상태의 유저가 존재할 때', () => {
      describe('When: updateProfile을 호출하면', () => {
        it('Then: ForbiddenException이 발생한다', async () => {
          const user = await createTestUser({
            status: UserStatus.INACTIVE,
          });

          await expect(
            service.updateProfile(user.id, { nickname: 'not-allowed' })
          ).rejects.toThrow(ForbiddenException);
        });
      });
    });

    describe('Given: 빈 문자열 닉네임으로 요청할 때', () => {
      describe('When: nickname이 빈 문자열이면', () => {
        it('Then: BadRequestException이 발생한다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
          });

          await expect(
            service.updateProfile(user.id, { nickname: '' })
          ).rejects.toThrow(BadRequestException);
        });
      });

      describe('When: nickname이 공백만 포함하면', () => {
        it('Then: BadRequestException이 발생한다', async () => {
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
          });

          await expect(
            service.updateProfile(user.id, { nickname: '   ' })
          ).rejects.toThrow(BadRequestException);
        });
      });
    });

    describe('Given: 다른 유저가 동일 닉네임을 사용 중일 때', () => {
      describe('When: 해당 닉네임으로 변경하면', () => {
        it('Then: ConflictException이 발생한다', async () => {
          await createTestUser({
            status: UserStatus.ACTIVE,
            nickname: 'taken-nickname',
          });
          const user = await createTestUser({
            status: UserStatus.ACTIVE,
          });

          await expect(
            service.updateProfile(user.id, { nickname: 'taken-nickname' })
          ).rejects.toThrow(ConflictException);
        });
      });
    });
  });
});
