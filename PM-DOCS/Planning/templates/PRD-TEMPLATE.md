---
feature_name: '{name}'
milestone: 'M-{XXX}'
status: 'draft | review | approved | decomposed | archived'
created_at: 'YYYY-MM-DD'
updated_at: 'YYYY-MM-DD'
author: ''
label: 'feature:{name}'
progress:
  phase_a: false
  phase_b: false
  phase_c: false
  phase_d: false
  phase_e: false
  issue_decomposed: false
---

# {Feature명} PRD

## 1. 개요

- **Feature명**:
- **소속 Milestone**: M-{XXX} ({목표})
- **한 줄 요약**:

## 2. 목표 & 성공 지표

### 비즈니스 목표

- 왜 이 기능이 필요한가?

### 성공 지표 (SMART)

| 지표명 | 측정 방법 | 현재 값 | 목표 값 | 기한 |
| ------ | --------- | ------- | ------- | ---- |
|        |           |         |         |      |

## 3. 유저스토리

- **US-1**: {역할}로서, {행동}하고 싶다, {가치}를 위해
- **US-2**: ...

## 4. 유저 플로우

### 메인 플로우

1. [진입] 사용자가 ~에서 접근
2. [행동] ~를 수행
3. [결과] ~가 표시됨
4. [완료] ~로 이동

### 대안 플로우

- 조건 X인 경우: ...

## 5. 화면 정의

> 상세: `./screens.yml` 참조

| 화면 ID | 화면명 | Route | 설명 |
| ------- | ------ | ----- | ---- |
|         |        |       |      |

## 6. 이벤트 정의

> 상세: `./events.yml` 참조

| 이벤트명 | 트리거 | 화면 | KPI |
| -------- | ------ | ---- | --- |
|          |        |      |     |

## 7. 수용 기준 (Acceptance Criteria)

### AC-1 ({US-1} 관련)

- **Given**:
- **When**:
- **Then**:

### AC-2 ({US-2} 관련)

- **Given**:
- **When**:
- **Then**:

## 8. 기술 요건

### API 변경

- [ ] tRPC Router:
- [ ] Service:
- [ ] Entity:

### DB 스키마 변경

- [ ] Migration:

### 외부 의존성

- 없음

## 9. 엣지 케이스 & 에러 처리

| #   | 상황 | 처리 방법 |
| --- | ---- | --------- |
| 1   |      |           |

## 10. 우선순위 & 스코프

### MVP (이번 Feature)

-

### 후속 개선

-

## 11. 참조 문서

- CIS 산출물: (있는 경우 경로)
- 디자인:
- 기술 문서:
