---
feature_name: 서점 시스템
feature_id: F2
milestone: 'M-001'
status: 'draft'
label: 'feature:bookstore'
created_at: 2026-03-09
updated_at: 2026-03-09
author: PM
product_brief_ref: PM-DOCS/Context Output/PRODUCT_BRIEF.md
progress:
  phase_a: true
  phase_b: false
  phase_c: false
  phase_d: false
  phase_e: false
  issue_decomposed: false
---

# F2. 서점 시스템 PRD

## §1. 개요

- **Feature명**: 서점 시스템
- **소속 Milestone**: M-001 (MVP 핵심 기능)
- **한 줄 요약**: 모든 유저가 자신의 서점을 오픈하고 관리할 수 있는 작가 공간
- **라벨**: `feature:bookstore`

### 배경 및 목적

Readly의 비전 "1인 창작자의 글로벌 유통 플랫폼"을 실현하기 위한 첫 번째 작가 공간. "작가 전환"이 아닌, 모든 유저에게 "내 서점"(쓰기/판매)을 부여하여 창작 허들을 최소화한다.

### 의존성

- **선행**: F1 인증 & 계정 관리 (approved), F17 마이페이지 (backlog)
- **후행**: F3 글쓰기 & 발행, F4 시리즈 관리

### MVP 제약 (CIS 기반)

- 한국 유저만 서점 오픈 가능
- 1인 1서점 (다중 서점 불가)
- 서점 비활성화 불가 (한 번 열면 닫을 수 없음)
- 해외 작가 서점은 Growth 이후

## §2. 목표 & 성공 지표

### 비즈니스 목표

작가가 자신의 콘텐츠를 판매할 수 있는 독립적인 공간(서점)을 제공하여, "Write Once, Reach Global" 가치의 첫 번째 진입점을 만든다.

### SMART 성공 지표

| 구분      | 지표                              | 현재 | 목표       | 기한          |
| --------- | --------------------------------- | ---- | ---------- | ------------- |
| Business  | MVP 작가 서점 오픈 수             | 0    | 30개+      | 출시 1개월 내 |
| Business  | 서점 오픈 → 첫 포스트 발행 전환율 | 신규 | 80%+       | 출시 3개월 내 |
| Technical | 서점 페이지 로딩 (P95)            | 신규 | 1초 이내   | 출시 시점     |
| Technical | 서점 관리 API 응답 (P95)          | 신규 | 500ms 이내 | 출시 시점     |

## §3. 유저스토리 (Draft)

| ID   | 역할 | 유저스토리                                          | 가치                                        |
| ---- | ---- | --------------------------------------------------- | ------------------------------------------- |
| US-1 | 유저 | 마이페이지에서 서점을 오픈하고 싶다                 | 내 작품을 발행·판매할 공간을 갖기 위해      |
| US-2 | 유저 | 서점 프로필(필명, 소개글, 이미지)을 설정하고 싶다   | 독자에게 나를 알리고 정체성을 표현하기 위해 |
| US-3 | 독자 | 작가의 서점 페이지를 방문하여 작품 목록을 보고 싶다 | 관심 작가의 작품을 한 곳에서 탐색하기 위해  |
| US-4 | 유저 | 내 서점에서 작품 목록과 상태를 관리하고 싶다        | 발행된 작품을 효율적으로 관리하기 위해      |

> ⚠️ 유저스토리는 사용자 검토 대기 중 (Draft)

## §4. 유저 플로우

> Phase B 미완료 - 다음 세션에서 작성

## §5. 화면 정의

> Phase C에서 작성 예정

## §6. 이벤트 정의

> Phase C에서 작성 예정

## §7. 수용 기준 (Acceptance Criteria)

> Phase C에서 작성 예정

## §8. 기술 요건

> Phase D에서 작성 예정

## §9. 엣지 케이스 & 에러 처리

> Phase D에서 작성 예정

## §10. 우선순위 & 스코프

> Phase D에서 작성 예정

## §11. 참조 문서

- **Product Brief**: PM-DOCS/Context Output/PRODUCT_BRIEF.md
- **CIS 산출물**: PM-DOCS/Context Output/brainstorming_2026-03-03_mvp-feature-decomposition.md
- **F1 인증 PRD**: PM-DOCS/Planning/Feature_PRD/feature#1_auth/PRD.md
