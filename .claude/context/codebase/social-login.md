---
name: codebase-social-login
description: 소셜 로그인 모듈 - Strategy 패턴, OAuth 플로우 (네이버+카카오), SocialAccountEntity, 공통 콜백 UI
keywords: [소셜로그인, Naver, Kakao, OAuth, Strategy, SocialAccount, 인증]
estimated_tokens: ~600
related_contexts:
  - codebase-user-entity
  - business-social-authentication
---

# 소셜 로그인 모듈

네이버, 카카오 OAuth를 지원하는 소셜 로그인 모듈입니다. Strategy 패턴으로 설계되어 구글 등 추가 Provider 확장이 용이합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/auth/auth.service.ts | 소셜 로그인 비즈니스 로직 | AuthService, socialLogin(), findOrCreateUser(), getStrategy() |
| apps/api/src/module/auth/auth.controller.ts | Microservice 메시지 핸들러 | AuthController, @MessagePattern('auth.socialLogin') |
| apps/api/src/module/auth/auth.router.ts | tRPC 라우터 | AuthRouter, socialLogin mutation |
| apps/api/src/module/auth/auth.module.ts | NestJS 모듈 정의 | AuthModule (providers: NaverStrategy, KakaoStrategy) |
| apps/api/src/module/auth/strategies/social-login.strategy.ts | Strategy 인터페이스 | SocialProvider, SocialUserProfile, SocialLoginStrategy |
| apps/api/src/module/auth/strategies/naver.strategy.ts | 네이버 OAuth 구현 | NaverStrategy, getUserProfile(), fetchAccessToken(), fetchUserProfile() |
| apps/api/src/module/auth/strategies/kakao.strategy.ts | 카카오 OAuth 구현 | KakaoStrategy, getUserProfile(), fetchAccessToken(), fetchUserProfile() |
| apps/api/src/module/domain/social-account.entity.ts | 소셜 계정 Entity | SocialAccountEntity, create(), findByProvider() |
| apps/api/src/database/migration/1773669013426-alter-user-nullable-password.ts | 마이그레이션 | password nullable 변경 |
| apps/api/src/database/migration/1773748321334-refactor-social-accounts-to-one-to-many.ts | 마이그레이션 | social_accounts 1:1→1:N 구조 변환 (provider+accountId) |
| apps/api/src/config.ts | OAuth 설정 | ConfigProvider.auth.naver, ConfigProvider.auth.kakao (clientId, clientSecret, callbackUrl) |
| apps/api/config/default.js | 프로덕션 설정 | auth.naver, auth.kakao (callbackUrl 상수) |
| apps/api/config/localdev.js | 로컬 개발 설정 | auth.naver, auth.kakao (localhost callbackUrl) |
| packages/api-types/src/server.ts | API 타입 정의 | auth.socialLogin mutation 스키마 |
| apps/client/src/routes/login.tsx | 로그인 페이지 | handleNaverLogin(), handleKakaoLogin() (이전 에러 초기화 + OAuth URL 생성 + state 저장) |
| apps/client/src/components/auth/SocialLoginCallback.tsx | 공통 콜백 UI 컴포넌트 | SocialLoginCallback (로딩/에러 상태 표시, Provider별 브랜드 색상) |
| apps/client/src/routes/auth/naver/callback.tsx | 네이버 콜백 처리 | NaverCallbackPage (code/state 검증 → API 호출 → 로그인) |
| apps/client/src/routes/auth/kakao/callback.tsx | 카카오 콜백 처리 | KakaoCallbackPage (code/state 검증 → API 호출 → 로그인) |

## 핵심 흐름

1. **프론트엔드**: 사용자가 "네이버/카카오로 로그인" 클릭 → 이전 에러 상태 초기화(`setError(null)`) → `crypto.randomUUID()` state 생성 + `sessionStorage` 저장 → OAuth 페이지로 리다이렉트
2. **콜백 처리**: `/auth/{provider}/callback`에서 code/state 수신 → sessionStorage의 state 검증 (React StrictMode 이중실행 방지를 위해 `useRef` 사용) → `auth.socialLogin` tRPC mutation 호출
3. **AuthRouter**: refreshToken은 httpOnly 쿠키로 설정, accessToken + user 정보 응답
4. **AuthService.socialLogin()**: `getStrategy(provider)`로 적절한 Strategy 선택 → 프로필 조회 → `findOrCreateUser()`로 사용자 매칭/생성 → `UserService.generateTokens()`로 JWT 발급
5. **findOrCreateUser()**: SocialAccount로 검색 → email로 기존 사용자 연결 → 새 사용자 생성 (3단계 순차 탐색)

## Strategy 패턴

```
SocialLoginStrategy (인터페이스)
├── NaverStrategy   ← 구현 완료
├── KakaoStrategy   ← 구현 완료
└── GoogleStrategy  ← 미구현 (확장 예정)
```

- `SocialProvider` 타입: `'naver' | 'kakao' | 'google'`
- `SocialUserProfile`: providerId, provider, email, nickname, profileImage
- `getStrategy()`: provider 문자열로 Strategy 인스턴스 반환

## 공통 콜백 UI 컴포넌트

- `SocialLoginCallback`: Provider별 브랜드 색상과 아이콘을 표시하는 공통 UI
- `SocialProvider` 타입: `'kakao' | 'naver'` (프론트엔드)
- Provider 설정: 카카오(#FEE500, K), 네이버(#03C75A, N)
- 로딩 상태: 브랜드 아이콘 + 스피너 + 안내 텍스트
- 에러 상태: 에러 메시지 + 로그인 페이지 링크

## SocialAccountEntity 구조

- 테이블: `social_accounts`
- UserEntity와 ManyToOne 관계 (userId FK) — 한 User가 여러 소셜 계정 보유 가능
- 컬럼: `provider` (SocialProvider: 'naver' | 'kakao' | 'google'), `accountId` (provider별 고유 ID)
- Unique Index: `(provider, account_id) WHERE deleted_at IS NULL`
- Factory: `SocialAccountEntity.create(userId, provider, accountId)`
- Repository 확장: `findByUserId()`, `findByProvider()`, `findByUserIdAndProvider()`

## 사용자 매칭 로직

1. `findByProvider()`: SocialAccount에서 provider+providerId로 기존 사용자 검색
2. `linkSocialAccountToExistingUser()`: email로 기존 사용자 찾아 SocialAccount 연결 (TODO: 본인인증으로 변경 필요)
3. `createUserWithSocialAccount()`: 새 UserEntity 생성 (password: null) + SocialAccount 생성
4. 임시 email 생성: `{provider}_{providerId}@social.readly.co.kr` (provider별 접두사)

## 관련 Business Context

- [social-authentication.md](../business/social-authentication.md)

## 관련 Codebase Context

- [user-entity.md](./user-entity.md): UserEntity 구조 (password 컬럼 제거됨)
- [otp-phone-verification.md](./otp-phone-verification.md): OTP 전화번호 인증 (AuthService 공유)
