---
name: pm-planner-agent
description: PM 기획 워크플로우 전담 Agent - Milestone/Feature/Issue 관리 및 CIS 워크플로우
keywords: [PM, 기획, PRD, Milestone, Feature, Issue, CIS, Agent]
estimated_tokens: ~400
related_contexts:
  - codebase-planning-skill
  - codebase-project-task-manager-agent
  - business-pm-workflow
---

# PM Planner Agent

PM 기획 워크플로우를 담당하는 전문 Agent (opus 모델). `/pm` 커맨드의 메인 실행 주체.

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|-----------|
| .claude/agents/pm-planner.md | Agent 정의 | Persona, Role, Instructions, Constraints, Output |

## 핵심 흐름

1. `/pm` 커맨드 → planning/SKILL.md가 pm-planner Agent 호출
2. 3-Menu 시스템: New Task / Edit Task / Context Making
3. New Task → Milestone 생성, Feature PRD 작성 (5-Phase A→E), Issue 생성
4. Feature PRD 작성 시 대화형 5-Phase 워크플로우 실행
5. Issue 생성 시 project-task-manager Agent에 GitHub Issue CRUD 위임

## 주요 기능

| 기능 | 설명 |
|------|------|
| Milestone 관리 | 마일스톤 생성/수정, 상태 수동 관리 |
| Feature PRD 작성 | 5-Phase 대화형 워크플로우 (Phase A→E) |
| Issue 관리 | Bug/Enhancement 분류, GitHub Issue 생성 |
| CIS 워크플로우 | 5종 Creative Intelligence 워크플로우 실행 |
| 자동 상태 전파 | Feature 상태를 하위 Issue 기반으로 자동 계산 |

## 불변 규칙 (9개)

1. Feature는 반드시 Milestone에 소속
2. Bug와 Feature 라벨은 상호 배타적
3. Bug Issue는 Milestone을 가질 수 없음
4. Bug는 Feature 계층과 독립
5. Milestone 상태는 수동 관리만 가능
6. Feature 상태는 하위 Issue 기반 자동 계산
7. Enhancement는 1개 Feature에만 소속
8. Archive 파일은 PRD 참조에서 제외
9. IA/events-index.yml은 자동 집계만 허용

## 참조 문서

| 참조 | 경로 |
|------|------|
| PRD 워크플로우 | .claude/skills/planning/prd-workflow.md |
| PRD 템플릿 | .claude/skills/planning/prd-template.md |
| CIS 가이드 | .claude/skills/planning/cis-guide.md |
| PM 설정 | .claude/skills/planning/pm-config.yml |
| PM-DOCS 템플릿 | PM-DOCS/Planning/templates/ |

## 관련 Business Context

- [PM 워크플로우](../business/pm-workflow.md)

## 관련 문서

- `codebase/planning-skill.md`: Planning Skill 구현
- `codebase/project-task-manager-agent.md`: Task Manager Agent
