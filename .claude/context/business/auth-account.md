---
name: auth-account
description: 인증 & 계정 관리 - 소셜 로그인, 전화번호 인증, 프로필, 성인 인증, 회원 탈퇴
keywords: [인증, 로그인, 소셜로그인, OTP, 성인인증, 프로필, 회원탈퇴, 계정]
---

# 인증 & 계정 관리

## 목적

사용자가 Readly 서비스에 안전하게 가입/로그인하고, 프로필을 관리하며, 성인 콘텐츠 접근을 위한 인증을 수행할 수 있도록 한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
| --- | --- | --- |
| 소셜 로그인 | OAuth 기반 간편 로그인 | 카카오/네이버/Google(한국), Google/Facebook/LINE(글로벌) |
| 전화번호 인증 | OTP 기반 전화번호 인증 | 전화번호 입력 → OTP 수신 → 6자리 입력 (3분 제한) |
| 닉네임 설정 | 신규 가입 시 닉네임 지정 | 2~20자, 중복 확인 후 설정 |
| 프로필 편집 | 닉네임, 프로필 이미지, 소개 수정 | 설정에서 프로필 수정 |
| 성인 인증 | 성인 콘텐츠 접근을 위한 연령 확인 | 한국: 본인인증(PASS), 글로벌: 신분증 업로드 |
| 회원 탈퇴 | 계정 영구 삭제 | 비밀번호 확인 후 탈퇴 (되돌릴 수 없음) |
| 설정 | 계정 관련 설정 메뉴 | 프로필 편집, 성인 인증, 로그아웃, 회원 탈퇴 |

## 사용자 흐름

### 로그인 흐름

1. 사용자가 `/login`에 접근 → 국가별 소셜 로그인 버튼 표시
2. 소셜 로그인 선택 → OAuth 인증 → 기존 회원이면 로그인 완료
3. 신규 회원이면 → 닉네임 설정 화면으로 이동
4. 전화번호 로그인 선택 → `/login/phone` → OTP 인증 → 로그인/가입 완료

### 국가별 로그인 수단

| 국가 | 소셜 로그인 | 전화번호 |
| --- | --- | --- |
| 한국 (KR) | 카카오, 네이버, Google | O |
| 글로벌 | Google, Facebook, LINE | O |

### 성인 인증 흐름

1. 설정 > 성인 인증 선택 → 안내 화면 표시
2. 한국: PASS 본인인증 → 자동 연령 확인
3. 글로벌: 신분증 사진 업로드 → 수동 검증 (1-3 영업일)

### 회원 탈퇴 흐름

1. 설정 > 회원 탈퇴 → 경고 안내 (데이터 영구 삭제, 구독 해지)
2. 비밀번호 입력 → 탈퇴 완료

## 화면 목록 (Wireframe)

| 화면 ID | 이름 | 경로 |
| --- | --- | --- |
| SCR-001 | 로그인 | /login |
| SCR-002 | 전화번호 인증 | /login/phone |
| SCR-003 | OTP 입력 | /login/phone/verify |
| SCR-004 | 닉네임 설정 | /signup/nickname |
| SCR-005 | 프로필 편집 | /settings/profile |
| SCR-006 | 성인 인증 안내 | /settings/adult-verify |
| SCR-007 | 성인 인증 - 한국 | /settings/adult-verify/kr |
| SCR-008 | 성인 인증 - 글로벌 | /settings/adult-verify/global |
| SCR-009 | 회원 탈퇴 | /settings/delete-account |
| SCR-010 | 설정 메인 | /settings |

와이어프레임 원본: `PM-DOCS/Planning/Feature_PRD/feature#1_auth/wireframes.html`

## 관련 Codebase Context

- [user-entity.md](../codebase/user-entity.md) — UserEntity 구조 및 JWT 인증 구현
