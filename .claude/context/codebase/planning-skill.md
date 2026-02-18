---
name: planning-skill
description: PM 기획 워크플로우 Skill - /pm 커맨드 진입점, 메뉴 라우팅, 5-Phase PRD 워크플로우
keywords: [planning, /pm, PRD, 워크플로우, 메뉴, CIS, Skill]
estimated_tokens: ~400
related_contexts:
  - codebase-pm-planner-agent
  - codebase-project-task-manager-agent
  - business-pm-workflow
---

# Planning Skill

`/pm` 커맨드 진입점 및 메뉴 라우팅을 담당하는 Skill.

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|-----------|
| .claude/skills/planning/SKILL.md | Skill 정의 | /pm 커맨드, 메뉴 라우팅 |
| .claude/skills/planning/prd-workflow.md | PRD 워크플로우 | 5-Phase A→E 상세 프로세스 |
| .claude/skills/planning/prd-template.md | PRD 템플릿 | 11섹션 작성 가이드 |
| .claude/skills/planning/cis-guide.md | CIS 가이드 | 5종 Creative Intelligence 워크플로우 |
| .claude/skills/planning/pm-config.yml | PM 설정 | GitHub Project ID 중앙 관리 |

## 핵심 흐름

1. `/pm` 커맨드 입력 → SKILL.md 로드
2. 3단계 메뉴 표시: New Task / Edit Task / Context Making
3. 선택에 따라 pm-planner Agent 호출
4. pm-planner가 해당 참조 문서를 로드하여 작업 수행

## 메뉴 구조

```
/pm
├── 1. New Task
│   ├── Milestone 생성
│   ├── Feature PRD 작성 (5-Phase)
│   └── Issue 생성 (Bug/Enhancement)
├── 2. Edit Task
│   ├── Milestone 수정
│   ├── Feature PRD 수정
│   └── Issue 재할당
└── 3. Context Making
    └── CIS 5종 워크플로우
```

## 5-Phase PRD 워크플로우

| Phase | 이름 | 설명 |
|-------|------|------|
| A | 컨텍스트 | 프로젝트 배경, 목적, 문제 정의 |
| B | 요구사항 | 유저스토리, 수용 기준 도출 |
| C | 상세 | 화면 정의, 이벤트 정의 |
| D | 기술 | API, DB 스키마, 기술 요건 |
| E | 검증/저장 | PRD 검증 및 파일 저장 |

## 자동화 로직

| 자동화 | 설명 |
|--------|------|
| Feature 상태 전파 | 하위 Issue 상태 기반 자동 계산 |
| screen-index.yml | 모든 Feature screens.yml 자동 집계 → IA-table.md |
| events-index.yml | 모든 Feature events.yml 자동 집계 |
| Archive 이동 | 30일 경과 CIS 산출물 자동 아카이브 |

## PM-DOCS 저장 구조

```
PM-DOCS/
├── Planning/
│   ├── Roadmap/          → milestone-{NNN}.md
│   ├── Feature_PRD/      → feature#{N}_{name}/PRD.md, screens.yml, events.yml
│   ├── IA/               → screen-index.yml, IA-table.md
│   ├── templates/        → PRD-TEMPLATE.md, milestone-template.md
│   ├── changelog.md
│   └── events-index.yml
└── Context Output/       → CIS 워크플로우 산출물
    └── Archive/
```

## 관련 Business Context

- [PM 워크플로우](../business/pm-workflow.md)

## 관련 문서

- `codebase/pm-planner-agent.md`: PM Planner Agent
- `codebase/project-task-manager-agent.md`: Task Manager Agent
