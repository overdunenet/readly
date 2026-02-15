import { DataSources } from '@src/database/datasources';
import {
  getTestingEntityManager,
  getTestingModule,
  testingRepositoryProvider,
} from '@test/jest-util';
import { TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('UserService - Auth', () => {
  let app: TestingModule;
  let service: UserService;
  let jwtService: JwtService;
  let entityManager: EntityManager;

  const defaultUser = {
    email: 'auth-test@example.com',
    password: 'password123',
    nickname: 'auth-tester',
  };

  const createTestUser = async (overrides?: Partial<typeof defaultUser>) => {
    const input = { ...defaultUser, ...overrides };
    const result = await service.register(input);
    return { ...result.user, password: input.password };
  };

  const createAndLoginTestUser = async (
    overrides?: Partial<typeof defaultUser>
  ) => {
    const user = await createTestUser(overrides);
    const loginResult = await service.login({
      email: user.email,
      password: user.password,
    });
    return { ...loginResult, password: user.password };
  };

  beforeAll(async () => {
    await DataSources.readly.initialize();
    app = await getTestingModule();
    service = app.get(UserService);
    jwtService = app.get(JwtService);
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

  describe('register()', () => {
    it('유효한 정보로 register → 사용자 생성, id/email/nickname 반환', async () => {
      const result = await service.register(defaultUser);

      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(defaultUser.email);
      expect(result.user.nickname).toBe(defaultUser.nickname);
    });

    it('register 후 비밀번호가 bcrypt로 해싱 저장', async () => {
      await service.register(defaultUser);

      const savedUser =
        await testingRepositoryProvider.UserRepository.findOneBy({
          email: defaultUser.email,
        });

      expect(savedUser).not.toBeNull();
      expect(savedUser!.password).not.toBe(defaultUser.password);
      expect(
        await bcrypt.compare(defaultUser.password, savedUser!.password)
      ).toBe(true);
    });

    it('중복 이메일 register → ConflictException', async () => {
      await service.register(defaultUser);

      await expect(
        service.register({
          email: defaultUser.email,
          password: 'other-password',
          nickname: 'other-nickname',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login()', () => {
    it('올바른 credentials → accessToken, refreshToken, user 반환', async () => {
      const user = await createTestUser();

      const result = await service.login({
        email: user.email,
        password: user.password,
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.user.email).toBe(user.email);
      expect(result.user.nickname).toBe(user.nickname);
    });

    it('accessToken이 유효한 JWT이고 올바른 payload 포함', async () => {
      const { accessToken, user } = await createAndLoginTestUser();

      const payload = jwtService.verify(accessToken, {
        secret: 'TEST_USER_ACCESS',
      });

      expect(payload.sub).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload.type).toBe('user');
    });

    it('refreshToken이 유효한 JWT이고 올바른 payload 포함', async () => {
      const { refreshToken, user } = await createAndLoginTestUser();

      const payload = jwtService.verify(refreshToken, {
        secret: 'TEST_USER_REFRESH',
      });

      expect(payload.sub).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload.type).toBe('user');
    });

    it('존재하지 않는 이메일 → UnauthorizedException', async () => {
      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('틀린 비밀번호 → UnauthorizedException', async () => {
      await createTestUser();

      await expect(
        service.login({
          email: defaultUser.email,
          password: 'wrong-password',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken()', () => {
    it('유효한 refreshToken → 새 accessToken/refreshToken 반환', async () => {
      const { refreshToken } = await createAndLoginTestUser();

      const result = await service.refreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('반환된 새 accessToken이 유효한 JWT', async () => {
      const { refreshToken } = await createAndLoginTestUser();

      const result = await service.refreshToken(refreshToken);

      const payload = jwtService.verify(result.accessToken, {
        secret: 'TEST_USER_ACCESS',
      });

      expect(payload.sub).toBeDefined();
      expect(payload.email).toBeDefined();
      expect(payload.type).toBe('user');
    });

    it('잘못된 문자열 → UnauthorizedException', async () => {
      await expect(
        service.refreshToken('invalid-token-string')
      ).rejects.toThrow('Invalid refresh token');
    });

    it('다른 secret으로 서명된 토큰 → UnauthorizedException', async () => {
      const user = await createTestUser();
      const fakeToken = jwt.sign(
        { sub: user.id, email: user.email, type: 'user' },
        'WRONG_SECRET',
        { expiresIn: '7d' }
      );

      await expect(service.refreshToken(fakeToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('getMe()', () => {
    it('올바른 userId → 사용자 정보 반환', async () => {
      const user = await createTestUser();

      const result = await service.getMe(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.nickname).toBe(user.nickname);
      expect(result).toHaveProperty('profileImage');
    });

    it('존재하지 않는 UUID → NotFoundException', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      await expect(service.getMe(fakeUuid)).rejects.toThrow('User not found');
    });

    it('soft-delete된 사용자 → NotFoundException', async () => {
      const user = await createTestUser();

      await testingRepositoryProvider.UserRepository.softDelete(user.id);

      await expect(service.getMe(user.id)).rejects.toThrow('User not found');
    });
  });

  describe('통합 플로우', () => {
    it('register → login → refreshToken → getMe 전체 플로우', async () => {
      // 1. Register
      const registerResult = await service.register({
        email: 'flow-test@example.com',
        password: 'flow-password',
        nickname: 'flow-tester',
      });
      expect(registerResult.user.id).toBeDefined();

      // 2. Login
      const loginResult = await service.login({
        email: 'flow-test@example.com',
        password: 'flow-password',
      });
      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.refreshToken).toBeDefined();
      expect(loginResult.user.id).toBe(registerResult.user.id);

      // 3. Refresh Token
      const refreshResult = await service.refreshToken(
        loginResult.refreshToken
      );
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.user.id).toBe(registerResult.user.id);

      // 4. Get Me
      const meResult = await service.getMe(registerResult.user.id);
      expect(meResult.id).toBe(registerResult.user.id);
      expect(meResult.email).toBe('flow-test@example.com');
      expect(meResult.nickname).toBe('flow-tester');
    });
  });
});
