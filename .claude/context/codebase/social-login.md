---
name: codebase-social-login
description: 소셜 로그인 모듈 - Strategy 패턴, OAuth 플로우, SocialAccountEntity, 프론트엔드 콜백
keywords: [소셜로그인, Naver, OAuth, Strategy, SocialAccount, 인증]
estimated_tokens: ~500
related_contexts:
  - codebase-user-entity
  - business-social-authentication
---

# 소셜 로그인 모듈

네이버 OAuth를 시작으로 소셜 로그인을 지원합니다. Strategy 패턴으로 설계되어 카카오, 구글 등 추가 Provider 확장이 용이합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/auth/auth.service.ts | 소셜 로그인 비즈니스 로직 | AuthService, socialLogin(), findOrCreateUser() |
| apps/api/src/module/auth/auth.controller.ts | Microservice 메시지 핸들러 | AuthController, @MessagePattern('auth.socialLogin') |
| apps/api/src/module/auth/auth.router.ts | tRPC 라우터 | AuthRouter, socialLogin mutation |
| apps/api/src/module/auth/auth.module.ts | NestJS 모듈 정의 | AuthModule |
| apps/api/src/module/auth/strategies/social-login.strategy.ts | Strategy 인터페이스 | SocialProvider, SocialUserProfile, SocialLoginStrategy |
| apps/api/src/module/auth/strategies/naver.strategy.ts | 네이버 OAuth 구현 | NaverStrategy, getUserProfile(), fetchAccessToken(), fetchUserProfile() |
| apps/api/src/module/domain/social-account.entity.ts | 소셜 계정 Entity | SocialAccountEntity, create(), findByProvider() |
| apps/api/src/database/migration/1773669013426-alter-user-nullable-password.ts | 마이그레이션 | password nullable 변경 |
| apps/api/src/config.ts | 네이버 OAuth 설정 | ConfigProvider.auth.naver (clientId, clientSecret, callbackUrl) |
| packages/api-types/src/server.ts | API 타입 정의 | auth.socialLogin mutation 스키마 |
| apps/client/src/routes/login.tsx | 로그인 페이지 | handleNaverLogin() (OAuth URL 생성 + state 저장) |
| apps/client/src/routes/auth/naver/callback.tsx | 네이버 콜백 처리 | NaverCallbackPage (code/state 검증 → API 호출 → 로그인) |

## 핵심 흐름

1. **프론트엔드**: 사용자가 "네이버로 로그인" 클릭 → `crypto.randomUUID()` state 생성 + `sessionStorage` 저장 → 네이버 OAuth 페이지로 리다이렉트
2. **네이버 콜백**: `/auth/naver/callback`에서 code/state 수신 → state 검증 → `auth.socialLogin` tRPC mutation 호출
3. **AuthRouter**: refreshToken은 httpOnly 쿠키로 설정, accessToken + user 정보 응답
4. **AuthService.socialLogin()**: NaverStrategy로 프로필 조회 → `findOrCreateUser()`로 사용자 매칭/생성 → `UserService.generateTokens()`로 JWT 발급
5. **findOrCreateUser()**: SocialAccount로 검색 → email로 기존 사용자 연결 → 새 사용자 생성 (3단계 순차 탐색)

## Strategy 패턴

```
SocialLoginStrategy (인터페이스)
├── NaverStrategy   ← 현재 구현됨
├── KakaoStrategy   ← 미구현 (확장 예정)
└── GoogleStrategy  ← 미구현 (확장 예정)
```

- `SocialProvider` 타입: `'naver' | 'kakao' | 'google'`
- `SocialUserProfile`: providerId, provider, email, nickname, profileImage

## SocialAccountEntity 구조

- 테이블: `social_accounts`
- UserEntity와 OneToOne 관계 (userId FK)
- Provider별 ID 컬럼: naverId, kakaoId, googleId (모두 nullable)
- Repository 확장: `findByUserId()`, `findByProvider()`

## 사용자 매칭 로직

1. `findByProvider()`: SocialAccount에서 provider+providerId로 기존 사용자 검색
2. `linkSocialAccountToExistingUser()`: email로 기존 사용자 찾아 SocialAccount 연결 (TODO: 본인인증으로 변경 필요)
3. `createUserWithSocialAccount()`: 새 UserEntity 생성 (password: null) + SocialAccount 생성

## 관련 Business Context

- [social-authentication.md](../business/social-authentication.md)

## 관련 Codebase Context

- [user-entity.md](./user-entity.md): UserEntity 구조 (password nullable 변경)
