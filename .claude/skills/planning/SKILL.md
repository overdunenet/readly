---
name: PM-Planning
description: PM 기획 워크플로우. /pm 커맨드로 Milestone/Feature/Issue 관리, PRD 작성, CIS 워크플로우 실행.
keywords:
  [PM, 기획, PRD, Milestone, Feature, Issue, CIS, /pm, 마일스톤, 피쳐, 이슈]
estimated_tokens: ~2000
user-invocable: true
---

# /pm - PM 기획 워크플로우

> **전담 Agent**: pm-planner (opus)
> **중앙 설정**: `pm-config.yml`

## 진입점

`/pm` 입력 시 AskUserQuestion으로 메인 메뉴를 표시한다:

| 메뉴               | 설명           | 서브 메뉴                                                                              |
| ------------------ | -------------- | -------------------------------------------------------------------------------------- |
| **New Task**       | 새 일감 생성   | Milestone / Feature / Issue                                                            |
| **Edit Task**      | 기존 일감 수정 | Milestone 수정 / Feature PRD 수정 / Issue 재배정                                       |
| **Context Making** | CIS 워크플로우 | Brainstorming / Design Thinking / Problem Solving / Innovation Strategy / Storytelling |

## 서브파일 구조

| 파일              | 역할                                       |
| ----------------- | ------------------------------------------ |
| `prd-workflow.md` | Feature PRD 5-Phase 워크플로우 (Phase A→E) |
| `prd-template.md` | PRD 11섹션 작성 가이드                     |
| `cis-guide.md`    | CIS 5종 워크플로우 가이드                  |
| `pm-config.yml`   | GitHub Project ID, 경로, 라벨 설정         |

---

## New Task 워크플로우

### Milestone 생성

1. 기존 Roadmap/ 스캔 → 최대 N 확인 → N+1 채번
2. AskUserQuestion으로 메타데이터 수집:
   - 마일스톤 목표
   - 기간 (시작일~종료일)
3. `milestone-template.md` 기반 파일 생성
4. `PM-DOCS/Planning/Roadmap/milestone-{NNN}.md` 저장
5. `Planning/changelog.md`에 기록
6. "바로 피쳐 기획할까요?" AskUserQuestion
   - Yes → Feature 워크플로우
   - No → 완료

### Feature 기획 (PRD 작성)

> 상세: `prd-workflow.md` 참조

**사전 검증**:

- Milestone 존재 필수 (불변 규칙 #1) — 없으면 Milestone 생성 유도
- Feature명 중복 검사 (Feature_PRD/ 폴더 스캔 + gh label list)

**5-Phase 실행**: Phase A(컨텍스트) → B(핵심 요구사항) → C(상세 정의) → D(기술/엣지) → E(검증/저장)

**산출물**:

- `Feature_PRD/feature#{N}_{name}/PRD.md`
- `Feature_PRD/feature#{N}_{name}/screens.yml`
- `Feature_PRD/feature#{N}_{name}/events.yml`
- `feature:{name}` GitHub 라벨 자동 생성
- screen-index.yml / events-index.yml 자동 집계
- Planning/changelog.md 기록

### Issue 생성 (Bug/Enhancement)

**Bug Issue**:

1. `gh issue create` — 라벨: `bug` (고정)
2. 마일스톤: 없음 (불변 규칙 #3, #4)
3. Bug + Feature 라벨 동시 부여 차단 (불변 규칙 #2)
4. "지금 작업 시작?" → In progress / Backlog 분기

**Enhancement Issue**:

1. Feature 목록 로드 → AskUserQuestion으로 1개 선택 (단일 선택 강제 — 불변 규칙 #7)
   - "unassigned" 선택지도 제공
2. `gh issue create` — 라벨: `feature:{name}`
3. 마일스톤: Feature의 상위 Milestone 자동 배정
4. title 기반 중복 검사 (`gh issue list --search`)
5. Project #4 등록

---

## Edit Task 워크플로우

### Milestone 수정

1. 기존 Milestone 목록 → AskUserQuestion으로 선택
2. 수정 가능: 목표, 기간, 상태(수동만 — 불변 규칙 #5)
3. changelog 자동 기록

### Feature PRD 수정

1. 기존 Feature 목록 → AskUserQuestion으로 선택
2. 미완료 PRD 감지 시 → "이어서 작성" 분기
3. 수정 후 changelog 자동 기록
4. Feature 상태 수동 변경 차단 (불변 규칙 #6)
5. screens.yml/events.yml 수정 시 → 인덱스 자동 재집계

### Issue 재배정

1. Issue 목록 → AskUserQuestion으로 선택
2. Feature 재배정 (라벨 변경)
3. 마일스톤 자동 업데이트 (Feature의 상위 Milestone)
4. 기존 수동 Issue도 Feature 계층 편입 가능

### Feature Archive (소프트 삭제)

1. Feature 삭제 시 → PRD status: "archived"
2. 하위 Issue의 `feature:{name}` 라벨 제거
3. 마일스톤은 유지

---

## Context Making 워크플로우

> 상세: `cis-guide.md` 참조

5종 CIS 워크플로우 실행:

1. **Brainstorming** — 아이디어 발산 (SCAMPER, Reverse Brainstorming 등)
2. **Design Thinking** — 인간 중심 설계 (Empathize→Define→Ideate→Prototype→Test)
3. **Problem Solving** — 체계적 문제 해결 (Five Whys, Fishbone, TRIZ 등)
4. **Innovation Strategy** — 전략적 혁신 (TAM/SAM/SOM, Five Forces, Blue Ocean 등)
5. **Storytelling** — 내러티브 전략 (Hero's Journey, Pixar Spine 등)

산출물: `PM-DOCS/Context Output/{workflow}_{YYYY-MM-DD}_{topic}.md`

---

## 자동화 로직

### Feature 상태 자동 전파

```bash
# 하위 Issue 상태 조회
gh issue list --label "feature:{name}" --state all --json number,state

# 상태 계산
# Issue 0개 → backlog
# 1개라도 open → ongoing
# 전부 closed → done
```

### IA/screen-index.yml 자동 집계

- `PM-DOCS/Planning/Feature_PRD/*/screens.yml` 전체 스캔
- 화면 ID 중복 검사 (Feature 간 충돌 감지)
- screen-index.yml 갱신 → IA-table.md 재렌더링

### events-index.yml 자동 집계

- `PM-DOCS/Planning/Feature_PRD/*/events.yml` 전체 스캔
- events-index.yml 갱신

### Archive 30일 자동 이동

- `/pm` 실행 시 Context Output/ 파일 생성일 확인
- 30일 경과 파일 → Archive/ 이동 제안

---

## 불변 규칙 요약

| #   | 규칙                           | 위반 시 동작                           |
| --- | ------------------------------ | -------------------------------------- |
| 1   | Feature → Milestone 필수 소속  | Feature 생성 차단, Milestone 생성 유도 |
| 2   | Bug/Feature 라벨 상호 배타     | 동시 부여 차단                         |
| 3   | Feature 라벨 Issue만 마일스톤  | Bug에 마일스톤 배정 차단               |
| 4   | Bug는 계층 밖 독립             | Bug Issue에 Feature 연결 차단          |
| 5   | Milestone 상태 수동만          | 자동 변경 시도 차단                    |
| 6   | Feature 상태 자동만            | 수동 변경 시도 차단                    |
| 7   | Enhancement → 1개 Feature만    | 복수 선택 차단                         |
| 8   | Archive 파일 참조 제외         | CIS 참조 목록에서 필터링               |
| 9   | IA/events-index 직접 수정 금지 | 자동 집계만 허용                       |
