---
name: cis-guide
description: CIS 5종 워크플로우 가이드. 상황별 자동 추천 + 각 워크플로우 단계별 실행 지침.
keywords:
  [
    CIS,
    Brainstorming,
    Design Thinking,
    Problem Solving,
    Innovation Strategy,
    Storytelling,
    브레인스토밍,
    디자인씽킹,
  ]
estimated_tokens: ~3000
---

# CIS (Creative Intelligence System) 워크플로우 가이드

> 이 문서는 pm-planner Agent가 `/pm → Context Making` 실행 시 참조하는 가이드입니다.
> 산출물 저장 경로: `PM-DOCS/Context Output/{workflow}_{YYYY-MM-DD}_{topic}.md`

## 상황별 자동 추천 로직

사용자에게 현재 상황을 AskUserQuestion으로 물어본 후 적합한 워크플로우를 추천한다.

### S1: 신규 기능 기획 (아이디어 단계)

| 조건                            | 추천 워크플로우                        |
| ------------------------------- | -------------------------------------- |
| 아이디어가 1개이고 구체적       | **Design Thinking** (솔루션 검증 필요) |
| 아이디어가 모호하거나 여러 방향 | **Brainstorming** (발산 필요)          |
| 기존 Brainstorming 산출물 있음  | CIS 스킵 → 바로 PRD                    |

### S2: 데이터 기반 개선 (문제 발견)

| 조건                      | 추천 워크플로우                      |
| ------------------------- | ------------------------------------ |
| 원인이 명확함             | CIS 스킵 → 바로 PRD                  |
| 원인이 불명확             | **Problem Solving** (근본 원인 분석) |
| 원인은 알지만 솔루션 모호 | **Design Thinking** (솔루션 설계)    |

### S3: 전략적 이니셔티브

| 조건                                 | 추천 워크플로우                                |
| ------------------------------------ | ---------------------------------------------- |
| 전략 문서/로드맵 존재                | CIS 스킵 또는 **Storytelling** (내러티브 보강) |
| 방향만 결정, 구체안 없음             | **Innovation Strategy** → Brainstorming        |
| 기존 Innovation Strategy 산출물 있음 | **Brainstorming**만                            |

### S4: 사용자 요청/VOC

| 조건                        | 추천 워크플로우                       |
| --------------------------- | ------------------------------------- |
| 피드백이 구체적 (기능 명시) | **Design Thinking** (유저 관점 검증)  |
| 피드백이 모호 (불만만 표현) | **Problem Solving** → Design Thinking |
| 피드백 양이 많고 다양       | **Brainstorming** → Design Thinking   |

### S5: 기술 부채/리팩토링

| 조건                | 추천 워크플로우                      |
| ------------------- | ------------------------------------ |
| 기술적 문제만       | CIS 스킵 → 바로 PRD (기술 중심)      |
| 기술 변경이 UX 영향 | **Design Thinking** (영향 범위 분석) |

---

## 워크플로우 선택 프로세스

1. AskUserQuestion으로 상황(S1-S5) 확인
2. 상황에 따라 워크플로우 자동 추천 + 전체 목록도 표시
3. 사용자가 최종 선택
4. 선택된 워크플로우 실행
5. 산출물 `PM-DOCS/Context Output/`에 저장
6. "Feature 기획으로 이어가시겠습니까?" 분기

---

## 1. Brainstorming 워크플로우

> BMAD: Carson (Brainstorming Coach) - Master Brainstorming Facilitator + Innovation Catalyst

### Facilitation Persona

- **Communication Style**: 열정적인 즉흥 코치처럼 - 높은 에너지, "YES AND"로 아이디어 확장, 과감한 사고 격려
- **Core Principle**: 심리적 안전이 돌파구를 연다. 오늘의 과감한 아이디어가 내일의 혁신이 된다.

### 실행 단계

**Step 1: 세션 셋업**

- 주제/목표 확인
- 4가지 접근법 AskUserQuestion으로 제시:
  1. 사용자 직접 기법 선택
  2. AI 추천 기법
  3. 랜덤 기법 선택
  4. 점진적 기법 플로우

**Step 2: 기법 실행**

- 주요 기법:
  - **SCAMPER**: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
  - **Reverse Brainstorming**: "어떻게 하면 최악으로 만들 수 있을까?"
  - **Forced Connections**: 무관한 개념 연결
  - **Random Stimulus**: 무작위 자극으로 연상
  - **Six Thinking Hats**: 관점별 사고 전환
- 목표: **최소 20+ 아이디어** 생성 (조직화 전)
- Anti-Bias Protocol: 매 5개 아이디어마다 다른 관점으로 전환

**Step 3: 아이디어 조직화**

- 테마 클러스터링
- 우선순위 평가 (Impact × Feasibility)
- 상위 3-5개 아이디어 선정
- 액션 플랜 도출

**Step 4: 산출물 생성**

- 파일: `PM-DOCS/Context Output/brainstorming_{YYYY-MM-DD}_{topic}.md`
- 내용: 세션 요약, 전체 아이디어 목록, 테마 클러스터, 상위 선정 아이디어, 액션 아이템

---

## 2. Design Thinking 워크플로우

> BMAD: Maya (Design Thinking Coach) - Human-Centered Design Expert + Empathy Architect

### Facilitation Persona

- **Communication Style**: 재즈 뮤지션처럼 - 테마 주변에서 즉흥 연주, 생생한 감각 비유, 가정에 장난스럽게 도전
- **Core Principle**: 디자인은 "우리"가 아닌 "그들"에 관한 것. 사용자와 함께 디자인하라, 사용자를 위해가 아니라.

### 실행 단계

**Step 1: 디자인 챌린지 정의**

- 해결하려는 문제/기회 명확화
- 대상 사용자 그룹 식별
- 챌린지 스테이트먼트 작성

**Step 2: EMPATHIZE - 사용자 이해 구축**

- 공감 방법 3-5개 선택:
  - 사용자 인터뷰, 관찰, 여정 매핑
  - 페르소나 구축, 공감 지도
- 핵심 인사이트 수집

**Step 3: DEFINE - 문제 프레이밍**

- POV(Point of View) 스테이트먼트 작성:
  - "[사용자]는 [니즈]가 필요하다, 왜냐하면 [인사이트]이기 때문"
- "How Might We" 질문 도출 (3-5개)

**Step 4: IDEATE - 다양한 솔루션 생성**

- 최소 15-30개 아이디어 생성
- Crazy 8s, Worst Possible Idea 등 기법 활용
- 상위 2-3개 컨셉 선정

**Step 5: PROTOTYPE - 아이디어 구체화**

- Low-fidelity 프로토타입 설계
- 와이어프레임, 스토리보드, 시나리오
- 핵심 가정 식별

**Step 6: TEST - 사용자 검증**

- 테스트 계획 수립 (대상 5-7명)
- 피드백 수집 프레임워크
- 핵심 학습 정리

**Step 7: 이터레이션 계획**

- 개선 사항 정리
- 액션 아이템
- 성공 지표

**산출물**: `PM-DOCS/Context Output/design-thinking_{YYYY-MM-DD}_{topic}.md`

---

## 3. Problem Solving 워크플로우

> BMAD: Dr. Quinn (Creative Problem Solver) - Systematic Problem-Solving Expert + Solutions Architect

### Facilitation Persona

- **Communication Style**: 셜록 홈즈 + 장난기 있는 과학자 - 연역적, 호기심 가득, 돌파구에서 "AHA!" 순간
- **Core Principle**: 모든 문제는 약점을 드러내는 시스템이다. 근본 원인을 끈질기게 추적하라.

### 실행 단계

**Step 1: 문제 정의 & 정제**

- Problem Statement 작성
- 문제의 범위, 영향, 긴급성 파악

**Step 2: 진단 & 경계 설정**

- Is/Is Not 분석 (문제인 것 vs 아닌 것)
- 영향 범위 식별

**Step 3: 근본 원인 분석**

- 기법 선택:
  - **Five Whys**: 5번 "왜?"를 반복하여 근본 원인 도달
  - **Fishbone Diagram**: 원인을 카테고리별 분류 (사람, 프로세스, 기술, 환경)
  - **Systems Thinking**: 시스템 관점에서 상호작용 분석
- 핵심 근본 원인 3-5개 도출

**Step 4: 영향력 & 제약 분석**

- Force Field Analysis (추진력 vs 저항력)
- 제약 조건 식별 (시간, 비용, 기술, 인력)

**Step 5: 솔루션 옵션 생성**

- 최소 10-15개 솔루션 아이디어
- 기법: **TRIZ** (발명적 문제 해결), **Lateral Thinking**, **Reverse Brainstorming**

**Step 6: 솔루션 평가 & 선택**

- Decision Matrix (Impact × Effort × Risk)
- 비용-편익 분석
- 상위 1-2개 솔루션 선정

**Step 7: 실행 계획**

- PDCA Cycle (Plan-Do-Check-Act)
- 단계별 액션 스텝
- 담당자, 기한, 리소스

**Step 8: 모니터링 & 검증**

- 성공 지표 정의
- 리스크 완화 계획
- 의사결정 게이트

**산출물**: `PM-DOCS/Context Output/problem-solving_{YYYY-MM-DD}_{topic}.md`

---

## 4. Innovation Strategy 워크플로우

> BMAD: Victor (Innovation Strategist) - Business Model Innovator + Strategic Disruption Expert

### Facilitation Persona

- **Communication Style**: 체스 그랜드마스터처럼 - 대담한 선언, 전략적 침묵, 파괴적으로 단순한 질문
- **Core Principle**: 시장은 진정한 새로운 가치를 보상한다. 비즈니스 모델 사고 없는 혁신은 극장이다.

### 실행 단계

**Step 1: 전략적 컨텍스트 수립**

- 회사/제품 현황 파악
- 전략적 도전 과제 정의

**Step 2: 시장 분석**

- **TAM/SAM/SOM**: 시장 규모 추정
- **Five Forces**: 경쟁 환경 분석
- **경쟁 포지셔닝**: 차별화 요소

**Step 3: 현재 비즈니스 모델 분석**

- **Business Model Canvas**: 9개 빌딩 블록
- **Value Proposition Canvas**: 고객 프로필 <-> 가치 맵

**Step 4: 파괴적 기회 식별**

- **Disruptive Innovation Theory**: 저가형/신시장 파괴
- **Jobs-to-be-Done**: 고객이 "고용"하는 기능
- **Blue Ocean Strategy**: 경쟁 없는 시장 공간

**Step 5: 혁신 기회 생성**

- **Three Horizons**: H1(핵심), H2(성장), H3(탐험)
- **Value Chain Analysis**: 가치 사슬 재구성

**Step 6: 전략 옵션 평가**

- 3가지 전략 옵션 도출
- 각 옵션별 리스크/보상 분석

**Step 7: 전략 방향 권고**

- 핵심 가설 정의
- 성공 요인 식별

**Step 8: 실행 로드맵**

- Phase 1 (0-3개월): 검증
- Phase 2 (3-6개월): 구축
- Phase 3 (6-12개월): 확장

**Step 9: 메트릭 & 리스크 완화**

- Leading/Lagging 지표
- 의사결정 게이트

**산출물**: `PM-DOCS/Context Output/innovation-strategy_{YYYY-MM-DD}_{topic}.md`

---

## 5. Storytelling 워크플로우

> BMAD: Sophia (Storyteller) - Expert Storytelling Guide + Narrative Strategist

### Facilitation Persona

- **Communication Style**: 서사시를 짜는 음유시인처럼 - 화려하고 기발하며, 모든 문장이 매혹적
- **Core Principle**: 강력한 내러티브는 시대를 초월한 인간 진실을 활용한다. 진정성 있는 이야기를 찾아라.

### 실행 단계

**Step 1: 스토리 컨텍스트 설정**

- 목적 (설득? 영감? 교육? 브랜딩?)
- 대상 청중
- 핵심 메시지 (1-3개)

**Step 2: 스토리 프레임워크 선택**
AskUserQuestion으로 프레임워크 제시:

- **Hero's Journey**: 영웅의 여정 (도전->시련->성장->귀환)
- **Pixar Story Spine**: Once upon a time... Every day... One day... Because of that...
- **Brand Story**: 브랜드의 탄생과 미션
- **Pitch Narrative**: 투자/설득용 내러티브
- **Data Storytelling**: 데이터 기반 내러티브

**Step 3: 스토리 요소 수집**

- 프레임워크별 핵심 질문으로 요소 수집
- 캐릭터, 갈등, 전환점, 해결

**Step 4: 감정 아크 설계**

- 감정적 여정: peaks와 valleys
- 공감 포인트, 긴장, 해소

**Step 5: 오프닝 훅 개발**

- 놀라운 사실, 질문, 대담한 선언
- 3초 안에 관심을 잡는 오프닝

**Step 6: 코어 내러티브 작성**

- 3가지 모드:
  1. 사용자 직접 작성 (피드백 제공)
  2. AI 초안 (사용자 수정)
  3. 공동 창작

**Step 7: 스토리 변형 생성**

- Short (30초 엘리베이터 피치)
- Medium (3분 프레젠테이션)
- Extended (전체 내러티브)

**Step 8: 활용 가이드라인**

- 채널별 맞춤 (프레젠테이션, 블로그, 소셜미디어)
- 톤/매너 가이드

**Step 9: 리파인먼트**

- 피드백 반영
- 최종 다듬기

**Step 10: 최종 산출물 생성**

**산출물**: `PM-DOCS/Context Output/storytelling_{YYYY-MM-DD}_{topic}.md`

---

## 산출물 공통 형식

```markdown
# {워크플로우명}: {주제}

> 생성일: YYYY-MM-DD
> 워크플로우: {brainstorming|design-thinking|problem-solving|innovation-strategy|storytelling}
> 관련 Feature: (있는 경우)

## 요약

(핵심 인사이트 3-5개)

## 상세 내용

(각 Step의 결과물)

## 액션 아이템

- [ ] 다음 단계 1
- [ ] 다음 단계 2

## 다음 단계 추천

- Feature 기획으로 이어가기: `/pm → New Task → Feature`
- 추가 CIS 워크플로우 실행: `/pm → Context Making`
```

## Archive 정책

- `PM-DOCS/Context Output/` 파일 중 30일 경과 → Archive/ 이동 제안
- Archive 파일은 PRD Phase A2 참조 목록에서 제외 (불변 규칙 #8)
- Archive 파일은 삭제하지 않음 (보존)
