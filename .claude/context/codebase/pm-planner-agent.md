---
name: pm-planner-agent
description: PM 기획 워크플로우 전담 Agent 및 Planning Skill 구조
keywords: [PM, 기획, PRD, CIS, 워크플로우, Milestone, Feature, Issue]
---

# PM Planner Agent

PM 기획 워크플로우를 전담하는 Agent. Milestone/Feature/Issue 관리, PRD 작성, CIS 워크플로우 실행을 담당한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| .claude/agents/pm-planner.md | Agent 정의 | Persona, 불변 규칙 9개, CIS Facilitation Rules 6개 |
| .claude/skills/planning/SKILL.md | /pm 진입점 | 메인 메뉴 라우팅, 서브파일 구조 |
| .claude/skills/planning/prd-workflow.md | PRD 5-Phase 워크플로우 | Phase A→E 상세 가이드 |
| .claude/skills/planning/prd-template.md | PRD 작성 가이드 | PRD 11섹션 작성 지침 |
| .claude/skills/planning/cis-guide.md | CIS 공통 규칙 + 라우터 | 워크플로우 선택, 중간 저장 메커니즘 |
| .claude/skills/planning/cis-brainstorming.md | Brainstorming 6-Phase 가이드 | Carson 페르소나 |
| .claude/skills/planning/cis-design-thinking.md | Design Thinking 7-Phase 가이드 | Maya 페르소나 |
| .claude/skills/planning/cis-problem-solving.md | Problem Solving 6-Phase 가이드 | Dr. Quinn 페르소나 |
| .claude/skills/planning/cis-innovation-strategy.md | Innovation Strategy 7-Phase 가이드 | Victor 페르소나 |
| .claude/skills/planning/cis-storytelling.md | Storytelling 6-Phase 가이드 | Sophia 페르소나 |
| .claude/skills/planning/pm-config.yml | 중앙 설정 | GitHub Project ID, 경로, 라벨 |

## 핵심 흐름

1. `/pm` 입력 → AskUserQuestion으로 메인 메뉴 (New Task / Edit Task / Context Making)
2. New Task → Milestone 생성 / Feature PRD 작성 / Issue 생성
3. Context Making → CIS 워크플로우 선택 → 개별 가이드 파일 참조하여 Phase별 실행
4. 모든 대화에서 Checkpoint Protocol 적용 (PRD: C/A/P, CIS: A/R/C/P)

## CIS Facilitation Rules

1. Facilitator, Not Generator — 사용자 대신 내용을 생성하지 않음
2. One Phase At A Time — 한 번에 1개 Phase만 실행
3. Wait For User — 질문 후 사용자 응답 대기 필수
4. YES AND Pattern — 사용자 아이디어를 부정하지 않고 확장
5. Checkpoint Mandatory — 매 Phase 완료 시 체크포인트 실행
6. Persona Immersion — 선택된 워크플로우의 페르소나 유지

## 산출물 경로

| 산출물 | 경로 |
|--------|------|
| PRD | PM-DOCS/Planning/Feature_PRD/feature#{N}_{name}/PRD.md |
| Milestone | PM-DOCS/Planning/Roadmap/milestone-{NNN}.md |
| CIS 산출물 | PM-DOCS/Context Output/{workflow}_{YYYY-MM-DD}_{topic}.md |

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
