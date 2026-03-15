---
name: claude-code-agents
description: Claude Code Agent 시스템 - 전문화된 Subagent 정의 및 역할 분담
keywords: [agent, subagent, 위임, 자동화, 분석, 코드작성, 리뷰]
---

# Claude Code Agents

프로젝트의 Subagent 시스템. Main Agent가 PM 역할로 전문화된 Subagent를 조율한다.

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|----------|
| .claude/agents/code-writer.md | 코드 작성 Agent (opus) | 로직 구현, 기능 개발, 리팩토링 |
| .claude/agents/simple-code-writer.md | 단순 수정 Agent (haiku) | lint, 오타, 설정값 수정 |
| .claude/agents/code-reviewer.md | 코드 리뷰 Agent | Skill 규칙 준수 확인, Critical/Warning 분류 |
| .claude/agents/qa-tester.md | 테스트 검증 Agent | 테스트/빌드 실행 및 결과 검증 |
| .claude/agents/explore.md | 코드베이스 탐색 Agent | Glob/Grep 기반 파일 검색 |
| .claude/agents/context-collector.md | Context 수집 Agent | 소스 코드 패턴/구현 방식 분석 |
| .claude/agents/context-manager.md | Context 정리 Agent | 문서 구조 최적화, 토큰 절약 |
| .claude/agents/impact-analyzer.md | 영향 분석 Agent | 호출 관계 추적, Breaking Change 탐지 |
| .claude/agents/task-planner.md | 계획 수립 Agent | 요구사항 분해, TaskList 생성 |
| .claude/agents/task-enricher.md | Task 할당 Agent | Task별 Agent/Skill 할당, Execution Plan 작성 |
| .claude/agents/plan-verifier.md | Plan 검증 Agent | 목적 정합성, 완전성, 스코프 검증 |
| .claude/agents/architect.md | 설계 Agent | 시스템 구조 분석, 설계 대안 비교 |
| .claude/agents/designer.md | UI 설계 Agent | 컴포넌트 구조, 레이아웃, 반응형 설계 |
| .claude/agents/git-manager.md | Git 작업 Agent | 커밋, PR, 브랜치 관리 |
| .claude/agents/director.md | 스펙 검증 Agent | 문서 간 논리적 충돌 검사 |
| .claude/agents/automation-scout.md | 반복 패턴 분석 Agent (sonnet) | PR diff에서 Skill 후보 제안 |
| .claude/agents/learning-extractor.md | 학습 포인트 추출 Agent (sonnet) | PR 변경에서 Context/규칙 후보 제안 |
| .claude/agents/followup-suggester.md | 후속 작업 제안 Agent | PR에서 미완성 항목 식별 |

## 핵심 흐름

1. Main Agent가 사용자 요청 수신 → task-planner로 TaskList 생성
2. task-enricher가 각 Task에 Execution Plan (Agent/Skill 할당) 추가
3. Main Agent가 Execution Plan에 따라 Subagent를 순차/병렬 호출
4. 각 Subagent는 Reporting Skill의 3축(Discoveries/Changes/Reasoning)으로 결과 반환
5. code-reviewer 또는 qa-tester로 결과 검증

## Agent 분류

| 유형 | Agent | 주력 보고 축 |
|------|-------|-------------|
| 탐색형 | explore, context-collector, impact-analyzer | Discoveries |
| 수정형 | code-writer, simple-code-writer | Changes + Reasoning |
| 검증형 | code-reviewer, qa-tester | Discoveries + Reasoning |
| 관리형 | git-manager, context-manager | Changes |
| 분석형 | automation-scout, learning-extractor, followup-suggester | Discoveries + Reasoning |

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
