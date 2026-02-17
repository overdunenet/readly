---
name: prd-template-guide
description: PRD 11섹션 작성 가이드. pm-planner가 PRD 작성 시 참조하는 섹션별 지침.
keywords: [PRD, 템플릿, 유저스토리, 수용기준, SMART, Given-When-Then]
estimated_tokens: ~800
---

# PRD 작성 가이드

> 이 문서는 pm-planner Agent가 PRD 작성 시 참조하는 가이드입니다.
> 실제 PRD 템플릿 파일: `PM-DOCS/Planning/templates/PRD-TEMPLATE.md`

## 핵심 원칙 (BMAD)

1. **Facilitator, not Generator**: PRD는 사용자의 답변으로 채운다. AI가 대신 작성하지 않는다.
2. **Information Density**: 모든 문장이 정보 가치를 가져야 한다. "The system will allow users to..." → "Users can..."
3. **Traceability Chain**: Vision → Success Criteria → User Journeys → Functional Requirements
4. **SMART Criteria**: 모든 지표는 Specific, Measurable, Attainable, Relevant, Traceable

## 섹션별 작성 지침

### §1. 개요

- Feature명: 명확하고 구분 가능한 이름
- 소속 Milestone: M-{XXX} 형식으로 참조
- 한 줄 요약: 30자 이내로 핵심 가치 표현

### §2. 목표 & 성공 지표

- 비즈니스 목표: "왜 이 기능이 필요한가?"에 대한 명확한 답
- SMART 성공 지표 테이블:
  - 지표명: 구체적 측정 항목
  - 측정 방법: 어떻게 측정하는가
  - 현재 값: 베이스라인 (없으면 "신규")
  - 목표 값: 달성하려는 수치
  - 기한: 측정 시점

**Anti-Pattern 챌린지**:
| 모호한 표현 | 구체적 표현 |
|------------|-----------|
| "사용성 개선" | "회원가입 완료율 60%→75% (3개월 내)" |
| "성능 향상" | "API 응답시간 P95 500ms→200ms" |
| "사용자 만족도 증가" | "NPS 30→50 (분기 내)" |

### §3. 유저스토리

- 형식: `{역할}로서, {행동}하고 싶다, {가치}를 위해`
- US-{N} 형식의 고유 ID 부여
- 핵심 3-7개 권장 (MVP 스코프 내)
- 각 US는 독립적으로 구현/테스트 가능해야 함

### §4. 유저 플로우

- 메인 플로우: 가장 일반적인 사용 경로
  - [진입] → [행동] → [결과] → [완료]
- 대안 플로우: 조건 분기, 에러 경로
- Mermaid 다이어그램 선택적 사용

### §5. 화면 정의

- PRD 내 요약 테이블 + screens.yml 상세 파일
- 화면 ID: SCR-{NNN} 형식 (전역 고유)
- 기존 screen-index.yml과 중복 검사 필수

### §6. 이벤트 정의

- PRD 내 요약 테이블 + events.yml 상세 파일
- Mixpanel 기반 스키마
- category: interaction / navigation / conversion / error
- PII 플래그 필수 표기

### §7. 수용 기준 (Acceptance Criteria)

- Given-When-Then 형식
- 각 US에 최소 1개 AC 매핑
- AC-{N} 형식의 고유 ID

**예시**:

```
### AC-1 (US-1 관련)
- **Given**: 로그인하지 않은 사용자가 포스트 상세 페이지에 있을 때
- **When**: "구매하기" 버튼을 클릭하면
- **Then**: 로그인 페이지로 리다이렉트되고, 로그인 후 원래 페이지로 돌아온다
```

### §8. 기술 요건

- API 변경: tRPC Router, Service, Entity 단위
- DB 스키마 변경: Migration 파일 필요 여부
- 외부 의존성: 새 패키지, 외부 API 등
- **Implementation Leakage 주의**: 기술명/라이브러리명은 가능한 추상화

### §9. 엣지 케이스 & 에러 처리

- 번호순 정리
- 각 케이스별 처리 방법 구체적 명시
- "무시한다"도 유효한 처리 방법 (이유 기록)

### §10. 우선순위 & 스코프

- **MVP**: 이번 Feature에서 반드시 포함
- **후속 개선**: 다음 이터레이션
- Smart Scope Negotiation 적용

### §11. 참조 문서

- CIS 산출물 경로 (Context Output/)
- 디자인 파일 링크
- 기술 문서 참조
- Archive 파일은 제외 (불변 규칙 #8)

## Frontmatter 필드 설명

```yaml
feature_name: Feature 식별명
milestone: "M-{XXX}" 소속 마일스톤 ID
status: "draft | review | approved | decomposed | archived"
  # draft: 작성 중 (임시 저장)
  # review: 검토 대기
  # approved: 승인 완료
  # decomposed: Issue 분해 완료
  # archived: 보관 (소프트 삭제)
created_at: 생성일
updated_at: 최종 수정일
author: 작성자
label: "feature:{name}" GitHub 라벨
progress:
  phase_a~e: 각 Phase 완료 여부
  issue_decomposed: Issue 분해 완료 여부
```
