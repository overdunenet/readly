---
name: developer-experience
description: Claude Code 사용자 경험 최적화 - 프롬프트 품질 및 세션 관리
keywords: [개발자경험, 프롬프트, 세션관리, 토큰최적화]
---

# Developer Experience

## 목적

Claude Code를 사용하는 개발자가 더 정확한 결과를 얻고, 장시간 작업 시 진행 상황을 잃지 않도록 도구 사용 경험을 개선한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| 세션 인수인계 | 장시간 작업 시 진행 상황을 압축하여 새 세션에 전달 | 작업 연속성 보장, 반복 설명 제거 |
| 지시 문서 표준화 | AI에 전달하는 규칙/지시를 구조화된 형식으로 작성 | 더 정확하고 일관된 AI 응답 |
| 응답 최적화 | AI 출력의 분량과 형식을 관리하여 비용 효율 확보 | 빠른 응답, 불필요한 출력 제거 |
| 세션 정리 분석 | PR diff 기반 반복 패턴/학습 포인트/후속 작업 자동 도출 | 작업 회고 자동화, 지식 축적 |
| 구조화된 보고 | Subagent 결과를 Discoveries/Changes/Reasoning 3축으로 구조화 | 일관된 작업 추적, 의사결정 투명성 |
| 자동 위임 체계 | 전문화된 Agent가 역할별로 작업을 분담하고 Main이 조율 | 복잡한 작업의 체계적 수행 |

## 사용자 흐름

1. 개발자가 Skill/Agent/Hook 문서를 작성할 때 → XML 태그와 긍정 표현 가이드를 참조하여 품질 향상
2. 장시간 세션에서 토큰 한계에 접근할 때 → HANDOFF.md를 작성하여 작업 상태 보존
3. Hook 출력이 과도할 때 → 출력 최적화 가이드를 적용하여 토큰 예산 내로 조정
4. 복잡한 기능 구현 시 → 4-Phase 워크플로우(계획→검증→구현→리뷰)에 따라 체계적 수행
5. PR 완료 후 세션 정리 시 → /session-wrap으로 반복 패턴 분석 및 후속 작업 자동 도출

## 관련 Codebase Context

- [context-handoff.md](../codebase/context-handoff.md)
- [prompt-structuring.md](../codebase/prompt-structuring.md)
- [claude-code-agents.md](../codebase/claude-code-agents.md)
- [claude-code-workflow.md](../codebase/claude-code-workflow.md)
