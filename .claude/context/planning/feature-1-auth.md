---
name: feature-1-auth
description: Feature #1 인증 & 계정 관리 PRD 요약 - 소셜 로그인, OTP, 성인인증, 탈퇴
keywords: [인증, 로그인, 소셜, OTP, 성인인증, 탈퇴, JWT, OAuth, Passwordless]
estimated_tokens: ~600
---

# Feature #1: 인증 & 계정 관리

- **Milestone**: M-001 (MVP 핵심 기능)
- **Status**: approved
- **원본**: `PM-DOCS/Planning/Feature_PRD/feature#1_auth/PRD.md`
- **구현 가이드**: `PM-DOCS/Planning/Feature_PRD/feature#1_auth/IMPLEMENTATION_GUIDE.md`

## 핵심 설계 결정

- **Passwordless**: 소셜 로그인 + 전화번호 OTP만 (비밀번호 없음)
- **단일 회원 지위**: 작가/독자 구분 없음. 서점 오픈 시 작가로 활동
- **회원 유형**: 한국 회원 / 글로벌 회원 (로그인 화면에서 국가 직접 선택)
- **소셜 Provider**: 한국(카카오/네이버/Google), 글로벌(Google/Facebook/Line)

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 소셜 로그인 | 5개 Provider OAuth + 자동 가입/로그인 |
| 전화번호 OTP | SMS 인증코드 발송/검증 (3분 유효, 60초 쿨다운) |
| 프로필 설정 | 닉네임 + 프로필 이미지 (닉네임 중복 허용) |
| 성인인증 | 한국: 통신사 본인확인(NICE/KCB), 글로벌: 여권 OCR(AWS Textract) |
| 회원 탈퇴 | 30일 유예기간, 재로그인 시 복구 가능, 포스트 익명 변환 |

## JWT 전략

| 플랫폼 | Refresh Token | Access Token |
| --- | --- | --- |
| App | 180일 | 15분 |
| Web | 7일 | 15분 |

플랫폼 판별: `X-Platform` 요청 헤더 기반

## API 변경 (tRPC Router)

- `auth`: socialLogin, phoneOtpRequest, phoneOtpVerify, refreshToken, logout
- `user`: updateProfile, requestWithdrawal, cancelWithdrawal
- `adultVerify`: requestKr, requestGlobal

## DB 스키마 변경

| Entity | 변경 |
| --- | --- |
| `UserEntity` | 수정 — email/password nullable, country/phone/adultVerified 추가 |
| `SocialAccountEntity` | 신규 — provider, providerId, email (1:N with User) |
| `OtpEntity` | 신규 — phone, code, expiresAt, attempts |
| `AdultVerificationEntity` | 신규 — method, verifiedAt, expiresAt, status |

## 화면 (10개)

| ID | 화면 | Route |
| --- | --- | --- |
| SCR-001 | 로그인 | `/login` |
| SCR-002 | 전화번호 인증 | `/login/phone` |
| SCR-003 | OTP 입력 | `/login/phone/verify` |
| SCR-004 | 닉네임 설정 | `/onboarding/nickname` |
| SCR-005 | 프로필 편집 | `/settings/profile` |
| SCR-006 | 성인 인증 안내 | (모달) |
| SCR-007 | 성인 인증 - 한국 | `/settings/adult-verify/kr` |
| SCR-008 | 성인 인증 - 글로벌 | `/settings/adult-verify/global` |
| SCR-009 | 회원 탈퇴 | `/settings/withdrawal` |
| SCR-010 | 설정 메인 | `/settings` |

## 구현 가이드 요약

28개 Breaking Points 식별. 10개 Phase 순서:

1. DB 스키마 마이그레이션 (email/password nullable, 신규 Entity 3개)
2. JWT 전략 업그레이드 (플랫폼별 분기)
3. Auth 모듈 신규 생성 (OAuth Strategy 패턴, SMS 서비스)
4. User 모듈 리팩토링
5. 프론트엔드 Auth 재작성 (login/signup 전면 변경)
6. Settings 모듈 (프론트엔드)
7. 회원 탈퇴 플로우
8. 성인인증 모듈
9. 외부 서비스 연동 (Phase 3과 병렬 가능)
10. 정리 및 테스트

## 관련 Context

- [access-control.md](../business/access-control.md): 콘텐츠 접근 권한 (인증과 별개)
- [user-entity.md](../codebase/user-entity.md): 현재 UserEntity 구조 (PRD로 변경 예정)
- [authentication.md](../business/authentication.md): 인증 비즈니스 정책
