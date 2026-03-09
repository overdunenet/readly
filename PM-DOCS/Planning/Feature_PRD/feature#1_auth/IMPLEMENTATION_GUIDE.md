# Feature #1 인증 & 계정 관리 — 구현 가이드

> 이 문서는 PRD를 현재 코드베이스에 적용할 때의 **Breaking Points**와 **최적 구현 순서**를 정리합니다.
> 분석 기준일: 2026-03-09

## 현재 코드베이스 요약

| 영역        | 현재 상태                 | PRD 요구사항                                      |
| ----------- | ------------------------- | ------------------------------------------------- |
| 인증 방식   | Email + Password (bcrypt) | Passwordless (소셜 + OTP)                         |
| 유저 식별   | email (unique, NOT NULL)  | 소셜 Provider ID 또는 phone                       |
| JWT 만료    | Refresh 7일 하드코딩      | App 180일 / Web 7일 플랫폼 분기                   |
| 소셜 로그인 | 없음                      | 5개 Provider (카카오/네이버/Google/Facebook/Line) |
| OTP 인증    | 없음                      | 전화번호 SMS 인증                                 |
| 성인인증    | 없음                      | 한국(통신사) + 글로벌(여권 OCR)                   |
| 회원 탈퇴   | soft delete (deletedAt)   | 30일 유예기간 + 익명 변환                         |
| 프론트엔드  | email+password 폼 2개     | 국가 선택 → 소셜/OTP 인증                         |

---

## Breaking Points

### 1. DB 스키마 Breaking Points

| #    | 현재 코드                                          | PRD 요구사항                                       | 충돌 유형                      | 위험도   |
| ---- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------ | -------- |
| BP-1 | `UserEntity.email` — unique, NOT NULL              | 소셜 로그인 시 email 없을 수 있음 (Line, 전화번호) | NOT NULL 제약 위반             | CRITICAL |
| BP-2 | `UserEntity.password` — NOT NULL, bcrypt           | Passwordless (비밀번호 개념 없음)                  | NOT NULL 제약 위반             | CRITICAL |
| BP-3 | `UserEntity.register({email, password, nickname})` | 소셜/OTP 가입은 email+password 없이 진행           | Static Factory 시그니처 불일치 | HIGH     |
| BP-4 | `UserEntity`에 country, phone, adultVerified 없음  | 국가별 분기, 전화번호 인증, 성인인증 필요          | 컬럼 부재                      | HIGH     |
| BP-5 | `SocialAccountEntity` 없음                         | 1:N 소셜 계정 연동 필요                            | Entity 부재                    | HIGH     |
| BP-6 | `OtpEntity` 없음                                   | 전화번호 OTP 발송/검증 필요                        | Entity 부재                    | HIGH     |
| BP-7 | `AdultVerificationEntity` 없음                     | 성인인증 이력 관리 필요                            | Entity 부재                    | MEDIUM   |
| BP-8 | `FollowEntity` — `onDelete: CASCADE`               | 탈퇴 30일 유예기간 중 팔로우 관계 유지 필요        | Cascade 정책 충돌              | MEDIUM   |
| BP-9 | `PostEntity.authorId` — 탈퇴 시 CASCADE            | 탈퇴 후 포스트는 "탈퇴한 사용자"로 익명 변환       | 데이터 보존 정책 충돌          | MEDIUM   |

### 2. API Breaking Points

| #     | 현재 코드                                              | PRD 요구사항                                | 충돌 유형           | 위험도   |
| ----- | ------------------------------------------------------ | ------------------------------------------- | ------------------- | -------- |
| BP-10 | `user.register` — `{email, password, nickname}`        | 가입 플로우 자체가 다름 (소셜/OTP → 닉네임) | 프로시저 삭제 필요  | CRITICAL |
| BP-11 | `user.login` — `{email, password}`                     | Passwordless (소셜/OTP만)                   | 프로시저 삭제 필요  | CRITICAL |
| BP-12 | `LoginCredentials` 타입 — `{email, password}`          | 더 이상 사용 불가                           | 타입 삭제 필요      | HIGH     |
| BP-13 | `UserService.generateTokens` — 단일 expiry             | App 180일 / Web 7일 플랫폼별 분기           | 토큰 만료 로직 변경 | HIGH     |
| BP-14 | JWT Payload `{sub, email, type}`                       | email 없는 유저 존재 가능                   | Payload 구조 변경   | HIGH     |
| BP-15 | `CookieService` — maxAge 7일 하드코딩                  | 플랫폼별 동적 maxAge (7일/180일)            | 쿠키 설정 변경      | MEDIUM   |
| BP-16 | `user.me` 응답 — `{id, email, nickname, profileImage}` | country, phone, adultVerified 등 추가 필요  | 응답 스키마 확장    | MEDIUM   |
| BP-17 | auth/adultVerify Router 없음                           | 새 tRPC Router 2개 필요                     | 모듈 부재           | HIGH     |

### 3. Frontend Breaking Points

| #     | 현재 코드                                           | PRD 요구사항                                 | 충돌 유형            | 위험도   |
| ----- | --------------------------------------------------- | -------------------------------------------- | -------------------- | -------- |
| BP-18 | `login.tsx` — email+password 폼                     | 국가 선택 + 소셜 버튼 + 전화번호             | 전면 재작성          | CRITICAL |
| BP-19 | `signup.tsx` — email+password+nickname 폼           | 가입 페이지 제거 (소셜/OTP → 온보딩 닉네임)  | 페이지 삭제          | CRITICAL |
| BP-20 | `User` 타입 — `{id, email, nickname, profileImage}` | email 제거, country/phone/adultVerified 추가 | 타입 전면 변경       | HIGH     |
| BP-21 | `useAuth.handleLogin(email, password)`              | socialLogin, phoneOtpRequest, phoneOtpVerify | 훅 전면 재작성       | HIGH     |
| BP-22 | `_auth.tsx` — 단순 user 존재 체크                   | 온보딩 미완료 체크, 탈퇴 유예 상태 분기      | 가드 로직 확장       | MEDIUM   |
| BP-23 | `trpc.ts` — 401 자동 갱신                           | `X-Platform` 헤더 추가 필요                  | HTTP 클라이언트 수정 | MEDIUM   |
| BP-24 | settings 관련 라우트 없음                           | 6개 신규 라우트 필요                         | 라우트 부재          | HIGH     |

### 4. 외부 의존성 Breaking Points

| #     | 서비스                    | 필요 작업                 | 위험도 | 비고                           |
| ----- | ------------------------- | ------------------------- | ------ | ------------------------------ |
| BP-25 | OAuth (5개 Provider)      | API 키 발급 + SDK 통합    | HIGH   | 각 Provider별 개발자 등록 필요 |
| BP-26 | SMS Provider (Twilio/SNS) | 계정 생성 + API 연동      | HIGH   | 글로벌 SMS 발송 비용           |
| BP-27 | AWS Textract              | IAM 설정 + AnalyzeID 연동 | MEDIUM | Bytes direct 방식 (S3 불필요)  |
| BP-28 | NICE/KCB                  | API 연동 (계약 완료)      | MEDIUM | 한국 성인인증 전용             |

---

## 최적 구현 순서

### Phase 의존성 다이어그램

```
Phase 1 (DB Schema)
    ↓
Phase 2 (JWT Strategy)
    ↓
Phase 3 (Auth Module) ←── Phase 9 (외부 서비스 API 키 - 병렬 가능)
    ↓
Phase 4 (User Module Refactor)
    ↓
Phase 5 (Frontend Auth)
    ↓                    ↘
Phase 6 (Settings FE)    Phase 7 (Withdrawal)
    ↓
Phase 8 (Adult Verify)
    ↓
Phase 10 (Cleanup & Test)
```

---

### Phase 1: DB 스키마 마이그레이션 (기반 작업)

> 해결: BP-1, BP-2, BP-4, BP-5, BP-6, BP-7

모든 백엔드/프론트 코드가 DB 스키마에 의존합니다. 스키마를 먼저 확정해야 이후 롤백이 없습니다.

**수정 대상:**

| 파일                           | 변경 내용                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `user.entity.ts`               | email: nullable, unique 조건부 유지. password: nullable. country/phone/adultVerified/withdrawalRequestedAt 추가 |
| `social-account.entity.ts`     | 신규 생성. provider, providerId, email, userId (ManyToOne → User)                                               |
| `otp.entity.ts`                | 신규 생성. phone, code, expiresAt, attempts, verified                                                           |
| `adult-verification.entity.ts` | 신규 생성. userId, method, verifiedAt, expiresAt, status                                                        |
| `migration/`                   | ALTER TABLE users + CREATE TABLE 3개                                                                            |

**핵심 결정:**

- `email`과 `password`를 nullable로 변경 → 기존 유저 데이터 유지
- 신규 가입 플로우에서는 이 필드를 채우지 않음
- `phone` 컬럼에 partial unique index (NULL 제외)

---

### Phase 2: JWT 전략 업그레이드

> 해결: BP-13, BP-14, BP-15

Auth 모듈 작업 전에 토큰 인프라를 먼저 정비합니다.

**수정 대상:**

| 파일                      | 변경 내용                                                   |
| ------------------------- | ----------------------------------------------------------- |
| `config.ts`               | JWT expiry를 플랫폼별 분기 (web: 7d, app: 180d)             |
| `user.auth.middleware.ts` | JWT Payload에서 email 제거 → sub만으로 식별                 |
| `cookie.service.ts`       | `setRefreshTokenCookie(res, token, platform)` — 동적 maxAge |
| `user.service.ts`         | `generateTokens(user, platform)` — 플랫폼 파라미터 추가     |

**X-Platform 헤더 규칙:**

- App: `X-Platform: app` 헤더 필수 전송
- Web: 헤더 없거나 `X-Platform: web` → 기본 7일

---

### Phase 3: Auth 모듈 신규 생성 (Backend Core)

> 해결: BP-10, BP-11, BP-12, BP-17

DB + JWT가 준비되면 인증 핵심 로직을 작성합니다.

**신규 파일:**

| 파일                                  | 역할                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| `auth/auth.module.ts`                 | NestJS 모듈                                                        |
| `auth/auth.service.ts`                | socialLogin, phoneOtpRequest, phoneOtpVerify, refreshToken, logout |
| `auth/auth.router.ts`                 | tRPC 프로시저 5개                                                  |
| `auth/auth.controller.ts`             | MessagePattern 컨트롤러                                            |
| `auth/providers/oauth.interface.ts`   | OAuth 공통 인터페이스 (Strategy 패턴)                              |
| `auth/providers/kakao.provider.ts`    | 카카오 OAuth                                                       |
| `auth/providers/naver.provider.ts`    | 네이버 OAuth                                                       |
| `auth/providers/google.provider.ts`   | Google OAuth                                                       |
| `auth/providers/facebook.provider.ts` | Facebook OAuth                                                     |
| `auth/providers/line.provider.ts`     | Line OAuth                                                         |
| `auth/sms/sms.service.ts`             | Twilio/SNS SMS 발송                                                |

**기존 파일 수정:**

| 파일              | 변경 내용                                                             |
| ----------------- | --------------------------------------------------------------------- |
| `user.router.ts`  | register, login 프로시저 삭제. refreshToken/logout → auth.router 이동 |
| `user.service.ts` | register(), login(), LoginCredentials 삭제                            |
| `app.module.ts`   | AuthModule 등록                                                       |

---

### Phase 4: User 모듈 리팩토링

> 해결: BP-3, BP-16

**수정 대상:**

| 파일                     | 변경 내용                                                                |
| ------------------------ | ------------------------------------------------------------------------ |
| `user.service.ts`        | getMe() 응답 확장 (country, phone, adultVerified). updateProfile() 추가  |
| `user.router.ts`         | user.me 스키마 확장. user.updateProfile 추가                             |
| `repository.provider.ts` | SocialAccountRepository, OtpRepository, AdultVerificationRepository 추가 |

---

### Phase 5: 프론트엔드 Auth 인프라 재작성

> 해결: BP-18, BP-19, BP-20, BP-21, BP-23

가장 큰 변경 영역입니다.

**수정 파일:**

| 파일                  | 변경 내용                                                  |
| --------------------- | ---------------------------------------------------------- |
| `stores/auth.ts`      | User 타입에서 email 제거, country/phone/adultVerified 추가 |
| `hooks/useAuth.ts`    | handleLogin 제거 → socialLogin/phoneOtp 핸들러 추가        |
| `shared/trpc/trpc.ts` | X-Platform 헤더 추가, auth.refreshToken 경로 변경          |
| `routes/login.tsx`    | 전면 재작성 → 국가 선택 + 소셜 버튼 + 전화번호             |
| `routes/signup.tsx`   | 삭제                                                       |
| `routes/_auth.tsx`    | 온보딩 미완료/탈퇴 유예 상태 체크 추가                     |

**신규 파일:**

| 파일                             | 화면                  |
| -------------------------------- | --------------------- |
| `routes/login/phone.tsx`         | SCR-002 전화번호 인증 |
| `routes/login/phone/verify.tsx`  | SCR-003 OTP 입력      |
| `routes/onboarding/nickname.tsx` | SCR-004 닉네임 설정   |

---

### Phase 6: Settings 모듈 (프론트엔드)

> 해결: BP-24

**신규 파일:**

| 파일                             | 화면                |
| -------------------------------- | ------------------- |
| `routes/settings/index.tsx`      | SCR-010 설정 메인   |
| `routes/settings/profile.tsx`    | SCR-005 프로필 편집 |
| `routes/settings/withdrawal.tsx` | SCR-009 회원 탈퇴   |

---

### Phase 7: 회원 탈퇴 플로우

> 해결: BP-8, BP-9

**수정 대상:**

| 파일               | 변경 내용                                                             |
| ------------------ | --------------------------------------------------------------------- |
| `user.service.ts`  | requestWithdrawal, cancelWithdrawal, processExpiredWithdrawals (cron) |
| `user.router.ts`   | user.requestWithdrawal, user.cancelWithdrawal 추가                    |
| `follow.entity.ts` | onDelete: CASCADE → 유예기간 중 관계 유지, 영구 삭제 시 정리          |
| `post.entity.ts`   | 영구 삭제 시 author를 "탈퇴한 사용자"로 익명 변환                     |

**탈퇴 플로우:**

1. 탈퇴 요청 → `withdrawalRequestedAt = now()` + 즉시 로그아웃
2. 유예기간(30일) 중 재로그인 → 동의 시 `withdrawalRequestedAt = null`
3. 30일 경과 → cron job이 계정+데이터 영구 삭제 (포스트는 익명 변환)

---

### Phase 8: 성인인증 모듈

> 해결: BP-7, BP-27, BP-28

**신규 파일 (Backend):**

| 파일                                          | 역할                     |
| --------------------------------------------- | ------------------------ |
| `adult-verify/adult-verify.module.ts`         | NestJS 모듈              |
| `adult-verify/adult-verify.service.ts`        | requestKr, requestGlobal |
| `adult-verify/adult-verify.router.ts`         | tRPC 프로시저 2개        |
| `adult-verify/providers/nice.provider.ts`     | NICE 본인확인 연동       |
| `adult-verify/providers/textract.provider.ts` | AWS Textract AnalyzeID   |

**신규 파일 (Frontend):**

| 파일                                      | 화면    |
| ----------------------------------------- | ------- |
| `routes/settings/adult-verify/kr.tsx`     | SCR-007 |
| `routes/settings/adult-verify/global.tsx` | SCR-008 |
| `components/AdultVerifyModal.tsx`         | SCR-006 |

**성인 나이 기준:**

- 한국: 만 19세 이상
- 글로벌: 만 20세 이상

---

### Phase 9: 외부 서비스 연동 (Phase 3과 병렬 가능)

> 해결: BP-25, BP-26

Phase 3 코드 작업과 병렬로 진행 가능합니다.

**OAuth Provider 등록:**

| Provider | 개발자 사이트            | 예상 소요  |
| -------- | ------------------------ | ---------- |
| 카카오   | developers.kakao.com     | 즉시       |
| 네이버   | developers.naver.com     | 1-2일 심사 |
| Google   | console.cloud.google.com | 즉시       |
| Facebook | developers.facebook.com  | 1-2주 심사 |
| Line     | developers.line.biz      | 1-3일 심사 |

**SMS Provider:** Twilio 또는 AWS SNS 계정 생성 + API 키 설정

**환경변수 (.env):**

```
KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET
NAVER_CLIENT_ID / NAVER_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_APP_ID / FACEBOOK_APP_SECRET
LINE_CHANNEL_ID / LINE_CHANNEL_SECRET
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER
AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
NICE_CLIENT_ID / NICE_CLIENT_SECRET
```

---

### Phase 10: 정리 및 테스트

**삭제 대상:**

- `bcrypt` 의존성 (password 관련 코드 완전 제거 시)
- `routes/signup.tsx`
- 기존 E2E 테스트: `signup.spec.ts` 재작성

**업데이트 대상:**

- `packages/api-types/` → AppRouter 타입 갱신
- E2E 테스트 전면 재작성

---

## 리스크 요약

| 리스크                       | 영향                         | 완화 방안                                |
| ---------------------------- | ---------------------------- | ---------------------------------------- |
| OAuth 5개 Provider 동시 통합 | 각 Provider 인증 플로우 차이 | Strategy 패턴으로 공통 인터페이스 설계   |
| Facebook/Line 심사 지연      | Phase 9 병목                 | 일찍 등록 시작, 다른 Provider 우선 구현  |
| DB 마이그레이션 데이터 손실  | email/password nullable 전환 | 기존 데이터 유지, 점진적 제거            |
| Textract OCR 정확도          | 생년월일 추출 실패           | 3회 재시도 + 고객센터 폴백               |
| SMS 발송 비용                | 글로벌 SMS 단가 높음         | rate limiting 적용 (60초/5회시간/10회일) |
