# PM 워크플로우 시스템

> `/pm` 커맨드 기반의 PM 기획 워크플로우. BMAD-METHOD 패턴을 차용하여 PRD 작성, Milestone/Feature/Issue 관리, CIS(Creative Intelligence System) 워크플로우를 지원합니다.

---

## 왜 도입했는가

기존에는 PM 기획(PRD 작성, Milestone/Feature/Issue 관리)이 체계화되어 있지 않아 **기획-개발 파이프라인이 단절**되어 있었습니다.

이 시스템은 `/pm` 커맨드 하나로 기획 → PRD 작성 → GitHub Issue 분해까지 이어지는 엔드투엔드 워크플로우를 제공합니다.

---

## 기존 시스템에 미치는 영향

### 변경 없음 (Safe)

| 항목                          | 상태      |
| ----------------------------- | --------- |
| 기존 18개 Agent               | 변경 없음 |
| 기존 16개 Skill               | 변경 없음 |
| `/tasks` 커맨드               | 정상 작동 |
| 4-Phase 코드 워크플로우       | 정상 작동 |
| GitHub Project #4 CRUD        | 정상 작동 |
| Context 자동 생성             | 정상 작동 |
| pre-commit hook (lint-staged) | 정상 작동 |

### 수정된 파일 (3개)

| 파일                       | 변경 내용                           | 영향도                                                        |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `workflow-enforced.sh`     | `/pm` 입력 시 4-Phase 프로토콜 스킵 | LOW - 기존 코드 작업에 영향 없음. `/pm` 입력 시에만 예외 처리 |
| `project-task-manager.md`  | pm-planner와의 역할 경계 섹션 추가  | LOW - 기존 CRUD 기능 그대로. 문서만 추가                      |
| `task-management/SKILL.md` | pm-config.yml 참조 안내 추가        | LOW - 기존 ID 테이블 유지. 참조 문구 1줄 추가                 |

### 추가된 것

| 항목      | 내용                                                 |
| --------- | ---------------------------------------------------- |
| Agent 1개 | `pm-planner` (PM 기획 전담, opus)                    |
| Skill 1개 | `planning` (`/pm` 커맨드, user-invocable)            |
| 중앙 설정 | `pm-config.yml` (GitHub Project ID를 한 곳에서 관리) |
| 문서 폴더 | `PM-DOCS/` (기획 산출물 저장소)                      |

---

## 시스템 구조

```
.claude/
├── agents/
│   └── pm-planner.md          # (NEW) PM 기획 Agent
├── skills/
│   └── planning/              # (NEW) PM Skill 디렉토리
│       ├── SKILL.md           # /pm 진입점 + 메뉴 라우팅
│       ├── pm-config.yml      # GitHub Project ID 중앙 설정
│       ├── prd-workflow.md    # PRD 5-Phase 워크플로우
│       ├── prd-template.md    # PRD 작성 가이드
│       └── cis-guide.md       # CIS 5종 워크플로우 가이드
└── hooks/
    └── workflow-enforced.sh   # (MODIFIED) /pm 예외 추가

PM-DOCS/
├── Planning/
│   ├── Roadmap/               # Milestone 파일 저장
│   ├── Feature_PRD/           # Feature PRD 저장 (feature#{N}_{name}/)
│   ├── IA/                    # 화면 인덱스 (자동 집계)
│   ├── templates/             # PRD, Milestone, Changelog 템플릿
│   └── changelog.md           # 전역 변경 기록
├── Context Output/            # CIS 워크플로우 산출물
│   └── Archive/               # 30일 경과 파일
└── workflow/                  # 워크플로우 분석/참조 자료
```

---

## `/pm` 워크플로우 흐름

```
/pm 입력
  ├── 1. New Task
  │     ├── Milestone 생성 → Roadmap/ 저장
  │     ├── Feature 기획 → PRD 5-Phase (A→E) → Feature_PRD/ 저장
  │     │     └── (선택) GitHub Issue 자동 분해
  │     └── Issue 생성 → Bug / Enhancement
  │
  ├── 2. Edit Task
  │     ├── Milestone 수정
  │     ├── Feature PRD 수정 (미완료 PRD 이어쓰기)
  │     └── Issue 재배정
  │
  └── 3. Context Making
        └── CIS 5종 워크플로우
              ├── Brainstorming
              ├── Design Thinking
              ├── Problem Solving
              ├── Innovation Strategy
              └── Storytelling
```

---

## project-task-manager vs pm-planner 역할 분담

이 부분이 가장 헷갈릴 수 있는 영역입니다.

| 작업                       | project-task-manager | pm-planner |
| -------------------------- | -------------------- | ---------- |
| 개발 태스크 단건 CRUD      | O                    | -          |
| Status/Priority 변경       | O                    | -          |
| `/tasks` 조회              | O                    | -          |
| Milestone 생성/관리        | -                    | O          |
| Feature PRD 작성           | -                    | O          |
| Feature → Issue 일괄 분해  | -                    | O          |
| `feature:{name}` 라벨 관리 | -                    | O          |
| CIS 워크플로우 실행        | -                    | O          |

**핵심**: pm-planner가 Issue를 일괄 생성할 때 project-task-manager의 기존 GitHub API를 그대로 활용합니다. 기존 CRUD는 전혀 변경되지 않습니다.

---

## pm-config.yml (중앙 설정)

기존에 `project-task-manager.md`와 `task-management/SKILL.md`에 각각 하드코딩되어 있던 GitHub Project ID를 한 곳에서 관리합니다.

```yaml
github:
  project:
    id: 'PVT_kwDOBneqM84BOTlj'
    number: 4
    owner: 'overdunenet'
  fields:
    status:
      field_id: 'PVTSSF_lADOBneqM84BOTljzg9DAno'
    priority:
      field_id: 'PVTSSF_lADOBneqM84BOTljzg9DArc'

labels:
  feature_prefix: 'feature:'
  bug_label: 'bug'

paths:
  context_output: 'PM-DOCS/Context Output'
  planning: 'PM-DOCS/Planning'
  feature_prd: 'PM-DOCS/Planning/Feature_PRD'
```

기존 테이블은 그대로 유지하고, "값 변경 시 pm-config.yml을 우선 수정하세요" 안내만 추가했습니다.

---

## 불변 규칙 (9개)

PM 워크플로우에서 강제하는 규칙입니다. 기존 시스템에는 영향 없습니다.

1. Feature는 반드시 Milestone에 소속
2. Bug와 Feature 라벨은 상호 배타
3. Bug Issue에는 마일스톤 미배정
4. Bug Issue는 Feature 계층 밖 독립
5. Milestone 상태는 수동으로만 변경
6. Feature 상태는 자동 전파만 (하위 Issue 기반)
7. Enhancement는 Feature 1개에만 소속
8. Archive 파일은 PRD 참조 목록에서 제외
9. IA/events-index.yml은 자동 집계만 (직접 수정 금지)

---

## FAQ (리뷰어가 궁금할 수 있는 것들)

### Q: 기존 `/tasks` 커맨드에 영향이 있나요?

**A: 없습니다.** `/tasks`는 project-task-manager가 처리하며, 이 PR에서 해당 로직은 변경하지 않았습니다.

### Q: workflow-enforced.sh 수정이 기존 코드 워크플로우에 영향을 주나요?

**A: 아닙니다.** stdin에서 사용자 입력을 읽어 `/pm`으로 시작하는 경우에만 `exit 0`으로 스킵합니다. 그 외 모든 입력은 기존 4-Phase 프로토콜이 그대로 실행됩니다.

### Q: pm-config.yml이 기존 하드코딩된 ID를 대체하나요?

**A: 아닙니다.** 기존 ID 테이블은 그대로 유지합니다. pm-config.yml은 새로 추가된 pm-planner가 참조하는 설정이며, 기존 파일에는 "값 변경 시 pm-config.yml 우선 수정" 안내만 추가했습니다.

### Q: PM-DOCS/ 폴더가 Git에 포함되나요?

**A: 네.** 기획 산출물(PRD, Milestone 등)이 코드와 함께 버전 관리됩니다. `PM-DOCS/workflow/references/` 하위의 외부 저장소 빌드 산출물만 `.gitignore`에서 제외됩니다.

### Q: 이 시스템을 사용하지 않으면?

**A: 아무 영향 없습니다.** `/pm`을 호출하지 않으면 pm-planner Agent는 실행되지 않고, PM-DOCS/에 파일도 생성되지 않습니다. 기존 워크플로우와 완전히 독립적입니다.
