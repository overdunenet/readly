---
name: project-task-manager-agent
description: GitHub Project 태스크 CRUD 전담 Agent - Issue 조회/생성/상태변경/삭제
keywords: [GitHub, Project, 태스크, Issue, CRUD, gh CLI]
estimated_tokens: ~300
related_contexts:
  - codebase-pm-planner-agent
  - codebase-planning-skill
  - business-pm-workflow
---

# Project Task Manager Agent

GitHub Project를 통한 개발 태스크 관리 전담 Agent (sonnet 모델).

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|-----------|
| .claude/agents/project-task-manager.md | Agent 정의 | Step 1-4 실행 프로세스, ID 매핑 |
| .claude/skills/task-management/SKILL.md | Skill 정의 | /tasks 커맨드, gh CLI 참조 |
| .claude/skills/planning/pm-config.yml | 중앙 설정 | Project ID, Field ID, Status/Priority 옵션 ID |

## 핵심 흐름

1. 사용자 요청 파악 (조회/생성/상태변경/우선순위변경/삭제)
2. 현재 태스크 목록 확인 (gh project item-list)
3. 작업 실행 (gh CLI 명령어)
4. 결과 확인 및 마크다운 테이블 출력

## 상태/우선순위

| Status | 설명 |
|--------|------|
| Backlog | 백로그 |
| Ready | 준비됨 |
| In progress | 진행중 |
| In review | 리뷰중 |
| Done | 완료 |

| Priority | 설명 |
|----------|------|
| P0 | 긴급 |
| P1 | 중요 |
| P2 | 보통 |

## pm-planner와의 역할 분담

| 영역 | project-task-manager | pm-planner |
|------|---------------------|------------|
| Issue 생성 | 단건 CRUD | Feature Issue 일괄 생성 |
| 라벨 관리 | 미지원 | feature:{name} 라벨 관리 |
| Milestone | 미지원 | Milestone 생성/관리 |
| PRD | 미지원 | 5-Phase PRD 작성 |

## 관련 Business Context

- [PM 워크플로우](../business/pm-workflow.md)

## 관련 문서

- `codebase/pm-planner-agent.md`: PM Planner Agent
- `codebase/planning-skill.md`: Planning Skill 구현
