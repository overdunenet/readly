---
name: planning-context-index
description: Planning Context 인덱스 - PM 기획 문서 (Roadmap, Feature PRD) 요약
keywords: [기획, PRD, Roadmap, Milestone, Feature, 마일스톤, 피쳐]
estimated_tokens: ~150
---

# Planning Context 인덱스

이 폴더는 Readly 서비스의 **미래 기획과 개발 계획**을 담고 있습니다.
"앞으로 무엇을 만들 것인가", "어떤 방향으로 나아가는가"에 대한 답입니다.

> **우선순위**: Planning Context는 Business/Codebase Context보다 우선합니다.
> Planning이 business와 상충할 경우, Planning이 "의도된 방향"이며 business는 "현재 상태"입니다.

## 원본 문서 위치

기획 원본은 `PM-DOCS/Planning/` 에 있습니다:

| 경로                            | 설명                                |
| ------------------------------- | ----------------------------------- |
| `PM-DOCS/Planning/Roadmap/`     | 마일스톤 파일 (M-{NNN}.md)          |
| `PM-DOCS/Planning/Feature_PRD/` | 피쳐별 PRD, screens.yml, events.yml |
| `PM-DOCS/Planning/IA/`          | 전역 화면 카탈로그 (자동 집계)      |
| `PM-DOCS/Planning/templates/`   | PRD/Milestone 작성 템플릿           |

## 현재 상태

- Roadmap: 아직 마일스톤 미작성 (템플릿 준비됨)
- Feature PRD: 아직 PRD 미작성 (템플릿 준비됨)
- `/pm` 커맨드로 기획 워크플로우 실행 가능

## 관련 Context

- **Product Brief**: `PM-DOCS/Context Output/innovation-strategy_2026-02-25_product-brief.md` — 제품 전략 기초 (PRD 작성 시 필수 참조)
- `business/access-control.md`: 현재 접근 권한 (PRD에서 변경 예정이면 확인)
- `business/payment.md`: 현재 결제 정책 (PRD에서 변경 예정이면 확인)
