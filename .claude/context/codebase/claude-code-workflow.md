---
name: claude-code-workflow
description: Claude Code 작업 워크플로우 - 위임 규칙, 4-Phase 프로토콜, Agent Team 강령
keywords: [워크플로우, 위임, Phase, 계획, 검증, 구현, 리뷰, Skills2.0]
---

# Claude Code Workflow

Main Agent의 작업 관리 체계. 위임 규칙, 4-Phase 워크플로우, Agent Team 협업 규칙을 정의한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| .claude/CLAUDE.md | 작업 가이드 본문 | delegation_rules, workflow_protocol, agent_team_rules, evaluation_protocol |
| .claude/hooks/workflow-enforced.sh | 워크플로우 리마인더 Hook | UserPromptSubmit 시 Phase 준수 알림 |
| .claude/hooks/skill-forced.sh | Skill 평가 리마인더 Hook | UserPromptSubmit 시 Skill/Agent 평가 출력 알림 |
| .claude/hooks/session-wrap-suggester.sh | 세션 정리 제안 Hook | 세션 종료 시 /session-wrap 제안 |

## 핵심 흐름

### 4-Phase 워크플로우

1. **계획 (Planning)** → Context 수집 → TaskList 생성 → task-enricher로 Agent/Skill 할당 → Plan 문서 생성 → 사용자 승인
2. **검증 (Validation)** → Code Flow 분석 → UserFlow 분석 → Breaking Change 확인
3. **구현 (Implementation)** → Execution Plan에 따라 Subagent 조율 → 단위별 커밋
4. **리뷰 (Review)** → Task 완료 검증

### 위임 체계

- Main Agent는 PM 역할만 수행 (직접 코드 읽기/쓰기 금지)
- 모든 코드 작업은 전담 Subagent에 위임
- Agent frontmatter의 `skills` 필드로 Skill 자동 preload (Skills 2.0)

### Agent Team 규칙

- 동일 파일 수정 Agent는 순차 실행
- 병렬 스폰 전 파일 오너십 확인 필수
- Subagent 재시도 상한 2회, 미해결 시 Main에 보고

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
