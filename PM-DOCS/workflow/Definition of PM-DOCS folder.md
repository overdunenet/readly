# PM-DOCS 폴더 정의서

> **작성일**: 2026-02-17  
> **대상 레포지토리**: Readly  
> **목적**: PM 전용 문서 폴더(PM-DOCS)의 구조, 역할, 데이터 흐름을 정의하여 새 워크플로우 설계 시 기준 문서로 활용

---

## TL;DR

PM-DOCS는 Readly 레포지토리의 **PM 전용 기획 문서 루트 폴더**다. 3개 하위 폴더(Context Output · Planning · Workflow)로 구성되며, **Planning 폴더가 이 프로젝트의 Single Source of Truth(SSOT)** 역할을 한다. CIS 에이전트가 생성한 컨텍스트 산출물 → PRD → GitHub Issue로 이어지는 기획-개발 파이프라인의 모든 문서가 이 폴더 안에서 관리된다.

---

## 1. 전체 폴더 구조 한눈에 보기

```
PM-DOCS/
├── Context_Output/                    ← CIS 에이전트 실행 결과물
│   ├── brainstorming_{날짜}_{주제}.md
│   ├── design-thinking_{날짜}_{주제}.md
│   ├── problem-solving_{날짜}_{주제}.md
│   ├── innovation-strategy_{날짜}_{주제}.md
│   ├── storytelling_{날짜}_{주제}.md
│   └── Archive/                       ← 30일 경과 시 자동 이동
│       └── ...
│
├── Planning/                          ★ SINGLE SOURCE OF TRUTH
│   ├── Roadmap/                       ← 마일스톤 단위 파일
│   │   ├── milestone-001.md
│   │   ├── milestone-002.md
│   │   └── ...
│   │
│   ├── Feature_PRD/                   ← 피쳐 단위 하위 폴더
│   │   ├── {feature-name}/
│   │   │   ├── PRD.md                 ← 해당 피쳐의 요구사항 문서
│   │   │   ├── screens.yml            ← 화면 ID·라우트·진입조건 정의
│   │   │   ├── events.yml             ← 이벤트 트래킹 정의 (Mixpanel)
│   │   │   └── changelog.md           ← 위 파일들의 변경 이력
│   │   └── ...
│   │
│   ├── IA/                            ← 전역 화면 카탈로그 (자동 집계)
│   │   ├── screen-index.yml           ← 전체 screens.yml 통합본
│   │   └── IA-table.md                ← screen-index를 IA 기준 표로 렌더링
│   │
│   ├── events-index.yml               ← 전체 events.yml 통합본 (Mixpanel 전체 이벤트)
│   └── changelog.md                   ← Planning 폴더 전체 변경 이력
│
└── Workflow/                          ← 워크플로우 빌딩용 컨텍스트 자료
    └── (사용자가 직접 생성한 참고 문서들)
```

---

## 2. Context Output 폴더

### 2-1. 역할

CIS(Context-Ideation-Solution) 모듈의 **B-MAD 에이전트들이 워크플로우를 실행한 뒤 완성된 결과물을 저장**하는 공간이다. PRD 작성 전 단계에서 아이디어를 발산하거나, 문제를 분석하거나, 솔루션을 설계한 산출물이 여기에 쌓인다.

### 2-2. 사용자 플로우

```
/pm 커맨드 진입
  └→ "Context Making" 선택
       └→ 5개 CIS 워크플로우 중 택 1 실행
            ├── Brainstorming         (아이디어 발산)
            ├── Design Thinking       (솔루션 설계·검증)
            ├── Problem Solving       (근본 원인 분석)
            ├── Innovation Strategy   (혁신 전략 수립)
            └── Storytelling          (내러티브 구축)
       └→ 워크플로우 완료 시 결과물을 이 폴더에 .md로 저장
```

### 2-3. CIS 워크플로우 선택 로직 (매핑 규칙)

어떤 상황(Situation)에서 어떤 CIS 워크플로우를 선택하는지는 다음 규칙을 따른다.

| 상황 코드 | 상황 설명                      | 조건                                 | 선택 워크플로우                     |
| --------- | ------------------------------ | ------------------------------------ | ----------------------------------- |
| S1        | 신규 기능 기획 (아이디어 단계) | 아이디어 1개, 구체적                 | Design Thinking                     |
| S1        |                                | 아이디어 모호/여러 방향              | Brainstorming                       |
| S1        |                                | 기존 Brainstorming 산출물 있음       | CIS 스킵 → 바로 PRD                 |
| S2        | 데이터 기반 개선 (문제 발견)   | 원인 명확                            | CIS 스킵 → 바로 PRD                 |
| S2        |                                | 원인 불명확                          | Problem Solving                     |
| S2        |                                | 원인은 알지만 솔루션 모호            | Design Thinking                     |
| S3        | 전략적 이니셔티브              | 전략 문서/로드맵 존재                | CIS 스킵 또는 Storytelling          |
| S3        |                                | 방향만 결정, 구체안 없음             | Innovation Strategy → Brainstorming |
| S3        |                                | 기존 Innovation Strategy 산출물 있음 | Brainstorming만                     |
| S4        | 사용자 요청/VOC                | 피드백이 구체적 (기능 명시)          | Design Thinking                     |
| S4        |                                | 피드백이 모호 (불만만 표현)          | Problem Solving → Design Thinking   |
| S4        |                                | 피드백 양이 많고 다양                | Brainstorming → Design Thinking     |
| S5        | 기술 부채/리팩토링             | 기술적 문제만                        | CIS 스킵 → 바로 PRD (기술 중심)     |
| S5        |                                | 기술 변경이 UX 영향                  | Design Thinking                     |

### 2-4. 저장 및 아카이빙 규칙

| 규칙                  | 설명                                                             |
| --------------------- | ---------------------------------------------------------------- |
| **파일 형식**         | `.md` (마크다운)                                                 |
| **생성 순서**         | 에이전트 실행 완료 순서대로 생성                                 |
| **아카이빙 조건**     | 마지막 생성일로부터 **30일 경과** 시 `Archive/` 폴더로 자동 이동 |
| **Archive 폴더 특성** | PRD 작성 시 컨텍스트 문서로 **참조되지 않음** (사실상 냉동 보관) |
| **참조 대상**         | Archive 밖의 파일만 PRD 작성 시 컨텍스트로 활용                  |

---

## 3. Planning 폴더 ★ SSOT

### 3-1. 역할

이 레포지토리의 **Single Source of Truth**. 제품의 로드맵, 피쳐별 PRD, 화면 구조(IA), 이벤트 트래킹 정의가 모두 이 폴더에 집중된다. 모든 이해관계자(PM, 개발자, 디자이너)가 이 폴더의 문서를 기준으로 동일한 목표를 공유한다.

### 3-2. 하위 구성요소 요약

| 구성요소             | 경로                           | 성격                           | 생성 주체                       |
| -------------------- | ------------------------------ | ------------------------------ | ------------------------------- |
| **Roadmap**          | `Planning/Roadmap/`            | 마일스톤 단위 전략 문서        | `/pm` 커맨드 (마일스톤 생성 시) |
| **Feature PRD**      | `Planning/Feature_PRD/{name}/` | 피쳐별 요구사항 상세 문서      | `/pm` 커맨드 (피쳐 생성 시)     |
| **IA**               | `Planning/IA/`                 | 전역 화면 카탈로그 (자동 집계) | Feature PRD 기반 자동 생성      |
| **events-index.yml** | `Planning/events-index.yml`    | 전체 이벤트 통합본             | Feature PRD 기반 자동 집계      |
| **changelog.md**     | `Planning/changelog.md`        | Planning 폴더 변경 이력        | 자동 기록                       |

---

### 3-3. Roadmap 폴더 상세

**정의**: 제품의 장기적인 비전과 목표를 달성하기 위해 '무엇을, 언제' 할 것인지 보여주는 **전략적 기획 문서**.

**생성 트리거**: 사용자가 `/pm` 커맨드를 통해 마일스톤을 1개 생성할 때마다 이 폴더에 파일 1개가 추가된다.

**마일스톤 파일 구조**:

```yaml
# milestone-001.md 예시 구조

## 메타데이터
- 마일스톤 번호: M-001
- 마일스톤 목표: "MVP 출시"
- 마일스톤 기간: 2026-01-01 ~ 2026-03-31
- 생성일: 2026-01-15
- 마지막 수정일: 2026-02-10   # Feature 추가 기준

## 연결된 Feature 목록
| Feature명 | 상태 | 하위 Issue |
|-----------|------|-----------|
| 로그인/회원가입 | ongoing | #12, #13, #14 |
| 홈화면 | backlog | — |
| 에디터 기능 | done | #8, #9, #10, #11 |
```

**핵심 규칙**:

- 마일스톤 상태(backlog/ongoing/done)는 **PM이 수동으로만 변경** (의도적 수동 유지)
- 하위 Feature 상태와 무관하게 PM의 주관적 판단에 의해서만 상태 전환

---

### 3-4. Feature_PRD 폴더 상세

**정의**: 특정 기능(Feature)을 개발하기 위해 필요한 **모든 요구사항을 상세하게 기록한 문서 폴더**. 개발자, 디자이너 등 모든 이해관계자가 동일한 목표를 이해하고 작업할 수 있도록 돕는 가장 중요한 소통 도구.

**생성 트리거**: 사용자가 `/pm` 커맨드를 통해 피쳐를 1개 생성할 때마다 하위 폴더가 1개 생성된다.

**피쳐 폴더 내부 파일 4종**:

| 파일             | 역할                      | 핵심 내용                                                                                                                         |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **PRD.md**       | 해당 피쳐의 요구사항 문서 | 미리 정의된 템플릿에 따라 작성. 목표, 유저스토리, 수용기준, 기술요건 등                                                           |
| **screens.yml**  | 화면 정의서               | 화면의 공식 이름/ID, 코드 라우트(또는 딥링크) 연결, 소속 에픽(PRD), 주요 진입/상태 기록 → IA·유저플로우·화면목록 자동 생성의 원천 |
| **events.yml**   | 이벤트 트래킹 정의서      | 이벤트가 정확히 언제/왜 발화하는지(의미/트리거), 필수 프로퍼티, PII 여부, 연결 KPI/퍼널 → 분석·대시보드·실험 운영의 "정답지"      |
| **changelog.md** | 변경 이력                 | 위 3개 파일 변경 시 히스토리 기록                                                                                                 |

**Feature 상태 자동 전파 규칙**:

```
하위 GitHub Issue 전부 미배정     → Feature 상태 = backlog
하위 GitHub Issue 1개라도 진행중   → Feature 상태 = ongoing
하위 GitHub Issue 전부 done       → Feature 상태 = done
```

**Feature 생성 시 부수 효과**:

- GitHub Issue 라벨로 동일한 Feature명이 자동 생성됨

---

### 3-5. IA 폴더 상세

**정의**: 서비스 **전역 화면 카탈로그**를 관리하는 폴더. 수동 작성이 아니라 PRD 기반 또는 코드베이스 기반으로 **자동 업데이트**되는 항목들만 존재한다.

| 파일                 | 역할                                              | 데이터 소스                                        |
| -------------------- | ------------------------------------------------- | -------------------------------------------------- |
| **screen-index.yml** | 서비스 전체 화면 카탈로그                         | 각 Feature_PRD 내 `screens.yml`이 모두 여기로 통합 |
| **IA-table.md**      | screen-index를 IA 기준으로 그룹핑하여 표로 렌더링 | `screen-index.yml` 기반 자동 생성                  |

**데이터 흐름**:

```
Feature_PRD/{name}/screens.yml  ──(자동 집계)──→  IA/screen-index.yml
                                                       │
                                                       └──(그룹핑+렌더링)──→  IA/IA-table.md
```

---

### 3-6. events-index.yml 상세

**정의**: Mixpanel 기준으로 찍히는 **전체 이벤트 통합본**. 각 Feature_PRD 내 `events.yml`이 모두 이 파일로 집계된다.

**데이터 흐름**:

```
Feature_PRD/{name}/events.yml  ──(자동 집계)──→  Planning/events-index.yml
```

---

## 4. Workflow 폴더

### 4-1. 역할

**사용자가 직접 생성한 참고 문서**만 보관하는 폴더. 에이전트·스킬·훅·커맨드 등을 새로 만들거나 작업 워크플로우를 빌딩할 때 필요한 컨텍스트 자료를 아카이빙하는 곳이다.

### 4-2. 주요 용도

- 새 워크플로우 추가 시 컨텍스트 문서로 활용
- 기존 코드나 에이전트 시스템과의 **충돌 여부 점검** 용도
- 작업 자동화 및 효율화를 위한 설계 참고 자료

### 4-3. 특성

| 항목                 | 설명                  |
| -------------------- | --------------------- |
| 생성 주체            | 사용자 수동           |
| 자동 생성 여부       | 없음                  |
| 다른 시스템과의 연동 | 없음 (순수 참고 자료) |

---

## 5. 계층 구조와 데이터 흐름 종합

### 5-1. 작업 계층: Milestone → Feature → GitHub Issue

```
Milestone (PM-DOCS/Planning/Roadmap/)
 │  상태: 수동 변경 (PM 판단)
 │
 └─── Feature (PM-DOCS/Planning/Feature_PRD/{name}/)
       │  상태: 자동 전파 (하위 Issue 기준)
       │  생성 시 → GitHub 라벨 자동 생성
       │
       └─── GitHub Issue (GitHub)
             │  상태: 개발자 수동
             │  자동 배정: 라벨=Feature명, 마일스톤=상위 Milestone
             │
             └─── Sub-Issue (GitHub)
                   상태: 개발자 수동
```

### 5-2. 데이터 흐름 전체 그림

```
[CIS 에이전트 실행]
       │
       ▼
Context_Output/*.md ─── (30일 경과) ──→ Archive/ (참조 제외)
       │
       │ (PRD 작성 시 컨텍스트로 참조)
       ▼
Feature_PRD/{name}/
  ├── PRD.md
  ├── screens.yml ───────(자동 집계)───→ IA/screen-index.yml → IA/IA-table.md
  ├── events.yml ────────(자동 집계)───→ Planning/events-index.yml
  └── changelog.md

Feature 생성 시 ─────────(자동)────────→ GitHub 라벨 생성
PRD 분해 시 ─────────────(자동)────────→ GitHub Issue + Sub-Issue 생성
                                          ├── 라벨 = Feature명
                                          └── 마일스톤 = 상위 Milestone

Issue 상태 변경 ─────────(자동 전파)───→ Feature 상태 재계산
Milestone 상태 ──────────(수동만)──────→ PM 직접 변경
```

---

## 7. 핵심 제약 조건 요약

1. **Feature는 반드시 Milestone에 소속**되어야 한다. Milestone이 없는 Feature는 생성 불가.
2. **GitHub Issue는 반드시 Feature(라벨) + Milestone을 가져야** 한다. 둘 중 하나라도 없으면 유효하지 않은 이슈.
3. **Milestone 상태는 자동 전파하지 않는다.** PM의 의도적 수동 관리 영역.
4. **Feature 상태는 하위 Issue 상태에 의해 자동 결정**되며, 수동 오버라이드는 불허.
5. **Context Output의 Archive 폴더 파일은 PRD 컨텍스트로 참조되지 않는다.**
6. **IA, events-index는 Feature PRD 기반 자동 집계**이므로 직접 수정하지 않는다.
