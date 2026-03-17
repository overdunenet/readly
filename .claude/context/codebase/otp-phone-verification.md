---
name: codebase-otp-phone-verification
description: OTP 기반 전화번호 인증 모듈 - OtpEntity, SMS 인증 플로우, 계정 병합, 프론트엔드 인증 페이지
keywords: [OTP, 전화번호, 인증, phone, verification, SMS, 계정병합, mergeUserAccounts]
estimated_tokens: ~500
related_contexts:
  - codebase-social-login
  - codebase-user-entity
  - business-social-authentication
---

# OTP 전화번호 인증 모듈

소셜 로그인 후 전화번호 본인인증을 수행하는 OTP 모듈입니다. 6자리 코드를 생성하여 SMS로 발송하고, 사용자가 입력한 코드를 검증합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/domain/otp.entity.ts | OTP Entity 및 Repository | OtpEntity, getOtpRepository(), findByPhone(), deleteByPhone() |
| apps/api/src/database/migration/1773727712766-add-phone-otp.ts | 마이그레이션 | users.phone 컬럼 추가, otp_verifications 테이블 생성 |
| apps/api/src/database/migration/1773732328642-add-otp-attempts.ts | 마이그레이션 | otp_verifications.attempts 컬럼 추가 |
| apps/api/src/module/auth/auth.service.ts | OTP 비즈니스 로직 | requestPhoneOtp(), validateOtp(), completePhoneVerification(), mergeUserAccounts() |
| apps/api/src/module/auth/auth.controller.ts | Microservice 핸들러 | @MessagePattern('auth.phoneOtpRequest'), @MessagePattern('auth.phoneOtpVerify') |
| apps/api/src/module/auth/auth.router.ts | tRPC 라우터 | auth.phoneOtpRequest, auth.phoneOtpVerify mutations |
| packages/api-types/src/server.ts | API 타입 정의 | phoneOtpRequest, phoneOtpVerify 스키마 |
| apps/client/src/routes/_auth/phone-verify/index.tsx | 전화번호 입력 페이지 | PhoneVerifyPage |
| apps/client/src/routes/_auth/phone-verify/confirm.tsx | OTP 코드 확인 페이지 | PhoneVerifyConfirmPage |
| apps/client/src/hooks/useOtpTimer.ts | OTP 타이머 훅 | useOtpTimer() |

## OtpEntity 구조

- 테이블: `otp_verifications`
- Unique 제약조건: `UQ_otp_phone` (phone)
- 컬럼: phone(varchar), code(varchar(6)), expiresAt(timestamp), attempts(int, default 0)
- BaseEntity 상속 (id, createdAt, updatedAt)

## 핵심 흐름

1. **OTP 요청**: 사용자가 전화번호 입력 → `auth.phoneOtpRequest` 호출 → 60초 재발송 제한 확인 → 기존 OTP 삭제 → 6자리 코드 생성 (3분 만료) → DB 저장 → (TODO: SMS 발송)
2. **OTP 검증**: 사용자가 코드 입력 → `auth.phoneOtpVerify` 호출 → `validateOtp()`로 만료/코드 불일치/5회 초과 확인 → `completePhoneVerification()` 실행
3. **계정 병합**: `completePhoneVerification()`에서 동일 phone의 기존 사용자 존재 시 → `mergeUserAccounts(sourceUser, targetUser)`로 소셜 계정 이전 + 임시 사용자 소프트 삭제 → targetUser로 새 JWT 발급
4. **단순 인증**: 기존 사용자 미존재 시 → 현재 사용자의 `phone` 컬럼 업데이트 + 새 JWT 발급
5. **프론트엔드**: phone-verify 페이지에서 번호 입력 → confirm 페이지에서 코드 입력 → 성공 시 accessToken 교체 + `phoneVerified: true` 설정 → 홈으로 이동

## 보안 규칙

- 60초 내 재발송 불가 (rate limiting)
- OTP 만료 시간: 3분
- 최대 시도 횟수: 5회 (초과 시 OTP 자동 삭제)
- 전화번호 형식 검증: `/^01[0-9]{8,9}$/`
- users.phone에 Unique Index (soft delete 고려: `WHERE deleted_at IS NULL AND phone IS NOT NULL`)

## 관련 Codebase Context

- [social-login.md](./social-login.md): 소셜 로그인 모듈 (AuthService 공유)
- [user-entity.md](./user-entity.md): UserEntity 구조 (phone 컬럼 추가)

## 관련 Business Context

- [social-authentication.md](../business/social-authentication.md): 소셜 로그인 + 전화번호 인증 정책
