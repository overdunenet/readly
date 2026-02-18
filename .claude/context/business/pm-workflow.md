---
name: pm-workflow
description: PM 기획 워크플로우 - 기획-개발 파이프라인 통합, Milestone/Feature/Issue 계층 관리
keywords: [PM, 기획, 워크플로우, PRD, Milestone, Feature, Issue, CIS]
estimated_tokens: ~400
related_contexts:
  - business-overview
  - business-developer-experience
  - codebase-pm-planner-agent
  - codebase-planning-skill
---

# PM 기획 워크플로우

## 목적

기획-개발 파이프라인의 단절을 해소하여 PM 기획 산출물이 개발 작업으로 자연스럽게 연결되도록 합니다.
`/pm` 커맨드를 통해 Milestone, Feature PRD, Issue를 체계적으로 생성하고 관리합니다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| Milestone 관리 | 프로젝트 단계별 목표 설정 | 로드맵 시각화 |
| Feature PRD 작성 | 대화형 5단계 기획 프로세스 | 기획서 자동 구조화 |
| Issue 분해 | Feature를 개발 단위로 분해 | 개발 작업 자동 생성 |
| CIS 워크플로우 | 창의적 사고 지원 5종 도구 | 기획 초기 아이디어 발굴 |
| 자동 상태 추적 | 하위 작업 기반 진행률 자동 계산 | 수동 상태 관리 불필요 |

## 사용자 흐름

### 1. 기획 시작 Flow

```
/pm 입력 → 메뉴 선택 (New Task)
→ Milestone 생성 → Feature PRD 작성 (5단계 대화)
→ Issue 분해 → GitHub Project에 태스크 등록
```

### 2. Feature PRD 작성 Flow (5-Phase)

```
Phase A: 프로젝트 배경과 목적 정의
→ Phase B: 유저스토리와 수용 기준 도출
→ Phase C: 화면 정의와 이벤트 정의
→ Phase D: API/DB 기술 요건 정리
→ Phase E: PRD 검증 및 파일 저장
```

### 3. 진행 관리 Flow

```
Issue 상태 변경 (개발자가 작업 진행)
→ Feature 상태 자동 계산 (하위 Issue 기반)
→ 화면/이벤트 인덱스 자동 집계
→ changelog 자동 기록
```

## 계층 구조

```
Milestone (프로젝트 단계)
└── Feature (기능 단위)
    ├── PRD.md (기획서)
    ├── screens.yml (화면 정의)
    ├── events.yml (이벤트 정의)
    └── Issue (개발 작업)
        ├── Enhancement (기능 구현)
        └── Bug (버그 수정 - Feature 계층과 독립)
```

## 핵심 정책

| 정책 | 설명 |
|------|------|
| Feature-Milestone 필수 소속 | 모든 Feature는 반드시 하나의 Milestone에 속함 |
| Bug/Feature 상호 배타 | 하나의 Issue에 Bug과 Feature 라벨 동시 불가 |
| Feature 상태 자동 | PM이 수동으로 Feature 상태를 변경할 수 없음 |
| 인덱스 자동 집계 | screen-index, events-index는 직접 수정 불가 |

## 산출물 저장

| 산출물 | 저장 위치 |
|--------|-----------|
| Milestone | PM-DOCS/Planning/Roadmap/ |
| Feature PRD | PM-DOCS/Planning/Feature_PRD/ |
| 화면 인덱스 | PM-DOCS/Planning/IA/ |
| 이벤트 인덱스 | PM-DOCS/Planning/events-index.yml |
| CIS 산출물 | PM-DOCS/Context Output/ |
| 변경 기록 | PM-DOCS/Planning/changelog.md |

## 기존 시스템과의 관계

- 기존 `/tasks` 커맨드 (project-task-manager): 개발 태스크 단건 CRUD → 변경 없음
- 새 `/pm` 커맨드 (pm-planner): 기획 워크플로우 전담 → 신규 추가
- pm-planner가 Issue 생성 시 project-task-manager의 기존 API 활용

## 관련 Codebase Context

- [PM Planner Agent](../codebase/pm-planner-agent.md)
- [Planning Skill](../codebase/planning-skill.md)
- [Project Task Manager Agent](../codebase/project-task-manager-agent.md)
