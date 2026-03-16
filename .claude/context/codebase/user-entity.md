---
name: codebase-user-entity
description: UserEntity 구조, 비밀번호 관리, JWT 인증 설정, SocialAccount 관계, 프론트엔드 인증 스토어
keywords: [UserEntity, JWT, bcrypt, 인증, 로그인, AccessToken, RefreshToken, Zustand, useAuthStore, SocialAccount]
estimated_tokens: ~400
related_contexts:
  - business-overview
  - codebase-architecture-overview
  - codebase-social-login
---

# UserEntity 및 인증

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/domain/user.entity.ts | 사용자 Entity | UserEntity, setPassword(), checkPassword(), register() |
| apps/api/src/module/user/user.service.ts | 사용자 비즈니스 로직 | UserService, login(), register(), refreshToken(), getMe(), generateTokens() |
| apps/api/src/config.ts | JWT/OAuth 설정 | ConfigProvider.auth.jwt, ConfigProvider.auth.naver |
| apps/client/src/stores/auth.ts | 인증 상태 관리 (Zustand) | User, useAuthStore |
| apps/client/src/components/layout/UserMenu.tsx | 사용자 드롭다운 메뉴 | UserMenu |

## UserEntity 구조

- 테이블: `users`
- 컬럼: email (unique), password (nullable, bcrypt 해시), nickname, profileImage (nullable), deletedAt (Soft Delete)
- 관계: SocialAccountEntity와 OneToOne
- password가 null인 경우: 소셜 로그인으로 가입한 사용자

## 비즈니스 로직

### 비밀번호 관리

- `setPassword(plainPassword)`: bcrypt.hash(plainPassword, 10)으로 해싱 후 저장
- `checkPassword(plainPassword)`: password가 null이면 false 반환, 아니면 bcrypt.compare로 검증

### Factory Method

- `UserEntity.register(input)`: email, nickname 설정 + setPassword 호출 후 UserEntity 반환

### Repository 확장

- `getUserRepository(source?)`: getEntityManager(source).getRepository(UserEntity).extend로 register 메서드 추가

## UserService 주요 메서드

| 메서드 | 설명 |
| ------ | ---- |
| `register(input)` | 이메일 중복 체크 후 회원가입 |
| `login(credentials)` | 로그인 (JWT 발급) |
| `refreshToken(token)` | Refresh Token 검증 후 새 토큰 쌍 발급 |
| `getMe(userId)` | 내 정보 조회 |
| `generateTokens(user)` | JWT Access/Refresh 토큰 쌍 생성 (AuthService에서도 재사용) |

### 로그인 흐름

1. `findOneByOrFail({ email })` → 이메일로 사용자 조회 (실패 시 UnauthorizedException)
2. `user.checkPassword(password)` → 비밀번호 검증 (소셜 로그인 사용자는 false)
3. `generateTokens(user)` → JWT 토큰 쌍 생성
4. `{ ...tokens, user }` 반환

## UserRouter (tRPC)

### Mutations

| 엔드포인트 | 설명 | 인증 |
| ---------- | ---- | ---- |
| `user.register` | 회원가입 | 불필요 |
| `user.login` | 로그인 | 불필요 |
| `user.refreshToken` | 토큰 갱신 | 쿠키만 |
| `user.logout` | 로그아웃 | 불필요 |

### Queries

| 엔드포인트 | 설명 | 인증 |
| ---------- | ---- | ---- |
| `user.me` | 내 정보 조회 | 필요 |

### 쿠키 기반 인증

- UserRouter의 login mutation: microserviceClient로 user.login 호출 → refreshToken은 httpOnly 쿠키 설정 → accessToken + user 정보만 응답

## JWT 설정

- Access Token: secret + expiresIn '15m' (15분)
- Refresh Token: secret + expiresIn '7d' (7일)
- 설정 위치: ConfigProvider.auth.jwt.user

## 테스트

| 파일 | 역할 | 테스트 범위 |
| ---- | ---- | ----------- |
| apps/api/src/module/user/user.service.spec.ts | 기본 통합 테스트 | Repository 접근, register, 중복 이메일 검증 |
| apps/api/src/module/user/user.service.auth.spec.ts | 인증 통합 테스트 | register, login, refreshToken, getMe, 통합 플로우 |

- 통합 테스트: 실제 DB (Docker PostgreSQL), 트랜잭션 rollback 격리
- 테스트 인프라: `@test/jest-util`의 `getTestingModule()`, `getTestingEntityManager()` 사용

## 프론트엔드 인증

### User 타입

- `stores/auth.ts`에서 `User` 인터페이스 export (id, email, nickname, profileImage)

### useAuthStore (Zustand)

| 속성/메서드 | 설명 |
| ----------- | ---- |
| user | 현재 로그인 사용자 (User \| null) |
| accessToken | JWT 액세스 토큰 |
| login(data) | 사용자 정보 + 토큰 설정 |
| logout() | 상태 초기화 |

### UserMenu 컴포넌트

- 드롭다운 메뉴: 글쓰기(/editor), 내 포스트(/editor/posts), 설정(/editor/settings), 로그아웃
- tailwind-styled-components로 스타일링

## 관련 Codebase Context

- [post-entity.md](./post-entity.md): PostEntity와 User 관계
- [architecture-overview.md](./architecture-overview.md): API 아키텍처
- [social-login.md](./social-login.md): 소셜 로그인 모듈 (AuthService, SocialAccountEntity)
- [test-infrastructure.md](./test-infrastructure.md): 테스트 인프라 유틸리티
