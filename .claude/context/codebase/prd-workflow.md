---
name: prd-workflow
description: Feature PRD 5-Phase 대화형 워크플로우 Skill 구조
keywords: [PRD, 워크플로우, Phase, Feature, ProductBrief, Milestone, CIS]
---

# PRD Workflow

Feature PRD를 5단계 대화형 워크플로우로 작성하는 Planning Skill.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| .claude/skills/planning/SKILL.md | Planning Skill 인덱스 | /pm 커맨드 진입점, 워크플로우 분기 |
| .claude/skills/planning/prd-workflow.md | PRD 5-Phase 워크플로우 | Phase A→E 순차 실행, Checkpoint Protocol |
| PM-DOCS/Planning/templates/ | PRD/Milestone 작성 템플릿 | PRD 11섹션 템플릿, screens/events YAML 템플릿 |

## 핵심 흐름

1. **Phase A: 컨텍스트 수집** — A0: Product Brief 읽기 → A1: Milestone 선택 → A2: CIS 산출물 참조
2. **Phase B: 핵심 요구사항 수집** — Feature명, 목표/성공지표, 유저스토리, 유저플로우
3. **Phase C: 상세 정의** — 화면 정의(screens.yml), 이벤트 정의(events.yml), 수용 기준(AC)
4. **Phase D: 기술 & 엣지 케이스** — 기술 요건, MVP/Growth/Vision 스코프 분류
5. **Phase E: 검증 & 저장** — 일관성 검증, 산출물 저장, Issue 분해 분기

## 주요 연결점

- **Product Brief**: `PM-DOCS/Context Output/innovation-strategy_2026-02-25_product-brief.md` — Phase A0에서 필수 참조
- **산출물 경로**: `PM-DOCS/Planning/Feature_PRD/feature#{N}_{name}/` — PRD.md, screens.yml, events.yml
- **집계 파일**: `PM-DOCS/Planning/IA/screen-index.yml`, `PM-DOCS/Planning/events-index.yml`

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
