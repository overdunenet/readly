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
| CI 빌드 캐시 | yarn 의존성 캐시로 CI 빌드 시간 단축 | PR 피드백 대기 시간 감소 |

## 사용자 흐름

1. 개발자가 Skill/Agent/Hook 문서를 작성할 때 → XML 태그와 긍정 표현 가이드를 참조하여 품질 향상
2. 장시간 세션에서 토큰 한계에 접근할 때 → HANDOFF.md를 작성하여 작업 상태 보존
3. Hook 출력이 과도할 때 → 출력 최적화 가이드를 적용하여 토큰 예산 내로 조정

## 관련 Codebase Context

- [context-handoff.md](../codebase/context-handoff.md)
- [prompt-structuring.md](../codebase/prompt-structuring.md)
