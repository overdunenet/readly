---
name: codebase-user-entity
description: UserEntity 구조, JWT 인증 설정, SocialAccount 관계, 프론트엔드 User 타입 및 인증 스토어
keywords:
  [
    UserEntity,
    JWT,
    인증,
    소셜로그인,
    AccessToken,
    RefreshToken,
    Zustand,
    useAuthStore,
    UserMenu,
    SocialAccount,
  ]
estimated_tokens: ~400
related_contexts:
  - business-overview
  - codebase-architecture-overview
  - codebase-social-login
---

# UserEntity 및 인증

## UserEntity 구조

```typescript
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ nullable: true, type: 'varchar' })
  profileImage: string | null;

  @DeleteDateColumn()
  deletedAt: Date | null; // Soft Delete

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null; // 전화번호 인증 후 저장

  @OneToMany(() => SocialAccountEntity, socialAccount => socialAccount.user)
  socialAccounts: SocialAccountEntity[];
}
```

> **Note**: password 컬럼은 소셜 로그인 전환 완료 후 제거됨. 인증은 소셜 로그인(네이버/카카오)으로만 수행.

## Repository

```typescript
export const getUserRepository = (source?) =>
  getEntityManager(source).getRepository(UserEntity);
```

## UserService 주요 메서드

| 메서드                 | 설명                                        |
| ---------------------- | ------------------------------------------- |
| `refreshToken(token)`  | 토큰 갱신                                   |
| `getMe(userId)`        | 내 정보 조회                                |
| `generateTokens(user)` | JWT 토큰 쌍 생성 (AuthService에서도 재사용) |

## UserRouter (tRPC)

### Mutations

| 엔드포인트          | 설명      | 인증   |
| ------------------- | --------- | ------ |
| `user.refreshToken` | 토큰 갱신 | 쿠키만 |
| `user.logout`       | 로그아웃  | 불필요 |

### Queries

| 엔드포인트 | 설명         | 인증 |
| ---------- | ------------ | ---- |
| `user.me`  | 내 정보 조회 | 필요 |

### 쿠키 기반 인증

refreshToken은 httpOnly/secure 쿠키로 관리. accessToken만 응답으로 반환.

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

## 테스트

### 파일 구조

| 파일                                          | 역할                         | 테스트 범위                                      |
| --------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| apps/api/src/module/user/user.service.spec.ts | UserService 기본 통합 테스트 | Repository 접근, DB 연결, 트랜잭션 rollback 검증 |

### 테스트 패턴

- **통합 테스트**: 실제 DB (Docker PostgreSQL) 사용, 트랜잭션 rollback 격리
- **생명주기**: beforeAll에서 DataSource 초기화 + TestingModule 생성, afterAll에서 정리
- **격리**: beforeEach에서 트랜잭션 시작, afterEach에서 rollback
- **테스트 인프라**: `@test/jest-util`의 `getTestingModule()`, `getTestingEntityManager()` 사용

### 관련 Codebase Context

- [test-infrastructure.md](./test-infrastructure.md): 테스트 인프라 유틸리티

## 프론트엔드 User 타입

### 파일 구조

| 파일                                           | 역할                     | 핵심 export        |
| ---------------------------------------------- | ------------------------ | ------------------ |
| apps/client/src/stores/auth.ts                 | 인증 상태 관리 (Zustand) | User, useAuthStore |
| apps/client/src/components/layout/UserMenu.tsx | 사용자 드롭다운 메뉴     | UserMenu           |

### User 타입 정의

`stores/auth.ts`에서 `User` 인터페이스를 export하여 프론트엔드 전역에서 재사용합니다.
필드: id, email, nickname, profileImage (API 응답과 동일한 구조)

### useAuthStore (Zustand)

| 속성/메서드 | 설명                              |
| ----------- | --------------------------------- |
| user        | 현재 로그인 사용자 (User \| null) |
| accessToken | JWT 액세스 토큰                   |
| login(data) | 사용자 정보 + 토큰 설정           |
| logout()    | 상태 초기화                       |

### UserMenu 컴포넌트

- `stores/auth`의 `User` 타입을 import하여 사용
- 드롭다운 메뉴: 글쓰기(/editor), 내 포스트(/editor/posts), 설정(/editor/settings), 로그아웃
- tailwind-styled-components로 스타일링

## 관련 문서

- `codebase/post-entity.md`: PostEntity와 User 관계
- `codebase/architecture-overview.md`: API 아키텍처
- `codebase/social-login.md`: 소셜 로그인 모듈 (AuthService, SocialAccountEntity)
- `codebase/otp-phone-verification.md`: OTP 전화번호 인증 모듈
