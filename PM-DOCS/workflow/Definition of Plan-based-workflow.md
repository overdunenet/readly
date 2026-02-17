# Readly PM 워크플로우 통합 분석서

> **작성일**: 2026-02-18  
> **대상**: Readly 레포지토리 — PM 기획·태스크 관리 워크플로우  
> **목적**: `/pm` 커맨드 기반의 전체 워크플로우 흐름을 체계적으로 문서화하고, 기존 시스템과의 충돌 지점을 식별

---

## TL;DR

`/pm` 커맨드는 **3가지 진입점**(New Task · Edit Task · Context Making)을 가지며, New Task 하위에 **Milestone → Feature → Issue** 3계층 워크플로우가 있다. Feature 워크플로우가 가장 복잡하며, CIS 컨텍스트 생성 → PRD 작성 → GitHub Issue 자동 분해까지 이어지는 파이프라인이다. 모든 산출물은 `PM-DOCS/` 폴더에 SSOT로 관리되고, 상태 전파는 **Issue → Feature는 자동**, **Milestone은 PM 수동**이다. GitHub Issue는 반드시 "Bug" 라벨 또는 "Feature명" 라벨 중 하나를 가지며, Bug는 프로덕션 기능 오류 대상으로 Milestone/Feature 계층 밖에서 독립 관리된다.

---

## 1. /pm 커맨드 — 최상위 진입점

```
/pm
 ├── 1. New Task ──────→ 신규 일감 생성 (기획 포함)
 │    ├── Milestone
 │    ├── Feature
 │    └── Issue
 │
 ├── 2. Edit Task ─────→ 기존 일감 수정·업데이트
 │    ├── Milestone
 │    ├── Feature
 │    └── Issue
 │
 └── 3. Context Making → CIS 워크플로우 단독 실행
```

---

## 2. Context Making (단독 실행)

CIS(Context-Ideation-Solution) 모듈의 B-MAD 에이전트가 실행하는 **사전 기획 워크플로우**다. Feature 기획 전에 아이디어를 발산하거나 문제를 분석할 때 독립적으로 실행할 수 있다.

### 2-1. 실행 흐름

```
Context Making 선택
  │
  ├→ 5개 CIS 워크플로우 선택지 제시
  │    ① Brainstorming        — 아이디어 발산 (SCAMPER, Reverse Brainstorm)
  │    ② Design Thinking      — 사용자 중심 설계·솔루션 검증 (Empathize→Define→Ideate→Prototype→Test)
  │    ③ Problem Solving      — 근본 원인 분석 (Define→Root Cause→Solution Gen→Action Plan)
  │    ④ Innovation Strategy  — 혁신 전략 수립 (Assess→Diverge→Converge→Plan)
  │    ⑤ Storytelling         — 내러티브 구축 (Hero's Journey→Story Arc→Narrative)
  │
  ├→ 선택한 워크플로우 실행
  │
  ├→ 산출물을 PM-DOCS/Context_Output/ 에 저장
  │    파일명: {워크플로우명}_{날짜}_{주제}.md
  │
  └→ ✅ 프로세스 완료
```

### 2-2. CIS 워크플로우 자동 선택 가이드 (상황별 매핑)

어떤 상황에서 어떤 CIS 워크플로우를 선택해야 하는지의 판단 기준:

| 상황                      | 조건                                 | 추천 워크플로우                     |
| ------------------------- | ------------------------------------ | ----------------------------------- |
| **S1** 신규 기능 기획     | 아이디어 1개, 구체적                 | Design Thinking                     |
|                           | 아이디어 모호/여러 방향              | Brainstorming                       |
|                           | 기존 Brainstorming 산출물 있음       | CIS 스킵 → 바로 PRD                 |
| **S2** 데이터 기반 개선   | 원인 명확                            | CIS 스킵 → 바로 PRD                 |
|                           | 원인 불명확                          | Problem Solving                     |
|                           | 원인은 알지만 솔루션 모호            | Design Thinking                     |
| **S3** 전략적 이니셔티브  | 전략 문서/로드맵 존재                | CIS 스킵 또는 Storytelling          |
|                           | 방향만 결정, 구체안 없음             | Innovation Strategy → Brainstorming |
|                           | 기존 Innovation Strategy 산출물 있음 | Brainstorming만                     |
| **S4** 사용자 요청/VOC    | 피드백이 구체적 (기능 명시)          | Design Thinking                     |
|                           | 피드백이 모호 (불만만 표현)          | Problem Solving → Design Thinking   |
|                           | 피드백 양이 많고 다양                | Brainstorming → Design Thinking     |
| **S5** 기술 부채/리팩토링 | 기술적 문제만                        | CIS 스킵 → 바로 PRD                 |
|                           | 기술 변경이 UX 영향                  | Design Thinking                     |

### 2-3. 산출물 관리 규칙

| 항목         | 규칙                                                  |
| ------------ | ----------------------------------------------------- |
| 저장 경로    | `PM-DOCS/Context_Output/`                             |
| 파일 형식    | `.md` (마크다운)                                      |
| 아카이빙     | 생성일로부터 **30일 경과** 시 `Archive/` 로 자동 이동 |
| Archive 특성 | PRD 작성 시 **참조 대상에서 제외** (냉동 보관)        |

---

## 3. New Task 워크플로우

### 3-1. Milestone 워크플로우

마일스톤은 **기간 내 달성 목표** 단위이며, 작업 계층의 최상위다.

```
Milestone 선택
  │
  ├→ 마일스톤 메타데이터 입력
  │    • 마일스톤 번호 (M-XXX)
  │    • 마일스톤 목표 (예: "MVP 출시")
  │    • 마일스톤 기간 (시작일 ~ 종료일)
  │
  ├→ "바로 피쳐 기획할까요?" 분기
  │    │
  │    ├── Yes → Feature 워크플로우로 이동 (§3-2)
  │    │
  │    └── No  → 마일스톤 파일 생성 후 작업 완료
  │              • 저장: PM-DOCS/Planning/Roadmap/milestone-XXX.md
  │              • 상태: backlog
  │
  └→ ✅ 프로세스 완료
```

**핵심 규칙**: 마일스톤 상태(backlog/ongoing/done)는 **PM이 수동으로만 변경**. 하위 Feature/Issue 상태와 무관.

---

### 3-2. Feature 워크플로우 ⭐ (가장 복잡 — 5 Phase)

Feature는 마일스톤 하위의 **에픽 기능 단위**이다. CIS 컨텍스트 → PRD 작성 → GitHub Issue 분해까지 전체 기획 파이프라인을 포함한다.

```
Feature 선택
  │
  │ ┌─────────────────────────────────────────────┐
  │ │ PHASE 1: 컨텍스트 준비                       │
  │ └─────────────────────────────────────────────┘
  │
  ├→ "컨텍스트 미리 만들까요?" 분기
  │    │
  │    ├── Yes → Context Making 프로세스 실행 (§2)
  │    │         → 산출물 저장 후 다음 단계로
  │    │
  │    └── No  → 다음 단계로 직행
  │
  │ ┌─────────────────────────────────────────────┐
  │ │ PHASE 2: PRD 초안 생성                       │
  │ └─────────────────────────────────────────────┘
  │
  ├→ PRD 템플릿 로드 (미리 정의된 템플릿)
  │
  ├→ 컨텍스트 참조 파일 선택
  │    • Context_Output/ 폴더에서 최신순 최대 10개 로드
  │    • 사용자가 원하는 파일 복수 선택 가능
  │    • Archive/ 폴더 파일은 제외
  │
  ├→ 참조된 컨텍스트 분석 → PRD 초안 자동 생성
  │    (템플릿 기반 유지)
  │
  │ ┌─────────────────────────────────────────────┐
  │ │ PHASE 3: PRD 완성                            │
  │ └─────────────────────────────────────────────┘
  │
  ├→ 비어있는 항목에 대해 사용자와 문답 진행
  │    • 목표, 유저스토리, 수용기준, 기술요건 등
  │
  ├→ 모든 항목 채워지면 PRD 일관성 검증
  │    (내부 논리 충돌, 누락 항목 체크)
  │
  │ ┌─────────────────────────────────────────────┐
  │ │ PHASE 4: 산출물 저장                         │
  │ └─────────────────────────────────────────────┘
  │
  ├→ Feature_PRD 폴더에 하위 폴더 생성
  │    경로: PM-DOCS/Planning/Feature_PRD/feature#{N}_{feature-name}/
  │    │
  │    ├── PRD.md           ← 요구사항 문서 (피쳐당 1개)
  │    ├── screens.yml      ← 화면 ID·라우트·진입조건 (양식 미정)
  │    ├── events.yml       ← 이벤트 트래킹 정의 (Mixpanel)
  │    └── changelog.md     ← 변경 이력 (양식 미정)
  │
  │ ┌─────────────────────────────────────────────┐
  │ │ PHASE 5: GitHub Issue 자동 생성              │
  │ └─────────────────────────────────────────────┘
  │
  ├→ PRD 기반으로 개발 작업 세분화
  ├→ GitHub Issue + Sub-Issue 자동 생성
  │    • 라벨: Feature명 자동 부여
  │    • 마일스톤: 상위 Milestone 자동 부여
  │    • 기존 프로젝트의 agent/skill 규칙 따름
  │
  └→ ✅ 프로세스 완료
```

**부수 효과 정리**:

| 트리거                | 자동 수행                                               |
| --------------------- | ------------------------------------------------------- |
| Feature 생성          | GitHub 라벨 생성 (Feature명)                            |
| PRD 완성 → Issue 분해 | GitHub Issue 자동 생성 + 라벨/마일스톤 자동 배정        |
| screens.yml 생성      | → IA/screen-index.yml 자동 집계 → IA/IA-table.md 렌더링 |
| events.yml 생성       | → Planning/events-index.yml 자동 집계                   |

**Feature 상태 자동 전파**:

| 하위 Issue 조건      | Feature 상태 |
| -------------------- | ------------ |
| Issue 0개 배정       | `backlog`    |
| Issue 1개라도 진행중 | `ongoing`    |
| 모든 Issue가 done    | `done`       |

---

### 3-3. Issue 워크플로우

개발자가 **직접 개발 태스크를 생성**하는 워크플로우. Feature 워크플로우의 자동 Issue 생성과는 별개로, 수동으로 Bug Fix나 Enhancement를 등록할 때 사용한다.

```
Issue 선택
  │
  ├→ 라벨 유형 선택
  │    ├── Bug          — 프로덕션 서비스의 기능 오류, 완료된 기능의 버그 수정
  │    └── Enhancement  — 소규모 기능 추가/스펙 변경
  │
  │
  │ ═══════════════════════════════════════
  │ [Bug 선택 시]
  │ ═══════════════════════════════════════
  │
  ├→ GitHub Issue 생성 (라벨: "Bug")
  │    • 마일스톤: 없음 (Milestone/Feature 계층 밖 독립 관리)
  │
  ├→ "지금 작업 시작할까요?" 분기
  │    │
  │    ├── Yes → 이슈 템플릿에 따라 내용 작성
  │    │         → 상태: In progress
  │    │         → 개발 완료 시 Done 처리
  │    │
  │    └── No  → 이슈 템플릿 작성만 완료
  │              → 상태: Backlog
  │
  │
  │ ═══════════════════════════════════════
  │ [Enhancement 선택 시]
  │ ═══════════════════════════════════════
  │
  ├→ GitHub Issue 생성
  │
  ├→ 현재 생성된 Feature 목록 로드·표시
  │    • 반드시 1개의 Feature를 선택해야 함 (복수 선택 불가)
  │    • "unassigned" 선택지도 제공
  │
  ├→ 선택 완료 시 자동 배정
  │    • 라벨: 선택한 Feature명
  │    • 마일스톤: 해당 Feature의 상위 Milestone
  │    (unassigned 선택 시 라벨·마일스톤 미배정)
  │
  ├→ "지금 작업 시작할까요?" 분기
  │    │
  │    ├── Yes → 이슈 템플릿에 따라 내용 작성
  │    │         → 상태: In progress
  │    │         → 개발 완료 시 Done 처리
  │    │
  │    └── No  → 이슈 템플릿 작성만 완료
  │              → 상태: Backlog
  │
  └→ ✅ 프로세스 완료
```

**Bug vs Enhancement 차이 요약**:

| 항목             | Bug                              | Enhancement                     |
| ---------------- | -------------------------------- | ------------------------------- |
| **정의**         | 프로덕션/완료된 기능의 오류 수정 | 소규모 기능 추가·스펙 변경      |
| **라벨**         | "Bug" (고정)                     | 사용자가 선택한 Feature명       |
| **마일스톤**     | 없음 (계층 밖 독립 관리)         | Feature의 상위 Milestone        |
| **Feature 선택** | 불필요                           | 필수 (1개만, unassigned 가능)   |
| **계층 소속**    | Milestone/Feature 계층 밖        | Milestone→Feature→Issue 계층 내 |
| **이슈 템플릿**  | Bug Report 템플릿                | Feature Request 템플릿          |

---

## 4. GitHub Issue 라벨 규칙

모든 GitHub Issue는 **반드시 라벨을 1개** 가져야 하며, 다음 두 종류 중 하나다:

```
GitHub Issue 라벨 규칙
  │
  ├── "Bug" 라벨
  │    • 프로덕션/완료 기능의 오류 수정 대상
  │    • 마일스톤: 부여하지 않음
  │    • Feature 계층과 무관 (독립 관리)
  │    • Feature 상태 자동 전파에 영향 없음
  │
  └── "Feature명" 라벨 (예: 로그인/회원가입, 홈화면 등)
       • Milestone→Feature→Issue 계층 내 소속
       • 마일스톤: Feature의 상위 Milestone 자동 부여
       • Feature 상태 자동 전파에 영향 (backlog/ongoing/done)
```

**핵심**: Bug 라벨과 Feature 라벨은 **동일한 위계**에서 상호 배타적이다. 하나의 이슈가 동시에 두 종류의 라벨을 가질 수 없다.

---

## 5. GitHub Issue 생성 경로 비교 (자동 vs 수동)

Feature 워크플로우와 Issue 워크플로우 모두 GitHub Issue를 생성하지만, 경로와 성격이 다르다.

| 구분          | Feature → Issue (자동)                    | Issue 워크플로우 (수동)                           |
| ------------- | ----------------------------------------- | ------------------------------------------------- |
| **트리거**    | PRD 완성 후 자동 분해                     | 사용자가 /pm → New Task → Issue                   |
| **생성 단위** | PRD 기반 다수 Issue + Sub-Issue 일괄 생성 | 1개 Issue 단건 생성                               |
| **라벨**      | Feature명 자동 부여                       | Bug: "Bug" 고정 / Enhancement: Feature명 선택     |
| **마일스톤**  | Feature의 상위 Milestone 자동             | Bug: 없음 / Enhancement: Feature의 상위 Milestone |
| **주요 용도** | 대규모 기능 개발 (기획→분해)              | 버그 수정, 소규모 스펙 변경                       |
| **초기 상태** | Backlog 상태로 생성                       | 즉시 시작 또는 Backlog 선택 가능                  |

---

## 6. 작업 계층 구조 — 전체 그림

```
┌──────────────────────────────────────────────────────────────┐
│                        /pm 커맨드                             │
│                                                               │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────────┐     │
│  │ New Task │   │Edit Task │   │ Context Making       │     │
│  └────┬─────┘   └──────────┘   │ (CIS 워크플로우 5종) │     │
│       │                        └──────────┬───────────┘     │
│       │                                   │                  │
│  ┌────┴────────────────────┐              │                  │
│  │         │               │              │                  │
│  ▼         ▼               ▼              │                  │
│ M/S     Feature          Issue            │                  │
│  │        │                │              │                  │
│  │   ┌────┴────┐          │              │                  │
│  │   │Context? │◄─────────┼──────────────┘                  │
│  │   │Yes→CIS  │          │                                  │
│  │   │No→Skip  │          │                                  │
│  │   └────┬────┘          │                                  │
│  │        ▼               │                                  │
│  │   PRD 작성/완성        │                                  │
│  │        │               │                                  │
│  │        ▼               │                                  │
│  │   Feature_PRD/저장     │                                  │
│  │        │               │                                  │
│  │        ▼               │                                  │
│  │   GitHub Issue   ┌─────┴──────┐                           │
│  │   자동 분해      │Bug/Enhance │                           │
│  │   (Feature 라벨) │수동 생성    │                           │
│  │                  └────────────┘                           │
│  └──────────────────┬────────────┘                           │
│                     ▼                                         │
│              GitHub Project #4                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. 데이터 저장 구조 (PM-DOCS 폴더)

```
PM-DOCS/
├── Context_Output/                     ← CIS 산출물 저장
│   ├── brainstorming_{날짜}_{주제}.md
│   ├── design-thinking_{날짜}_{주제}.md
│   ├── problem-solving_{날짜}_{주제}.md
│   ├── innovation-strategy_{날짜}_{주제}.md
│   ├── storytelling_{날짜}_{주제}.md
│   └── Archive/                        ← 30일 경과 시 자동 이동 (PRD 참조 제외)
│
├── Planning/                           ★ SINGLE SOURCE OF TRUTH
│   ├── Roadmap/                        ← 마일스톤 단위 파일
│   │   └── milestone-XXX.md
│   │
│   ├── Feature_PRD/                    ← 피쳐별 하위 폴더
│   │   └── feature#{N}_{name}/
│   │       ├── PRD.md
│   │       ├── screens.yml
│   │       ├── events.yml
│   │       └── changelog.md
│   │
│   ├── IA/                             ← 전역 화면 카탈로그 (자동 집계)
│   │   ├── screen-index.yml
│   │   └── IA-table.md
│   │
│   ├── events-index.yml                ← 전체 이벤트 통합본 (자동 집계)
│   └── changelog.md                    ← Planning 폴더 변경 이력
│
└── Workflow/                           ← 사용자 참고 문서 (수동 관리)
```

---

## 8. 상태 전파 규칙 종합

```
방향: 아래 → 위 (자동 집계)

┌──────────────┐
│  Milestone   │  상태: backlog → ongoing → done
│  (수동 변경)  │  PM이 직접 판단하여 변경. 자동 전파 없음.
└──────┬───────┘
       │ 1:N
┌──────┴───────┐
│   Feature    │  상태: 자동 전파
│  (자동 변경)  │  - Issue 0개 배정 → backlog
│              │  - Issue 1개+ 진행중 → ongoing
│              │  - Issue 전부 done → done
└──────┬───────┘
       │ 1:N
┌──────┴───────┐
│ GitHub Issue │  상태: 개발자 수동
│  (수동 변경)  │  Backlog → In progress → In review → Done
│              │  ※ Feature 라벨 이슈만 상위 전파에 영향
└──────┬───────┘
       │ 1:N (optional)
┌──────┴───────┐
│  Sub-Issue   │  상태: 개발자 수동
└──────────────┘


별도 트랙:
┌──────────────┐
│  Bug Issue   │  Milestone/Feature 계층 밖 독립 관리
│  (수동 변경)  │  Backlog → In progress → In review → Done
│              │  Feature 상태 전파에 영향 없음
└──────────────┘
```

---

## 9. 기존 시스템과의 충돌 분석

### 9-1. 안전 영역 (충돌 없음)

| 영역                              | 이유                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `PM-DOCS/` 폴더 전체              | 신규 경로. 기존 어떤 hook/agent/workflow도 참조하지 않음 |
| 새 Agent 정의 (pm-planner.md)     | skill-forced.sh가 자동 스캔하여 평가 대상에 포함         |
| 새 Skill 정의 (planning/SKILL.md) | skill-forced.sh가 자동 스캔하여 표시                     |
| gh CLI 읽기 전용 쿼리             | 부작용 없음                                              |

### 9-2. 주의 영역 (관리 필요)

| 충돌 지점                  | 상세                                                                     | 완화 방안                                               |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| **GitHub Issue 자동 생성** | 기존 project-task-manager agent가 수동 CRUD 담당. 자동 생성 시 중복 가능 | title 기반 중복 검사 로직 필수                          |
| **라벨 관리**              | 기존 labeler.yml이 브랜치명 기반 라벨 할당. Feature명 라벨과 충돌 가능   | Feature 라벨은 별도 네임스페이스 (예: `feature:로그인`) |
| **GitHub Project 필드**    | Status/Priority가 하드코딩된 Option ID로 관리됨                          | 필드 ID를 중앙 설정 파일로 분리                         |
| **UserPromptSubmit hook**  | 이미 2개 hook 존재. 3번째 추가 시 프롬프트 비대화                        | 조건부 실행 (/pm 키워드 감지 시만 출력)                 |

### 9-3. 기존 시스템 연동 포인트

| 기존 컴포넌트              | 새 워크플로우와의 관계                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| project-task-manager agent | Issue 생성 시 GitHub Project #4에 항목 추가 시 활용                         |
| git-manager agent          | Feature 완료 후 PR 생성 시 활용                                             |
| context-gen.yml (CI)       | PR 머지 시 .claude/context/ 자동 업데이트 — PM-DOCS와 경로 분리로 충돌 없음 |
| claude-code-review.yml     | PR 자동 코드 리뷰 — 변경 없이 그대로 활용                                   |

---

## 10. 핵심 제약 조건 (불변 규칙)

1. **Feature는 반드시 Milestone에 소속**되어야 한다. Milestone이 없는 Feature는 생성 불가.
2. **GitHub Issue는 반드시 라벨을 가져야 한다** — "Bug" 라벨 또는 "Feature명" 라벨 중 하나. 두 종류를 동시에 가질 수 없다.
3. **Feature 라벨을 가진 Issue만 마일스톤 속성을 부여**받는다. Bug 라벨 이슈에는 마일스톤을 부여하지 않는다.
4. **Bug는 Milestone/Feature 계층 밖에서 독립 관리**된다. 프로덕션 서비스나 이미 완료된 기능의 오류 수정을 대상으로 한다.
5. **Milestone 상태는 자동 전파하지 않는다.** PM의 의도적 수동 관리 영역이다.
6. **Feature 상태는 하위 Issue(Feature 라벨) 상태에 의해 자동 결정**되며, 수동 오버라이드는 허용하지 않는다.
7. **Enhancement Issue는 반드시 1개 Feature에만 소속** (복수 선택 불가, unassigned 가능).
8. **Context Output의 Archive 폴더 파일은 PRD 컨텍스트로 참조되지 않는다.**
9. **IA, events-index는 Feature PRD 기반 자동 집계**이므로 직접 수정하지 않는다.

---

## 11. 미정의 항목 (TODO)

| 항목                               | 현재 상태 | 필요 작업                                                  |
| ---------------------------------- | --------- | ---------------------------------------------------------- |
| PRD 템플릿                         | 미정의    | 템플릿 설계 필요 (목표, 유저스토리, 수용기준, 기술요건 등) |
| screens.yml 양식                   | 미정의    | 화면 ID, 라우트, 진입조건 스키마 설계 필요                 |
| changelog.md 양식                  | 미정의    | 변경 이력 기록 포맷 설계 필요                              |
| events.yml 양식                    | 부분 정의 | Mixpanel 이벤트 트래킹 스키마 확정 필요                    |
| Edit Task 워크플로우               | 미정의    | Milestone/Feature/Issue 수정 흐름 설계 필요                |
| 30일 아카이빙 자동화               | 미구현    | GitHub Actions 또는 hook으로 구현 필요                     |
| IA 자동 집계 로직                  | 미구현    | screens.yml → screen-index.yml 집계 스크립트 필요          |
| events-index 자동 집계             | 미구현    | events.yml → events-index.yml 집계 스크립트 필요           |
| Feature에 Milestone 필수 소속 검증 | 미구현    | Feature 생성 시 Milestone 유효성 검사 로직 필요            |

---

## 12. 워크플로우 전체 흐름 요약 다이어그램

```
                          ┌─────────────┐
                          │  /pm 커맨드  │
                          └──────┬──────┘
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                  ▼
        ┌──────────┐      ┌──────────┐      ┌──────────────┐
        │ New Task │      │Edit Task │      │Context Making│
        └────┬─────┘      └──────────┘      └──────┬───────┘
             │                                      │
      ┌──────┼──────────┐                          │
      ▼      ▼          ▼                          │
  ┌───────┐┌────────┐┌───────┐                    │
  │  M/S  ││Feature ││ Issue │                    │
  └───┬───┘└───┬────┘└───┬───┘                    │
      │        │         │                         │
      │   ┌────┴────┐    │                         │
      │   │Context? │◄───┼─────────────────────────┘
      │   │Yes→CIS  │    │      (5종 CIS 워크플로우)
      │   │No→Skip  │    │
      │   └────┬────┘    │
      │        ▼         │
      │   ┌─────────┐    │
      │   │PRD 작성 │    │
      │   └────┬────┘    │
      │        ▼         │
      │   Feature_PRD/   │
      │   저장 ──────────────────→ PM-DOCS/Planning/ (SSOT)
      │        │         │
      │        ▼         ▼
      │   ┌──────────────────┐
      └──→│  GitHub Issue     │ ──→ GitHub Project #4
           │  자동/수동 생성  │
           │                  │
           │  ┌─────────────┐ │
           │  │Feature 라벨 │─┼──→ M/S→Feature→Issue 계층 내
           │  │ + 마일스톤  │ │     (Feature 상태 전파에 영향)
           │  └─────────────┘ │
           │  ┌─────────────┐ │
           │  │ Bug 라벨    │─┼──→ 계층 밖 독립 관리
           │  │ 마일스톤 X  │ │     (상태 전파 무관)
           │  └─────────────┘ │
           └──────────────────┘
```
