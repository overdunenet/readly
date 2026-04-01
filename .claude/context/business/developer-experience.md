---
name: developer-experience
description: Claude Code 사용자 경험 최적화 - 프롬프트 품질 및 세션 관리
keywords: [개발자경험, 프롬프트, 세션관리, 토큰최적화, 태스크관리]
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

## 사용자 흐름

1. 개발자가 Skill/Agent/Hook 문서를 작성할 때 → XML 태그와 긍정 표현 가이드를 참조하여 품질 향상
2. 장시간 세션에서 토큰 한계에 접근할 때 → HANDOFF.md를 작성하여 작업 상태 보존
3. Hook 출력이 과도할 때 → 출력 최적화 가이드를 적용하여 토큰 예산 내로 조정
4. 새 기능 작업 시작 전 → `/gpm next`로 GitHub Project 태스크를 확인하여 우선순위 기반 작업 선택
5. 작업 완료 후 → `/gpm done`으로 태스크 상태를 업데이트하여 프로젝트 진행 추적

## 태스크 관리 (GPM)

GPM(GitHub Project Manager)을 통해 GitHub Project V2 태스크를 관리합니다.

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| 다음 작업 추천 | 마일스톤 기한 + 최근 작업 맥락 기반 추천 | 작업 우선순위 자동 판단 |
| 작업 완료 처리 | 태스크 상태를 Done으로 업데이트 | 진행 상황 실시간 반영 |
| 프로젝트 현황 | 전체 태스크 상태 브리핑 | 프로젝트 가시성 확보 |
| 작업 계획 수립 | 태스크 분해 및 계획 | 체계적 작업 관리 |

## 관련 Codebase Context

- [context-handoff.md](../codebase/context-handoff.md)
- [prompt-structuring.md](../codebase/prompt-structuring.md)
- [gpm-configuration.md](../codebase/gpm-configuration.md)
