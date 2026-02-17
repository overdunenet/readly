# PM 워크플로우 통합 구현 계획서

> **작성일**: 2026-02-18
> **버전**: v1.0
> **상태**: 확정 (미결 질문 12개에 대해 합리적 기본값 적용)
> **기반 문서**: `workflow-analyze-master#1.md` 7-STEP 분석 결과

---

## 0. 미결 질문 결정 사항

이전 분석에서 도출된 8개 미결 질문에 대한 결정:

| #   | 질문                           | 결정                                      | 근거                                                            |
| --- | ------------------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| Q1  | Feature 라벨 네임스페이스      | `feature:{name}`                          | labeler.yml의 브랜치 라벨과 완전 분리                           |
| Q2  | screens.yml 스키마             | 제안 스키마 채택 (아래 Phase 1 참조)      | IA 자동 집계에 필요한 최소 필드                                 |
| Q3  | events.yml 스키마              | Mixpanel 기반 스키마 채택                 | PII, KPI, funnel 필드 포함                                      |
| Q4  | Milestone 파일 형식            | YAML frontmatter + MD body                | 기존 문서 예시와 일치                                           |
| Q5  | changelog.md 형식              | Keep a Changelog 포맷                     | 업계 표준, 자동 파싱 용이                                       |
| Q6  | BMAD 참조 대상                 | 7개 워크플로우 확정                       | PM Agent, PRD Create/Validate/Edit, Create Epics, Architect, PO |
| Q7  | PRD 편집→Issue 동기화          | changelog+수동 (v1)                       | 안전 우선, v2에서 자동 diff 제안                                |
| Q8  | 삭제 정책                      | archive-only (소프트 삭제)                | 데이터 보존, 복구 가능성                                        |
| Q9  | Changelog 단일화               | master `Planning/changelog.md` 1개만 유지 | Feature_PRD 내 changelog 불필요, 파일 단위 전역 추적으로 충분   |
| Q10 | 기존 에이전트 BMAD 업그레이드  | 불필요 — pm-planner가 내부 흡수           | 기존 에이전트는 코드 개발용, BMAD는 PM용으로 역할 차이 근본적   |
| Q11 | project-task-manager 역할 경계 | 역할 경계 섹션만 추가                     | Feature Issue 일괄 생성은 /pm 전담, 기존 CRUD 기능 유지         |
| Q12 | workflow-enforced /pm 예외     | /pm 실행 시 4-Phase 강제 스킵             | /pm은 기획 워크플로우로 코드 작업이 아님                        |

---

## STEP 2: 분석 결과 요약

### A. 기존 시스템 현황

**PM 워크플로우와 직접 연동하는 기존 에이전트:**

| 에이전트               | 연동 방식                     | 현재 동작                                      |
| ---------------------- | ----------------------------- | ---------------------------------------------- |
| `project-task-manager` | Issue→Project #4 등록 시 활용 | gh CLI로 태스크 CRUD, Status/Priority 하드코딩 |
| `git-manager`          | Feature 브랜치 생성 시 활용   | 커밋/PR/브랜치 관리                            |
| `task-planner`         | PRD→Issue 분해 시 참조        | TaskList 기반 계획 수립                        |
| `director`             | PRD 일관성 검증 시 참조       | 스펙 정합성 검증                               |

**GitHub Project #4 필드 변경 필요 사항:**

- 현재 Status(5개)/Priority(3개) 필드로 충분
- 추가 필드 불필요 — Feature/Milestone 관리는 PM-DOCS 파일 기반
- Option ID 하드코딩 → 중앙 설정 파일(pm-config.yml)로 이전 필요

**라벨 충돌 분석:**

- `labeler.yml`: 브랜치 기반 → `✨ Feature`, `🐞 BugFix` 등 (이모지 접두사)
- `/pm` Feature 라벨: `feature:{name}` 접두사 사용 → **충돌 없음**
- Bug 라벨: `/pm`에서는 `bug` 고정 → `🐞 BugFix`와 네임스페이스 분리됨

### B. 충돌 지점 완화 방안

| 리스크                         | 등급   | 완화 방안                                                                                        |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| 태스크 자동/수동 충돌          | HIGH   | Issue 생성 전 title 기반 중복 검사 (gh issue list --search)                                      |
| 라벨 충돌                      | HIGH   | `feature:{name}` 네임스페이스 분리                                                               |
| Context 동시 쓰기              | MEDIUM | PM-DOCS/와 .claude/context/ 경로 완전 분리 ✅ 검증 완료                                          |
| Project 필드 동기화            | MEDIUM | pm-config.yml 중앙 설정으로 ID 관리                                                              |
| Hook stdout 비대화             | MEDIUM | /pm을 Skill로 등록 → hook 추가 불필요                                                            |
| workflow-enforced /pm 간섭     | HIGH   | workflow-enforced.sh에 /pm 예외 조건 추가 — 기획 작업에 코드 4-Phase 강제 부적절                 |
| project-task-manager 역할 경합 | MEDIUM | agent.md에 역할 경계 섹션 추가 — Feature Issue 일괄 생성은 /pm 전담                              |
| 기존 에이전트 BMAD 중복        | LOW    | 업그레이드 불필요 결정 — pm-planner가 BMAD 품질을 내부 통합, 기존 에이전트는 코드 개발 전용 유지 |

### C. BMAD-METHOD 통합 분석

**선별된 PRD 관련 컴포넌트:**

| 컴포넌트명          | 타입                | 핵심 기능               | 활용 방안                        | 경로 매핑                                                     |
| ------------------- | ------------------- | ----------------------- | -------------------------------- | ------------------------------------------------------------- |
| PM Agent            | Agent               | PRD 생성/검증/수정 메뉴 | pm-planner.md 에이전트 설계 참조 | N/A                                                           |
| PRD Create          | Workflow (12 steps) | 단계별 PRD 빌딩         | Phase A-E 대화형 플로우 참조     | `{planning_artifacts}/prd/` → `PM-DOCS/Planning/Feature_PRD/` |
| PRD Validate        | Workflow (13 steps) | PRD 일관성 검증         | Phase E1 검증 로직 참조          | 동일                                                          |
| PRD Edit            | Workflow (5 steps)  | PRD 수정 + changelog    | Edit Task 워크플로우 참조        | 동일                                                          |
| Create Epics        | Workflow            | PRD→작업 분해           | Phase 5-1 Issue 분해 참조        | N/A → GitHub Issue                                            |
| Architect Agent     | Agent               | 기술 요건 검토 보조     | Phase D1 기술 요건 자동 제안     | N/A                                                           |
| Product Owner Agent | Agent               | 비즈니스 가치 검증      | Phase E1 검증 보조               | N/A                                                           |

**적용 가능/불가능 패턴:**

| BMAD 패턴             | 적용 여부 | Claude Code 대체 방식                     |
| --------------------- | --------- | ----------------------------------------- |
| Step-file 순차 실행   | ✅ 차용   | .claude/skills/ 서브파일로 재구현         |
| A/P/C 메뉴            | ✅ 차용   | AskUserQuestion의 options로 대체          |
| Append-only 문서 빌딩 | ✅ 차용   | Phase A-E에서 PRD 섹션 순차 채움          |
| Facilitator 대화 패턴 | ✅ 차용   | PM Agent의 대화형 플로우                  |
| SMART 기준            | ✅ 반영   | PRD 템플릿 목표/성공 지표에 적용          |
| module.yaml 변수 치환 | ❌ 불가   | pm-config.yml 고정 경로 + Skill 직접 참조 |
| 플러그인 동적 로딩    | ❌ 불가   | .claude/skills/ 정적 파일 구조            |
| 에이전트 간 체이닝    | ❌ 불가   | Main Agent → Subagent 단일 레벨 위임      |

**에이전트 업그레이드 결정:**

> 기존 architect, director, task-planner, project-task-manager를 BMAD 에이전트 수준으로 업그레이드하지 않습니다.
>
> - **이유**: 기존 에이전트는 코드 개발 보조 목적, BMAD는 PM/제품 기획 목적으로 역할이 근본적으로 다름
> - **대안**: pm-planner가 BMAD의 PM 품질(인터뷰 기법, JTBD, 검증 체크리스트)을 내부에 통합
> - **기존 에이전트**: 변경 없이 코드 개발 전용으로 유지 (pm-planner가 호출 시 프롬프트로 역할 지시)

### D. 신규 컴포넌트 목록

**Agent 정의:**

1. `.claude/agents/pm-planner.md` — PM 기획 워크플로우 전담

**Skill 정의:** 2. `.claude/skills/planning/SKILL.md` — /pm 메인 Skill 3. `.claude/skills/planning/prd-template.md` — PRD 템플릿 4. `.claude/skills/planning/prd-workflow.md` — PRD 대화형 워크플로우 5. `.claude/skills/planning/cis-guide.md` — CIS 선택 가이드 6. `.claude/skills/planning/pm-config.yml` — 중앙 설정

**PM-DOCS 구조:** 7. `PM-DOCS/Context_Output/` + `Archive/` 8. `PM-DOCS/Planning/Roadmap/` 9. `PM-DOCS/Planning/Feature_PRD/` 10. `PM-DOCS/Planning/IA/` (screen-index.yml, IA-table.md) 11. `PM-DOCS/Planning/events-index.yml` 12. `PM-DOCS/Planning/changelog.md` 13. `PM-DOCS/Planning/templates/` (5개 템플릿)

**설정 변경:** 14. `.claude/settings.json` — /pm Skill 등록 (hook 추가 없음)

**기존 컴포넌트 수정:** 15. `.claude/hooks/workflow-enforced.sh` — /pm 예외 조건 추가 (코드 4-Phase 스킵) 16. `.claude/agents/project-task-manager.md` — 역할 경계 섹션 추가 (/pm과 경합 방지)

**의존성 맵:**

```
pm-planner.md (Agent)
  ├── 참조: planning/SKILL.md
  │   ├── prd-workflow.md (Phase A-E)
  │   ├── cis-guide.md (S1-S5)
  │   ├── pm-config.yml (설정)
  │   └── prd-template.md (템플릿)
  ├── 연동: project-task-manager (기존)
  ├── 연동: git-manager (기존)
  ├── 연동: director (기존, 검증 보조)
  └── 출력: PM-DOCS/ 전체
```

---

## STEP 3: PRD 템플릿 & 워크플로우 설계

### A. PRD 템플릿 (11 섹션)

```markdown
---
feature_name: '{name}'
milestone: 'M-{XXX}'
status: 'draft | review | approved | decomposed | archived'
created_at: 'YYYY-MM-DD'
updated_at: 'YYYY-MM-DD'
author: ''
label: 'feature:{name}'
progress:
  phase_a: false
  phase_b: false
  phase_c: false
  phase_d: false
  phase_e: false
  issue_decomposed: false
---

# {Feature명} PRD

## 1. 개요

- **Feature명**:
- **소속 Milestone**: M-{XXX} ({목표})
- **한 줄 요약**:

## 2. 목표 & 성공 지표

### 비즈니스 목표

- 왜 이 기능이 필요한가?

### 성공 지표 (SMART)

| 지표명 | 측정 방법 | 현재 값 | 목표 값 | 기한 |
| ------ | --------- | ------- | ------- | ---- |
|        |           |         |         |      |

## 3. 유저스토리

- **US-1**: {역할}로서, {행동}하고 싶다, {가치}를 위해
- **US-2**: ...

## 4. 유저 플로우

### 메인 플로우

1. [진입] 사용자가 ~에서 접근
2. [행동] ~를 수행
3. [결과] ~가 표시됨
4. [완료] ~로 이동

### 대안 플로우

- 조건 X인 경우: ...

## 5. 화면 정의

> 상세: `./screens.yml` 참조

| 화면 ID | 화면명 | Route | 설명 |
| ------- | ------ | ----- | ---- |
|         |        |       |      |

## 6. 이벤트 정의

> 상세: `./events.yml` 참조

| 이벤트명 | 트리거 | 화면 | KPI |
| -------- | ------ | ---- | --- |
|          |        |      |     |

## 7. 수용 기준 (Acceptance Criteria)

### AC-1 ({US-1} 관련)

- **Given**:
- **When**:
- **Then**:

### AC-2 ({US-2} 관련)

- **Given**:
- **When**:
- **Then**:

## 8. 기술 요건

### API 변경

- [ ] tRPC Router:
- [ ] Service:
- [ ] Entity:

### DB 스키마 변경

- [ ] Migration:

### 외부 의존성

- 없음

## 9. 엣지 케이스 & 에러 처리

| #   | 상황 | 처리 방법 |
| --- | ---- | --------- |
| 1   |      |           |

## 10. 우선순위 & 스코프

### MVP (이번 Feature)

-

### 후속 개선

-

## 11. 참조 문서

- CIS 산출물: (있는 경우 경로)
- 디자인:
- 기술 문서:
```

### B. PRD 대화형 워크플로우 (Phase A → E)

```
Phase A: 컨텍스트 수집 ─────────────────────────────
│
├─ A1: Milestone 선택
│   └─ 기존 Milestone 목록 표시 → 사용자 선택
│      (Milestone이 없으면 생성 유도)
│
├─ A2: CIS 산출물 참조 선택
│   └─ Context_Output/ 최신순 10개 표시
│      Archive/ 제외, 복수 선택 가능, 스킵 가능
│
▼
Phase B: 핵심 요구사항 수집 ────────────────────────
│
├─ B1: Feature명 + 한 줄 요약 입력
│   └─ 라벨명 자동 생성 미리보기: "feature:{입력명}"
│
├─ B2: 목표 & 성공 지표
│   └─ CIS 산출물 있으면 → 초안 자동 제안 → 수정/승인
│      없으면 → 직접 입력 가이드
│
├─ B3: 유저스토리
│   └─ "~로서, ~하고 싶다, ~하기 위해" 형식
│      CIS 산출물 기반 초안 제안 가능
│
├─ B4: 유저 플로우
│   └─ B3 기반 → 진입점→핵심행동→완료/이탈
│
▼
Phase C: 상세 정의 ──────────────────────────────────
│
├─ C1: 화면 정의 (→ screens.yml)
│   └─ B4 유저 플로우에서 식별된 화면
│      기존 screen-index.yml 중복 검사
│
├─ C2: 이벤트 정의 (→ events.yml)
│   └─ B4+C1에서 트래킹 필요 행동 식별
│
├─ C3: 수용 기준 (AC)
│   └─ B3 유저스토리별 Given-When-Then
│
▼
Phase D: 기술 & 엣지 케이스 ─────────────────────────
│
├─ D1: 기술 요건
│   └─ CIS+B/C 단계 정보 기반 자동 제안
│      API, DB, 외부 의존성
│
├─ D2: 엣지 케이스 + 우선순위
│   └─ MVP 스코프 vs 후속 개선 분류
│
▼
Phase E: 검증 & 저장 ───────────────────────────────
│
├─ E1: 일관성 검증
│   ├─ 유저스토리 ↔ AC 매핑 완전성
│   ├─ 화면 ↔ 유저 플로우 참조 일관성
│   ├─ 이벤트 ↔ 화면 연결 유효성
│   ├─ 화면 ID 기존 인덱스 중복 검사
│   └─ 누락 항목 체크
│
├─ E2: 산출물 저장
│   ├─ Feature_PRD/{name}/ 폴더 생성
│   ├─ PRD.md, screens.yml, events.yml 저장
│   ├─ PRD.md frontmatter progress 필드 업데이트 (phase_e: true)
│   ├─ screen-index.yml 자동 집계
│   ├─ events-index.yml 자동 집계
│   └─ Planning/changelog.md에 파일 단위 변경 기록
│
└─ ✅ "GitHub Issue로 분해할까요?" 분기
     ├─ Yes → Phase 5 Issue 자동 생성
     └─ No  → PRD만 저장 후 완료
```

---

## STEP 4: 단계별 구현 계획서

---

### Phase 0: 사전 준비 (기존 시스템 수정)

#### 0-1. GitHub Project 필드 ID 중앙 설정 분리

| 필드                 | 내용                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **작업 내용**        | project-task-manager agent와 task-management Skill에 하드코딩된 GitHub Project Option ID를 중앙 설정 파일로 추출 |
| **생성/수정 파일**   | 신규: `.claude/skills/planning/pm-config.yml`, 수정: `.claude/skills/task-management/SKILL.md`                   |
| **의존성**           | 없음 (독립 선행 작업)                                                                                            |
| **기존 시스템 영향** | `project-task-manager` agent의 ID 참조 경로 변경                                                                 |
| **리스크**           | MEDIUM — 기존 태스크 관리 동작에 영향 가능                                                                       |
| **검증 방법**        | 기존 /tasks Skill 실행 → 태스크 목록 정상 표시 확인                                                              |

```
[기존 컴포넌트 변경 상세]
- 대상 파일: .claude/skills/task-management/SKILL.md
- 변경 전 동작: Project ID, Field ID, Option ID가 Skill 파일 내 하드코딩
- 변경 후 동작: pm-config.yml 참조하도록 변경, 값 자체는 동일
- 변경 사유: PM 워크플로우와 태스크 관리가 동일 Project를 사용하므로 ID 단일 소스 필요
- 영향 범위: project-task-manager agent, task-loader.sh hook
- 롤백 방안: pm-config.yml 삭제 후 Skill 파일의 하드코딩 원복
```

#### 0-2. /pm Skill 등록 준비

| 필드                 | 내용                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| **작업 내용**        | /pm 커맨드를 Skill로 등록할 수 있도록 settings.json의 구조 확인. Hook 추가 불필요 확인 |
| **생성/수정 파일**   | 확인만 (Phase 3에서 실제 등록)                                                         |
| **의존성**           | 없음                                                                                   |
| **기존 시스템 영향** | 없음                                                                                   |
| **리스크**           | LOW                                                                                    |
| **검증 방법**        | `skill-forced.sh`가 새 Skill 디렉토리를 자동 스캔하는지 확인                           |

#### 0-3. workflow-enforced.sh /pm 예외 추가

| 필드                 | 내용                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| **작업 내용**        | /pm 워크플로우 실행 시 코드 작업용 4-Phase 강제를 스킵하도록 예외 조건 추가  |
| **수정 파일**        | `.claude/hooks/workflow-enforced.sh`                                         |
| **의존성**           | 없음 (독립 선행 작업)                                                        |
| **기존 시스템 영향** | /pm 외 모든 코드 작업에는 기존 4-Phase 유지                                  |
| **리스크**           | LOW — 예외 조건 추가만, 기존 로직 변경 없음                                  |
| **검증 방법**        | `/pm` 실행 시 4-Phase 프로토콜 미출력 확인, 일반 코드 작업 시 정상 출력 확인 |

```
[기존 컴포넌트 변경 상세]
- 대상 파일: .claude/hooks/workflow-enforced.sh
- 변경 전 동작: 모든 UserPromptSubmit에 4-Phase 코드 워크플로우 강제
- 변경 후 동작: /pm Skill 실행 컨텍스트에서는 4-Phase 출력 스킵
- 변경 사유: /pm은 기획/문서 작업으로 코드 4-Phase가 부적절
- 영향 범위: workflow-enforced.sh만 (다른 훅 영향 없음)
- 롤백 방안: 예외 조건 제거로 원복
```

#### 0-4. project-task-manager 역할 경계 명시

| 필드                 | 내용                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| **작업 내용**        | pm-planner와의 역할 경합 방지를 위해 project-task-manager agent에 역할 경계 섹션 추가 |
| **수정 파일**        | `.claude/agents/project-task-manager.md`                                              |
| **의존성**           | 없음 (독립 선행 작업)                                                                 |
| **기존 시스템 영향** | 기존 CRUD 기능 변경 없음, 역할 설명만 추가                                            |
| **리스크**           | LOW — 문서 수준 변경만                                                                |
| **검증 방법**        | 기존 /tasks 정상 작동 확인, agent.md 역할 경계 섹션 존재 확인                         |

```
[기존 컴포넌트 변경 상세]
- 대상 파일: .claude/agents/project-task-manager.md
- 변경 전 동작: 범용 GitHub Project CRUD (태스크 조회/생성/상태변경/우선순위변경/삭제)
- 변경 후 동작: 동일 + "역할 경계" 섹션 추가
  - 이 Agent가 담당: 개발 태스크 CRUD, Status/Priority 관리
  - /pm 워크플로우가 담당: Feature Issue 일괄 생성, feature:{name} 라벨, Milestone 연결
  - pm-planner 호출 시: pm-planner 지시에 따라 실행
- 변경 사유: pm-planner와 역할 경합 방지
- 영향 범위: project-task-manager.md만
- 롤백 방안: 역할 경계 섹션 삭제로 원복
```

---

### Phase 1: 기반 구조 구축

#### 1-1. PM-DOCS 폴더 구조 생성

| 필드                 | 내용                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **작업 내용**        | PM-DOCS/ 전체 디렉토리 구조 생성 (기존 Workflow/ 제외)                                                                                                                                                                                                                                                                                     |
| **생성 파일**        | `PM-DOCS/Context_Output/.gitkeep`, `PM-DOCS/Context_Output/Archive/.gitkeep`, `PM-DOCS/Planning/Roadmap/.gitkeep`, `PM-DOCS/Planning/Feature_PRD/.gitkeep`, `PM-DOCS/Planning/IA/screen-index.yml`, `PM-DOCS/Planning/IA/IA-table.md`, `PM-DOCS/Planning/events-index.yml`, `PM-DOCS/Planning/changelog.md`, `PM-DOCS/Planning/templates/` |
| **의존성**           | 없음                                                                                                                                                                                                                                                                                                                                       |
| **기존 시스템 영향** | 없음 — 완전 독립 경로                                                                                                                                                                                                                                                                                                                      |
| **리스크**           | LOW                                                                                                                                                                                                                                                                                                                                        |
| **검증 방법**        | 디렉토리 구조가 `Definition of PM-DOCS folder.md`와 일치하는지 확인                                                                                                                                                                                                                                                                        |

#### 1-2. PRD 템플릿 생성

| 필드                 | 내용                                              |
| -------------------- | ------------------------------------------------- |
| **작업 내용**        | STEP 3-A에서 설계한 PRD 템플릿을 파일로 생성      |
| **생성 파일**        | `PM-DOCS/Planning/templates/PRD-TEMPLATE.md`      |
| **의존성**           | 1-1                                               |
| **기존 시스템 영향** | 없음                                              |
| **리스크**           | LOW                                               |
| **검증 방법**        | 11개 섹션 완전성 확인, YAML frontmatter 파싱 성공 |

#### 1-3. screens.yml 스키마 템플릿

| 필드                 | 내용                                              |
| -------------------- | ------------------------------------------------- |
| **작업 내용**        | 화면 정의 YAML 스키마 템플릿 생성                 |
| **생성 파일**        | `PM-DOCS/Planning/templates/screens-template.yml` |
| **의존성**           | 1-1                                               |
| **기존 시스템 영향** | 없음                                              |
| **리스크**           | LOW                                               |
| **검증 방법**        | YAML 문법 유효성, IA 집계에 필요한 필드 포함 확인 |

**스키마:**

```yaml
# screens.yml - Feature 화면 정의서
feature: '{feature-name}'
screens:
  - id: 'SCR-{NNN}'
    name: '화면명'
    route: '/path'
    description: '화면 설명'
    entry_conditions:
      - '진입 조건 1'
    ui_elements:
      - '주요 UI 요소 1'
    states:
      - name: '기본'
        description: '기본 상태 설명'
```

#### 1-4. events.yml 스키마 템플릿

| 필드                 | 내용                                             |
| -------------------- | ------------------------------------------------ |
| **작업 내용**        | Mixpanel 이벤트 트래킹 YAML 스키마 템플릿 생성   |
| **생성 파일**        | `PM-DOCS/Planning/templates/events-template.yml` |
| **의존성**           | 1-1                                              |
| **기존 시스템 영향** | 없음                                             |
| **리스크**           | LOW                                              |
| **검증 방법**        | YAML 문법 유효성, Mixpanel 필수 필드 포함 확인   |

**스키마:**

```yaml
# events.yml - Feature 이벤트 트래킹 정의서
feature: '{feature-name}'
events:
  - name: 'event_name'
    trigger: '이벤트 발화 조건'
    screen_id: 'SCR-{NNN}'
    category: 'interaction | navigation | conversion | error'
    properties:
      - name: 'prop_name'
        type: 'string | number | boolean'
        description: '프로퍼티 설명'
        required: true
        pii: false
    kpi: '연결 KPI'
    funnel: '소속 퍼널명'
```

#### 1-5. changelog.md 양식 생성

| 필드                 | 내용                                               |
| -------------------- | -------------------------------------------------- |
| **작업 내용**        | Keep a Changelog 형식의 변경 이력 템플릿 생성      |
| **생성 파일**        | `PM-DOCS/Planning/templates/changelog-template.md` |
| **의존성**           | 1-1                                                |
| **기존 시스템 영향** | 없음                                               |
| **리스크**           | LOW                                                |
| **검증 방법**        | 형식 일관성 확인                                   |

**양식:**

```markdown
# Changelog

All notable changes to this feature will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [YYYY-MM-DD]

### Added

- 새로 추가된 항목

### Changed

- 변경된 항목

### Removed

- 제거된 항목
```

#### 1-6. Milestone 파일 양식 생성

| 필드                 | 내용                                                  |
| -------------------- | ----------------------------------------------------- |
| **작업 내용**        | Milestone 파일 YAML frontmatter + MD body 템플릿 생성 |
| **생성 파일**        | `PM-DOCS/Planning/templates/milestone-template.md`    |
| **의존성**           | 1-1                                                   |
| **기존 시스템 영향** | 없음                                                  |
| **리스크**           | LOW                                                   |
| **검증 방법**        | frontmatter 파싱 성공, 필수 필드 포함 확인            |

**양식:**

```markdown
---
milestone_id: 'M-{XXX}'
goal: ''
period:
  start: 'YYYY-MM-DD'
  end: 'YYYY-MM-DD'
status: 'backlog'
created_at: 'YYYY-MM-DD'
updated_at: 'YYYY-MM-DD'
---

# M-{XXX}: {마일스톤 목표}

## 연결된 Feature 목록

| Feature명 | 라벨 | 상태 | 하위 Issue |
| --------- | ---- | ---- | ---------- |
|           |      |      |            |

## 목표 상세

(마일스톤의 상세 목표 기술)
```

#### 1-7. pm-config.yml 중앙 설정 파일

| 필드                 | 내용                                                            |
| -------------------- | --------------------------------------------------------------- |
| **작업 내용**        | GitHub Project ID, 경로, 라벨 접두사 등 PM 워크플로우 전체 설정 |
| **생성 파일**        | `.claude/skills/planning/pm-config.yml`                         |
| **의존성**           | 0-1                                                             |
| **기존 시스템 영향** | 없음                                                            |
| **리스크**           | LOW                                                             |
| **검증 방법**        | YAML 파싱 성공, 모든 ID 유효성 확인                             |

**내용:**

```yaml
# PM 워크플로우 중앙 설정
github:
  project:
    id: 'PVT_kwDOBneqM84BOTlj'
    number: 4
    owner: 'overdunenet'
  fields:
    status:
      field_id: 'PVTSSF_lADOBneqM84BOTljzg9DAno'
      options:
        backlog: 'f75ad846'
        ready: '61e4505c'
        in_progress: '47fc9ee4'
        in_review: 'df73e18b'
        done: '98236657'
    priority:
      field_id: 'PVTSSF_lADOBneqM84BOTljzg9DArc'
      options:
        p0: '79628723'
        p1: '0a877460'
        p2: 'da944a9c'

labels:
  feature_prefix: 'feature:'
  bug_label: 'bug'

paths:
  context_output: 'PM-DOCS/Context_Output'
  planning: 'PM-DOCS/Planning'
  roadmap: 'PM-DOCS/Planning/Roadmap'
  feature_prd: 'PM-DOCS/Planning/Feature_PRD'
  ia: 'PM-DOCS/Planning/IA'
  templates: 'PM-DOCS/Planning/templates'

bmad:
  version: '2024-Q4'
  referenced_workflows:
    - 'pm-agent'
    - 'prd-create'
    - 'prd-validate'
    - 'prd-edit'
    - 'create-epics'
    - 'architect-review'
    - 'po-validation'
```

---

### Phase 2: BMAD-METHOD 패턴 통합

#### 2-1. PM Agent 정의

| 필드                 | 내용                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **작업 내용**        | BMAD pm.agent.yaml의 persona/menu 패턴을 참조하여 PM Agent 정의. Claude Code의 .claude/agents/ 형식으로 작성 |
| **생성 파일**        | `.claude/agents/pm-planner.md`                                                                               |
| **의존성**           | 1-7 (pm-config.yml)                                                                                          |
| **기존 시스템 영향** | 없음 — 신규 Agent 추가, skill-forced.sh가 자동 스캔                                                          |
| **리스크**           | LOW                                                                                                          |
| **검증 방법**        | Agent가 Task tool로 호출 가능한지, /pm Skill과 연결되는지 확인                                               |

**Agent 설계:**

- 모델: `opus` (복잡한 기획 대화 필요)
- 역할: PM 기획 워크플로우 전담 (PRD 작성, Milestone 관리, Issue 분해)
- 참조: planning/SKILL.md, prd-workflow.md, cis-guide.md
- 출력: PM-DOCS/ 전체

#### 2-2. PM Skill 정의

| 필드                 | 내용                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **작업 내용**        | /pm 커맨드의 진입점이 되는 Skill 정의. 3분기(New Task, Edit Task, Context Making) 라우팅 |
| **생성 파일**        | `.claude/skills/planning/SKILL.md`                                                       |
| **의존성**           | 2-1                                                                                      |
| **기존 시스템 영향** | 없음                                                                                     |
| **리스크**           | LOW                                                                                      |
| **검증 방법**        | `/pm` 명령 시 3개 선택지 정상 표시 확인                                                  |

#### 2-3. PRD 워크플로우 서브파일

| 필드                 | 내용                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| **작업 내용**        | BMAD step-file 패턴을 차용하여 Phase A-E 워크플로우를 서브파일로 정의 |
| **생성 파일**        | `.claude/skills/planning/prd-workflow.md`                             |
| **의존성**           | 2-2, 1-2 (PRD 템플릿)                                                 |
| **기존 시스템 영향** | 없음                                                                  |
| **리스크**           | MEDIUM — 워크플로우 복잡도 높음, 단계 간 데이터 전달 정확성           |
| **검증 방법**        | 더미 Feature로 Phase A-E 전체 플로우 시뮬레이션                       |

#### 2-4. CIS 가이드 서브파일

| 필드                 | 내용                                              |
| -------------------- | ------------------------------------------------- |
| **작업 내용**        | S1-S5 상황별 CIS 워크플로우 선택 가이드 정의      |
| **생성 파일**        | `.claude/skills/planning/cis-guide.md`            |
| **의존성**           | 2-2                                               |
| **기존 시스템 영향** | 없음                                              |
| **리스크**           | LOW                                               |
| **검증 방법**        | 5가지 상황 시나리오별 올바른 워크플로우 추천 확인 |

---

### Phase 3: 핵심 워크플로우 구현

#### 3-1. /pm Skill 진입점 구현

| 필드                 | 내용                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| **작업 내용**        | `/pm` 입력 시 3개 메뉴(New Task, Edit Task, Context Making) 표시 및 분기 로직 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` 완성                                       |
| **의존성**           | Phase 2 전체                                                                  |
| **기존 시스템 영향** | 없음                                                                          |
| **리스크**           | LOW                                                                           |
| **검증 방법**        | `/pm` → 3개 선택지 표시 → 각 분기로 정상 이동                                 |

#### 3-2. Milestone 워크플로우

| 필드                 | 내용                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| **작업 내용**        | Milestone 생성 플로우: 메타데이터 입력 → 파일 저장 → "Feature 기획?" 분기 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Milestone 섹션)                       |
| **의존성**           | 3-1, 1-6 (milestone 템플릿)                                               |
| **기존 시스템 영향** | 없음                                                                      |
| **리스크**           | LOW                                                                       |
| **검증 방법**        | Milestone 생성 → PM-DOCS/Planning/Roadmap/ 에 파일 생성 확인              |

#### 3-3. Feature 워크플로우 (5-Phase)

| 필드                 | 내용                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| **작업 내용**        | Feature 기획 전체 파이프라인: Phase A(Context)→B(요구사항)→C(상세)→D(기술)→E(검증/저장) |
| **생성/수정 파일**   | `.claude/skills/planning/prd-workflow.md` 완성, pm-planner.md 연동                      |
| **의존성**           | 3-1, 3-2 (Milestone 존재 필요), 1-2~1-5 (템플릿)                                        |
| **기존 시스템 영향** | 없음                                                                                    |
| **리스크**           | HIGH — 가장 복잡한 워크플로우, 13개 step 순차 실행                                      |
| **검증 방법**        | 더미 Feature 전체 플로우 실행, PRD 4개 파일 생성 확인, changelog 기록 확인              |

#### 3-4. Issue 워크플로우 (Bug/Enhancement)

| 필드                 | 내용                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **작업 내용**        | Bug/Enhancement 분기 → GitHub Issue 생성 → 라벨/마일스톤 배정                                                           |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Issue 섹션)                                                                         |
| **의존성**           | 3-1                                                                                                                     |
| **기존 시스템 영향** | `project-task-manager` agent 연동 (Issue → Project #4 등록)                                                             |
| **리스크**           | MEDIUM — GitHub API 호출, 기존 Issue와 충돌 가능                                                                        |
| **검증 방법**        | Bug: Issue 생성 + `bug` 라벨 + 마일스톤 없음 확인. Enhancement: Issue 생성 + `feature:{name}` 라벨 + 마일스톤 배정 확인 |

#### 3-5. Edit Task 워크플로우

| 필드                 | 내용                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| **작업 내용**        | 기존 Milestone/Feature/Issue 수정 플로우. Milestone 상태 수동 변경, Feature PRD 수정 + changelog, Issue 재배정 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Edit 섹션)                                                                 |
| **의존성**           | 3-2, 3-3, 3-4                                                                                                  |
| **기존 시스템 영향** | 없음                                                                                                           |
| **리스크**           | MEDIUM — 기존 데이터 수정 시 일관성 유지                                                                       |
| **검증 방법**        | Milestone 상태 변경, Feature PRD 수정 → changelog 자동 기록 확인                                               |

---

### Phase 4: CIS 통합

#### 4-1. Context Making 진입점

| 필드                 | 내용                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| **작업 내용**        | `/pm → Context Making` 선택 시 5개 CIS 워크플로우 메뉴 표시                   |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Context Making 섹션), `cis-guide.md` 연동 |
| **의존성**           | 3-1, 2-4                                                                      |
| **기존 시스템 영향** | 없음                                                                          |
| **리스크**           | LOW                                                                           |
| **검증 방법**        | 5개 워크플로우 선택지 정상 표시, S1-S5 자동 추천 동작 확인                    |

#### 4-2. CIS 워크플로우 실행 로직

| 필드                 | 내용                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **작업 내용**        | 5개 CIS 워크플로우(Brainstorming, Design Thinking, Problem Solving, Innovation Strategy, Storytelling) 실행 및 산출물 저장 |
| **생성/수정 파일**   | `.claude/skills/planning/cis-guide.md` 완성                                                                                |
| **의존성**           | 4-1                                                                                                                        |
| **기존 시스템 영향** | 없음                                                                                                                       |
| **리스크**           | MEDIUM — 각 워크플로우의 단계별 가이드 품질에 의존                                                                         |
| **검증 방법**        | 각 CIS 워크플로우 실행 → Context_Output/ 에 .md 파일 생성 확인                                                             |

#### 4-3. CIS → PRD 참조 연결

| 필드                 | 내용                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| **작업 내용**        | Feature 워크플로우 Phase A에서 CIS 산출물을 선택하고 PRD에 참조 링크 삽입하는 로직 |
| **생성/수정 파일**   | `.claude/skills/planning/prd-workflow.md` (Phase A 섹션)                           |
| **의존성**           | 4-2, 3-3                                                                           |
| **기존 시스템 영향** | 없음                                                                               |
| **리스크**           | LOW                                                                                |
| **검증 방법**        | CIS 산출물 선택 → PRD §11 참조 문서에 경로 링크 삽입 확인                          |

---

### Phase 5: 자동화 연결

#### 5-1. GitHub Issue 자동 생성 (PRD 분해)

| 필드                 | 내용                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **작업 내용**        | PRD 완성 후 Phase E에서 Issue 분해 로직 구현. PRD의 유저스토리/AC를 기반으로 Issue + Sub-Issue 자동 생성 |
| **생성/수정 파일**   | `.claude/skills/planning/prd-workflow.md` (Phase E 후속)                                                 |
| **의존성**           | 3-3, 3-4                                                                                                 |
| **기존 시스템 영향** | `project-task-manager` agent 활용 (GitHub Issue → Project #4 등록)                                       |
| **리스크**           | HIGH — Issue 중복 생성, 과도한 분해 위험                                                                 |
| **검증 방법**        | PRD → Issue 분해 실행 → 생성된 Issue 목록 확인, title 기반 중복 검사 동작 확인                           |

#### 5-2. Feature 라벨 자동 생성

| 필드                 | 내용                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **작업 내용**        | Feature 생성 시 `feature:{name}` 라벨 자동 생성 (gh label create)   |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Feature 생성 부수효과)          |
| **의존성**           | 3-3                                                                 |
| **기존 시스템 영향** | GitHub Labels에 새 라벨 추가                                        |
| **리스크**           | LOW — 기존 라벨과 네임스페이스 분리                                 |
| **검증 방법**        | Feature 생성 → `gh label list` 에서 `feature:{name}` 라벨 존재 확인 |

#### 5-3. Feature 상태 자동 전파

| 필드                 | 내용                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| **작업 내용**        | Feature 하위 Issue 상태 변경 시 Feature 상태 자동 재계산 (backlog/ongoing/done)                      |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (상태 전파 섹션), 선택적: `.github/workflows/pm-feature-sync.yml` |
| **의존성**           | 5-1, 5-2                                                                                             |
| **기존 시스템 영향** | 없음 — PM-DOCS 파일 기반 상태 관리                                                                   |
| **리스크**           | MEDIUM — Issue 상태 조회 시점과 Feature 파일 업데이트 정합성                                         |
| **검증 방법**        | Issue 상태 변경 → Feature PRD frontmatter 상태 자동 업데이트 확인                                    |

#### 5-4. IA/screen-index.yml 자동 집계

| 필드                 | 내용                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **작업 내용**        | 모든 Feature_PRD/\*/screens.yml을 스캔하여 IA/screen-index.yml로 통합, IA-table.md 렌더링 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (집계 섹션)                                            |
| **의존성**           | 3-3 (Feature PRD 존재)                                                                    |
| **기존 시스템 영향** | 없음                                                                                      |
| **리스크**           | LOW                                                                                       |
| **검증 방법**        | 2개+ Feature의 screens.yml → screen-index.yml 통합본 정확성 확인                          |

#### 5-5. events-index.yml 자동 집계

| 필드                 | 내용                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| **작업 내용**        | 모든 Feature_PRD/\*/events.yml을 스캔하여 Planning/events-index.yml로 통합 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (집계 섹션)                             |
| **의존성**           | 3-3                                                                        |
| **기존 시스템 영향** | 없음                                                                       |
| **리스크**           | LOW                                                                        |
| **검증 방법**        | 2개+ Feature의 events.yml → events-index.yml 통합본 정확성 확인            |

#### 5-6. 라벨/마일스톤 자동 배정

| 필드                 | 내용                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| **작업 내용**        | Issue 생성 시 Feature 라벨 + 상위 Milestone 자동 배정 로직           |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (Issue 생성 부수효과)             |
| **의존성**           | 5-1, 5-2                                                             |
| **기존 시스템 영향** | GitHub Issue의 라벨/마일스톤 속성 변경                               |
| **리스크**           | MEDIUM — 기존 labeler.yml과의 라벨 경합 가능성 (네임스페이스로 완화) |
| **검증 방법**        | Issue 생성 → 라벨 `feature:{name}` + 마일스톤 정상 배정 확인         |

---

### Phase 6: 안전장치 & 검증

#### 6-1. 중복 검사 로직

| 필드                 | 내용                                                           |
| -------------------- | -------------------------------------------------------------- |
| **작업 내용**        | Issue title 기반 중복 검사, Feature명 중복 검사 구현           |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (검증 섹션)                 |
| **의존성**           | 5-1                                                            |
| **기존 시스템 영향** | 없음                                                           |
| **리스크**           | LOW                                                            |
| **검증 방법**        | 동일 Feature명/Issue title로 중복 생성 시도 → 차단 메시지 확인 |

#### 6-2. Feature ↔ Milestone 필수 소속 검증

| 필드                 | 내용                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| **작업 내용**        | Feature 생성 시 Milestone 미선택 차단, Enhancement Issue 생성 시 Feature 미선택 경고 |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (검증 섹션)                                       |
| **의존성**           | 3-2, 3-3                                                                             |
| **기존 시스템 영향** | 없음                                                                                 |
| **리스크**           | LOW                                                                                  |
| **검증 방법**        | Milestone 없이 Feature 생성 시도 → 차단 확인                                         |

#### 6-3. Archive 30일 자동 이동

| 필드                 | 내용                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **작업 내용**        | Context_Output/ 파일 중 30일 경과 파일을 Archive/로 이동하는 로직                           |
| **생성/수정 파일**   | `.claude/skills/planning/SKILL.md` (아카이빙 섹션), 또는 `.github/workflows/pm-archive.yml` |
| **의존성**           | 1-1                                                                                         |
| **기존 시스템 영향** | 없음                                                                                        |
| **리스크**           | LOW                                                                                         |
| **검증 방법**        | 30일 이상 된 테스트 파일 → Archive/ 이동 확인                                               |

#### 6-4. PRD 중단 시 임시 저장

| 필드                 | 내용                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| **작업 내용**        | PRD 작성 중 사용자가 대화를 중단했을 때, 부분 완성 PRD를 임시 저장하는 로직 |
| **생성/수정 파일**   | `.claude/skills/planning/prd-workflow.md` (임시 저장 섹션)                  |
| **의존성**           | 3-3                                                                         |
| **기존 시스템 영향** | 없음                                                                        |
| **리스크**           | LOW                                                                         |
| **검증 방법**        | PRD 작성 Phase C에서 중단 → 다음 세션에서 이어서 작성 가능 확인             |

#### 6-5. §10 불변 규칙 검증 테스트

| 필드                 | 내용                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| **작업 내용**        | 9개 불변 규칙 위반 시나리오를 수동 테스트하여 모든 규칙이 강제되는지 확인 |
| **생성/수정 파일**   | 없음 (테스트만)                                                           |
| **의존성**           | Phase 0-5 전체                                                            |
| **기존 시스템 영향** | 없음                                                                      |
| **리스크**           | LOW                                                                       |
| **검증 방법**        | 아래 9개 규칙 위반 시나리오 실행:                                         |

```
[§10 불변 규칙 검증 시나리오]
1. Milestone 없이 Feature 생성 → 차단 확인
2. Bug+Feature 라벨 동시 부여 → 차단 확인
3. Bug Issue에 마일스톤 배정 → 차단 확인
4. Bug Issue에 Feature 계층 소속 → 비소속 확인
5. Milestone 상태 자동 변경 시도 → 차단 확인 (수동만 허용)
6. Feature 상태 수동 변경 시도 → 차단 확인 (자동만 허용)
7. Enhancement에 Feature 복수 선택 → 단일 선택 강제 확인
8. Archive 파일 PRD 참조 → 목록에서 제외 확인
9. IA/events-index 직접 수정 → 경고 또는 차단 확인
```

#### 6-6. 기존 시스템 통합 테스트

| 필드                 | 내용                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| **작업 내용**        | 기존 Hook, Agent, Skill, GitHub Actions와 /pm 워크플로우 간 정상 공존 확인 |
| **생성/수정 파일**   | 없음 (테스트만)                                                            |
| **의존성**           | Phase 0-5 전체                                                             |
| **기존 시스템 영향** | 전체 시스템                                                                |
| **리스크**           | MEDIUM                                                                     |
| **검증 방법**        | 아래 시나리오 실행:                                                        |

```
[통합 테스트 시나리오]
1. /pm 실행 후 기존 /tasks 정상 작동 확인
2. Feature 생성 후 labeler.yml 브랜치 라벨 정상 작동 확인
3. Issue 생성 후 project-task-manager로 Project #4 등록 확인
4. PR 생성 후 context-gen.yml CI 정상 작동 확인
5. skill-forced.sh가 planning Skill을 인식하는지 확인
6. workflow-enforced.sh가 pm-planner agent를 인식하는지 확인
```

---

## STEP 5: 미정의 항목 보고

| #   | 미정의 항목                  | 영향 Phase | 심각도                  | 결정 시점       | 제안                             |
| --- | ---------------------------- | ---------- | ----------------------- | --------------- | -------------------------------- |
| 1   | Feature 라벨 네임스페이스    | 0, 5       | ~~블로커~~ → **결정됨** | Phase 0 전      | `feature:{name}`                 |
| 2   | screens.yml 스키마           | 1          | ~~블로커~~ → **결정됨** | Phase 1 전      | 제안 스키마 (1-3 참조)           |
| 3   | events.yml 스키마            | 1          | ~~블로커~~ → **결정됨** | Phase 1 전      | Mixpanel 스키마 (1-4 참조)       |
| 4   | PRD→Issue 동기화             | 5          | ~~블로커~~ → **결정됨** | Phase 5 전      | changelog+수동 (v1)              |
| 5   | Milestone 파일 형식          | 1          | ~~중요~~ → **결정됨**   | Phase 1         | YAML frontmatter + MD            |
| 6   | changelog.md 형식            | 1          | ~~중요~~ → **결정됨**   | Phase 1         | Keep a Changelog                 |
| 7   | BMAD 참조 대상               | 2          | ~~중요~~ → **결정됨**   | Phase 2         | 7개 워크플로우                   |
| 8   | 삭제 정책                    | 6          | ~~중요~~ → **결정됨**   | Phase 6         | archive-only                     |
| 9   | Issue reopen→Feature 상태    | 5          | 중요                    | Phase 5 완료 전 | ongoing으로 재전환 (자동)        |
| 10  | CIS→PRD 참조 방식            | 4          | 중요                    | Phase 4         | 파일 경로 링크 (인라인 아님)     |
| 11  | 기존 수동 Issue 마이그레이션 | 3          | 중요                    | Phase 3 완료 후 | Edit Task→Issue에서 Feature 연결 |
| 12  | Edit Task 상세 플로우        | 3          | 중요                    | Phase 3         | 3-5에서 설계                     |
| 13  | BMAD upstream 변경 추적      | 2          | 권장                    | Phase 2         | pm-config.yml에 버전 태그        |
| 14  | Feature 50개+ 집계 성능      | 5          | 권장                    | Phase 5 이후    | glob 순차 처리(v1), 캐시(v2)     |
| 15  | CIS Archive 산출물 링크 깨짐 | 4          | 권장                    | Phase 4 이후    | PRD에 스냅샷 복사 권장           |

---

## STEP 6: 시나리오 테스트 결과

### 시나리오 #1: Milestone 없이 Feature 생성 시도

**입력 조건**: Milestone이 0개인 상태
**실행 행동**: `/pm → New Task → Feature`
**기대 결과**: "먼저 Milestone을 생성해주세요" 안내 후 Milestone 생성으로 유도
**현재 설계의 처리 여부**: ✅ 처리됨
**구현 위치**: Phase 3-3 (Phase A Step A1) + Phase 6-2

### 시나리오 #2: 동일 Feature명으로 두 번 생성

**입력 조건**: `feature:로그인` 라벨이 이미 존재
**실행 행동**: 동일한 이름으로 Feature 재생성 시도
**기대 결과**: "이미 존재하는 Feature명입니다" 경고 + 기존 Feature 편집 유도
**현재 설계의 처리 여부**: ✅ 처리됨
**구현 위치**: Phase 6-1

### 시나리오 #3: Issue 상태 혼합 시 Feature 전파

**입력 조건**: Feature 하위 Issue 5개 중 3개 done, 1개 in-progress, 1개 reopen
**실행 행동**: Issue 1개를 reopen 처리
**기대 결과**: Feature 상태 = `ongoing` (1개라도 진행중이면)
**현재 설계의 처리 여부**: ⚠️ 부분 처리 — reopen은 in-progress로 간주하는 규칙 필요
**미처리 시 개선 방안**: Phase 5-3에 "done이 아닌 Issue가 1개라도 있으면 ongoing" 규칙 명시

### 시나리오 #4: 30일 경과 CIS 산출물 → PRD 참조

**입력 조건**: Context_Output/에 35일 전 파일 존재 (Archive 미이동 상태)
**실행 행동**: Feature 워크플로우 Phase A에서 컨텍스트 참조
**기대 결과**: Archive 대상 파일은 목록에서 제외
**현재 설계의 처리 여부**: ⚠️ 부분 처리 — Archive 이동이 수동/예약 실행이면 틈새 존재
**미처리 시 개선 방안**: Phase A2에서 파일 생성일 기준 30일 필터링 추가 (Archive 이동과 독립)

### 시나리오 #5: Bug + Enhancement 동일 Feature 등록

**입력 조건**: `feature:로그인` Feature 존재
**실행 행동**: Bug 이슈와 Enhancement 이슈를 동시에 생성
**기대 결과**: Bug → `bug` 라벨 (Feature 계층 밖), Enhancement → `feature:로그인` 라벨 (계층 내)
**현재 설계의 처리 여부**: ✅ 처리됨
**구현 위치**: Phase 3-4

### 시나리오 #6: PRD 작성 중 대화 중단

**입력 조건**: Feature 워크플로우 Phase C 진행 중
**실행 행동**: 사용자가 세션 종료/다른 작업 전환
**기대 결과**: 부분 완성 PRD가 임시 저장, 다음 세션에서 이어서 작성 가능
**현재 설계의 처리 여부**: ⚠️ 부분 처리 — 임시 저장 로직 미상세
**미처리 시 개선 방안**: Phase 6-4에 임시 저장 로직 추가 (PRD frontmatter status: "draft")

### 시나리오 #7: screens.yml 수정 후 IA 자동 집계

**입력 조건**: Feature A의 screens.yml에 화면 2개 존재
**실행 행동**: screens.yml에 화면 1개 추가
**기대 결과**: screen-index.yml + IA-table.md 자동 업데이트
**현재 설계의 처리 여부**: ✅ 처리됨
**구현 위치**: Phase 5-4 (Edit Task 실행 시 집계 트리거)

### 시나리오 #8: 2개 Feature가 동일 화면 ID 참조

**입력 조건**: Feature A에 SCR-001, Feature B에도 SCR-001
**실행 행동**: Feature B의 PRD 검증 실행
**기대 결과**: "화면 ID SCR-001이 Feature A에 이미 사용됨" 경고
**현재 설계의 처리 여부**: ⚠️ 부분 처리 — Phase E1에 화면 ID 중복 검사 추가 필요
**미처리 시 개선 방안**: screen-index.yml 기반 중복 ID 검사를 E1에 추가

### 시나리오 #9: CIS 워크플로우 실행 중 에러

**입력 조건**: Design Thinking 워크플로우 실행 중
**실행 행동**: 네트워크 에러 또는 LLM 응답 실패
**기대 결과**: 부분 산출물 저장 + 에러 안내 + 재시도 옵션
**현재 설계의 처리 여부**: ⚠️ 부분 처리 — Claude Code 자체 에러 핸들링에 의존
**미처리 시 개선 방안**: CIS 가이드에 "실패 시 부분 저장 + 재시도 안내" 지침 추가

### 시나리오 #10: 기존 수동 Issue를 Feature 계층에 편입

**입력 조건**: 수동 생성된 GitHub Issue #25 (라벨 없음)
**실행 행동**: `/pm → Edit Task → Issue` → #25 선택 → Feature 배정
**기대 결과**: `feature:{name}` 라벨 + 마일스톤 자동 배정
**현재 설계의 처리 여부**: ✅ 처리됨
**구현 위치**: Phase 3-5 (Edit Task)

### 시나리오 #11: Feature 삭제 시 하위 Issue 처리

**입력 조건**: Feature "로그인" 하위에 Issue 5개 존재
**실행 행동**: Feature 삭제(archive) 시도
**기대 결과**: Feature 상태 → archived, 하위 Issue의 `feature:로그인` 라벨 제거, 마일스톤 유지
**현재 설계의 처리 여부**: ✅ 처리됨 (archive-only 정책)
**구현 위치**: Phase 3-5 + Q8 결정

### 시나리오 #12: 동시 PRD 작성 (멀티 세션)

**입력 조건**: 세션 A에서 Feature X PRD 작성 중
**실행 행동**: 세션 B에서 동일 Feature X PRD 작성 시도
**기대 결과**: 단일 사용자 환경이므로 실질적 충돌 없음
**현재 설계의 처리 여부**: ✅ 처리됨 (단일 사용자 전제)
**비고**: 멀티 사용자 시 파일 잠금 필요 (v2 이후)

### 종합 개선 보고

**즉시 반영 필요 (워크플로우가 깨지는 치명적 이슈):**

- 없음

**계획서에 추가 필요:**

1. Phase E1에 화면 ID 중복 검사 추가 (시나리오 #8)
2. Phase 6-4 PRD 중단 시 임시 저장 로직 추가 (시나리오 #6) — **이미 반영됨**
3. Phase A2에 30일 기준 필터링 추가 (시나리오 #4)
4. Phase 5-3에 reopen→ongoing 규칙 명시 (시나리오 #3)

**향후 개선 권장 (v2):**

1. 자동 diff → Issue 동기화 제안 기능
2. 멀티 사용자 환경 파일 잠금
3. CIS 실패 시 부분 저장 + 자동 재시도

---

## §10 불변 규칙 최종 검증

| #   | 규칙                               | 구현 위치                  | 검증 결과 |
| --- | ---------------------------------- | -------------------------- | --------- |
| 1   | Feature는 반드시 Milestone에 소속  | Phase A1 + Phase 6-2       | ✅        |
| 2   | Issue는 Bug/Feature 라벨 중 하나   | Phase 3-4                  | ✅        |
| 3   | Feature 라벨 Issue만 마일스톤 부여 | Phase 5-6                  | ✅        |
| 4   | Bug는 계층 밖 독립 관리            | Phase 3-4 Bug 분기         | ✅        |
| 5   | Milestone 상태 수동만              | Phase 3-2 + Phase 3-5      | ✅        |
| 6   | Feature 상태 자동 전파만           | Phase 5-3                  | ✅        |
| 7   | Enhancement는 1개 Feature만        | Phase 3-4 Enhancement 분기 | ✅        |
| 8   | Archive 파일 PRD 참조 제외         | Phase A2 필터링            | ✅        |
| 9   | IA/events-index 직접 수정 금지     | Phase 5-4, 5-5 자동 집계만 | ✅        |

**결론**: 9개 불변 규칙 모두 구현 계획 내에서 충족됨.

---

## 실행 순서 요약

```
Phase 0 (사전 준비)     ← 기존 시스템 수정, 1-2일
  ↓
Phase 1 (기반 구조)     ← PM-DOCS 폴더 + 템플릿, 1일
  ↓
Phase 2 (BMAD 통합)     ← Agent + Skill 정의, 2-3일
  ↓
Phase 3 (핵심 워크플로우) ← /pm 전체 플로우, 3-5일
  ↓
Phase 4 (CIS 통합)      ← Context Making, 2-3일
  ↓
Phase 5 (자동화 연결)    ← Issue 생성 + 상태 전파, 3-5일
  ↓
Phase 6 (안전장치)       ← 검증 + 테스트, 2-3일
```

각 Phase는 **독립적으로 배포 가능**하며, Phase 1만 완료해도 기존 시스템은 정상 작동합니다.
