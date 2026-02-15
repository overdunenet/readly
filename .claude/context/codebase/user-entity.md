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

```typescript
// ConfigProvider
auth: {
  jwt: {
    user: {
      access: {
        secret: string,
        expiresIn: '15m',  // 15분
      },
      refresh: {
        secret: string,
        expiresIn: '7d',   // 7일
      },
    },
  },
}
```

### 타입 호환성 참고

- `ConfigProvider.auth.jwt.user.access.expiresIn` 값을 `JwtModule.register()` 및 `JwtService.signAsync()`에 전달할 때 `as any` 타입 캐스트 사용
- 원인: `@nestjs/jwt`의 `expiresIn` 타입과 ConfigProvider 반환 타입 간 호환성 불일치
- 관련 파일: `apps/api/src/module/user/user.module.ts`, `apps/api/src/module/user/user.service.ts`

## 관련 문서

- `codebase/post-entity.md`: PostEntity와 User 관계
- `codebase/architecture-overview.md`: API 아키텍처
