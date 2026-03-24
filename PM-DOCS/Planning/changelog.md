# Changelog

All notable changes to PM planning documents will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [2026-03-22]

### Added

- Feature_PRD/feature#2_bookstore/PRD.md Phase A~E 완료 (approved)
- Feature_PRD/feature#2_bookstore/screens.yml 생성 (9개 화면, SCR-011~019)
- Feature_PRD/feature#2_bookstore/events.yml 생성 (5개 독자향 이벤트)
- Feature_PRD/feature#2_bookstore/wireframes.html 생성 (모바일+PC)
- Feature_PRD/feature#2_bookstore/IMPLEMENTATION_GUIDE.md 생성
- Context Output/design-thinking_2026-03-21_bookstore-system.md 생성 (CIS)

### Changed

- Feature_PRD/feature#2_bookstore/PRD.md: draft → approved → decomposed (Phase A~E 완료 + Issue 분해)
- US-1~7에 스코프 컬럼 추가 (MVP/Growth 구분)
- 유저플로우 Flow 1~7에 [MVP]/[Growth] 태그 추가
- screens.yml에 scope 필드 추가 (mvp/growth)
- F1 선행 수정 필요 항목 3건 명시 (country, redirect, FollowButton)

## [2026-03-09]

### Added

- Feature_PRD/feature#2_bookstore/PRD.md 생성 (draft)
- F17 마이페이지 Feature 추가 (Tier 1 Foundation)

### Changed

- M-001: Feature 수 16개 → 17개
- F2 서점 시스템 의존성: F1 → F1, F17
- F8 구매 & 내 서재 의존성: F7 → F7, F17
- 의존성 다이어그램 업데이트
- Feature_PRD/feature#1_auth/PRD.md 업데이트: 16개 개선 항목 반영 (X 제거, 국가 선택 UI, OTP 정책, 성인인증 정책, 탈퇴 플로우, SMS rate limiting, 성인 나이 한국 만19세/글로벌 만20세)
- Feature_PRD/feature#1_auth/screens.yml 업데이트: SCR-001 국가 선택 UI, SCR-003 OTP 정책, SCR-007/008 성인인증 정책, SCR-009 탈퇴 플로우 반영
- Feature_PRD/feature#1_auth/events.yml 업데이트: X 제거, SMS rate limiting 이벤트 추가, 탈퇴 철회 이벤트 추가 (16→18개)
- events-index.yml 재집계 (18개)
- IA-table.md 재렌더링
- Feature_PRD/feature#1_auth/IMPLEMENTATION_GUIDE.md 생성: Breaking Points 28개 + 최적 구현 순서 10 Phase

## [2026-03-08]

### Added

- Feature_PRD/feature#1_auth/PRD.md 생성
- Feature_PRD/feature#1_auth/screens.yml 생성
- Feature_PRD/feature#1_auth/events.yml 생성
- GitHub 라벨 feature:auth 생성

## [2026-03-04]

### Changed

- [2026-03-04] M-001 업데이트: 16개 Feature 의존성 분석 및 Tier 구분 반영

### Added

- [2026-03-04] M-001 생성: MVP 핵심 기능 구현 (2026-03-04 ~ 2026-06-30)

## [2026-02-18]

### Added

- PM 워크플로우 시스템 초기화
- PM-DOCS 폴더 구조 생성 (templates, IA, Roadmap, Feature_PRD)
- PRD, screens, events, changelog, milestone 템플릿 생성
- screen-index.yml, IA-table.md, events-index.yml 초기 파일 생성
