---
name: codebase-user-entity
description: UserEntity 구조, 비밀번호 관리, JWT 인증 설정
keywords: [UserEntity, JWT, bcrypt, 인증, 로그인, AccessToken, RefreshToken]
estimated_tokens: ~500
related_contexts:
  - business-overview
  - codebase-architecture-overview
---

# UserEntity 및 인증

## UserEntity 구조

```typescript
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string; // bcrypt 해시

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ nullable: true, type: 'varchar' })
  profileImage: string | null;

  @DeleteDateColumn()
  deletedAt: Date | null; // Soft Delete
}
```

## 비즈니스 로직

### 비밀번호 관리

```typescript
// 비밀번호 설정 (해싱)
async setPassword(plainPassword: string): Promise<void> {
  this.password = await bcrypt.hash(plainPassword, 10);
}

// 비밀번호 검증
async checkPassword(plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.password);
}
```

### Factory Method

```typescript
static async register(input: {
  email: string;
  password: string;
  nickname: string;
}): Promise<UserEntity> {
  const user = new UserEntity();
  user.email = input.email;
  user.nickname = input.nickname;
  await user.setPassword(input.password);
  return user;
}
```

## Repository 확장

```typescript
export const getUserRepository = (source?) =>
  getEntityManager(source)
    .getRepository(UserEntity)
    .extend({
      async register(input: RegisterInput): Promise<UserEntity> {
        const user = await UserEntity.register(input);
        return this.save(user);
      },
    });
```

## UserService 주요 메서드

| 메서드                | 설명              |
| --------------------- | ----------------- |
| `register(input)`     | 회원가입          |
| `login(credentials)`  | 로그인 (JWT 발급) |
| `refreshToken(token)` | 토큰 갱신         |
| `getMe(userId)`       | 내 정보 조회      |

### 로그인 흐름

```typescript
async login(credentials: LoginInput): Promise<LoginResponse> {
  // 1. 이메일로 사용자 찾기
  const user = await this.repositoryProvider.UserRepository
    .findOneByOrFail({ email })
    .catch(() => {
      throw new UnauthorizedException('Invalid email or password');
    });

  // 2. 비밀번호 검증
  const isValid = await user.checkPassword(password);
  if (!isValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 3. JWT 토큰 생성
  const tokens = await this.generateTokens(user);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: this.mapUserToInfo(user),
  };
}
```

## UserRouter (tRPC)

### Mutations

| 엔드포인트          | 설명      | 인증   |
| ------------------- | --------- | ------ |
| `user.register`     | 회원가입  | 불필요 |
| `user.login`        | 로그인    | 불필요 |
| `user.refreshToken` | 토큰 갱신 | 쿠키만 |
| `user.logout`       | 로그아웃  | 불필요 |

### Queries

| 엔드포인트 | 설명         | 인증 |
| ---------- | ------------ | ---- |
| `user.me`  | 내 정보 조회 | 필요 |

### 쿠키 기반 인증

```typescript
@Mutation({ input: loginSchema, output: loginResponseSchema })
async login(@Input('email') email: string, @Ctx() ctx: any) {
  const result = await this.microserviceClient.send('user.login', { email, password });

  // refreshToken은 쿠키로 설정 (httpOnly, secure)
  this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

  // accessToken만 응답으로 반환
  return {
    accessToken: result.accessToken,
    user: result.user,
  };
}
```

## JWT 설정

설정 파일: `apps/api/config/default.js`

| 구분 | 환경변수 | 만료 |
| ---- | -------- | ---- |
| Backoffice Access | `JWT_BACKOFFICE_ACCESS_SECRET` | 1h |
| Backoffice Refresh | `JWT_BACKOFFICE_REFRESH_SECRET` | 30d |
| User Access | `JWT_USER_ACCESS_SECRET` | 1h |
| User Refresh | `JWT_USER_REFRESH_SECRET` | 7d |

- Backoffice와 User 각각 별도의 Access/Refresh secret 사용
- 각 JWT secret은 환경변수로 주입

## 테스트

### 파일 구조

| 파일 | 역할 | 테스트 범위 |
| ---- | ---- | ----------- |
| apps/api/src/module/user/user.service.spec.ts | UserService 기본 통합 테스트 | Repository 접근, register, 중복 이메일 검증 |
| apps/api/src/module/user/user.service.auth.spec.ts | UserService 인증 통합 테스트 | register, login, refreshToken, getMe, 통합 플로우 |

### 테스트 패턴

- **통합 테스트**: 실제 DB (Docker PostgreSQL) 사용, 트랜잭션 rollback 격리
- **생명주기**: beforeAll에서 DataSource 초기화 + TestingModule 생성, afterAll에서 정리
- **격리**: beforeEach에서 트랜잭션 시작, afterEach에서 rollback
- **테스트 인프라**: `@test/jest-util`의 `getTestingModule()`, `getTestingEntityManager()` 사용

### 관련 Codebase Context

- [test-infrastructure.md](./test-infrastructure.md): 테스트 인프라 유틸리티

## 관련 문서

- `codebase/post-entity.md`: PostEntity와 User 관계
- `codebase/architecture-overview.md`: API 아키텍처
