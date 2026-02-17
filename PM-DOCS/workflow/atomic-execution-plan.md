# PM 워크플로우 통합 구현 - 원자 단위 실행 계획

## Context

**목적**: `/pm` 커맨드 기반의 PM 기획 워크플로우를 Readly 프로젝트에 구현한다.
**문제**: 현재 PM 기획(PRD 작성, Milestone/Feature/Issue 관리)이 체계화되어 있지 않아 기획-개발 파이프라인이 단절되어 있다.
**방법**: BMAD-METHOD 패턴을 차용하여 pm-planner Agent + planning Skill + PM-DOCS 구조를 구축하고, GitHub Issue 자동 분해까지 이어지는 엔드투엔드 워크플로우를 구현한다.

### 사용자 결정 사항

- 폴더명: `Context Output` (공백 유지, 기존 폴더 그대로)
- Feature 폴더: `feature#{N}_{name}/` 형식
- changelog: 전역 `Planning/changelog.md` 1개만 유지 (Feature 개별 changelog 없음)
- BMAD: 원문 최대 활용 (Persona, Facilitation Principles, 단계별 가이드 원문 보존)

---

## Phase 0: 사전 준비 (기존 시스템 수정)

### 0-1. pm-config.yml 중앙 설정 파일 생성

> 의존성: 없음 | 리스크: LOW

**0-1-A. 기존 하드코딩 위치 확인 (읽기 전용)**

- `.claude/agents/project-task-manager.md` 45-74행의 GitHub Project ID 테이블 확인
- `.claude/skills/task-management/SKILL.md` 43-81행의 동일 ID 테이블 확인
- `.claude/hooks/task-loader.sh` 10행의 `gh project item-list 4 --owner overdunenet` 확인

**0-1-B. pm-config.yml 파일 생성**

- 경로: `.claude/skills/planning/pm-config.yml`
- 내용: 구현 계획서 1-7 섹션의 YAML 그대로 사용
  - `github.project.id`, `github.project.number`, `github.fields.*`
  - `labels.feature_prefix: "feature:"`
  - `paths.*` (Context Output 경로는 공백 포함: `"PM-DOCS/Context Output"`)
  - `bmad.version`, `bmad.referenced_workflows`

**0-1-C. task-management SKILL.md에서 ID 참조 변경**

- 파일: `.claude/skills/task-management/SKILL.md`
- 변경: 하드코딩된 Project ID, Field ID, Option ID 테이블을 `pm-config.yml 참조` 안내 문구로 교체
- 기존 값 자체는 동일 (동작 변경 없음)

**0-1-D. project-task-manager agent에서 ID 참조 변경**

- 파일: `.claude/agents/project-task-manager.md`
- 변경: 하드코딩된 ID 테이블 → pm-config.yml 참조 안내 추가 (기존 테이블은 백업 주석으로 유지)

**0-1-E. 검증**

- `pm-config.yml` YAML 파싱 성공 확인
- 기존 `/tasks` Skill 실행 → 태스크 목록 정상 표시 확인

---

### 0-2. workflow-enforced.sh /pm 예외 추가

> 의존성: 없음 | 리스크: LOW

**0-2-A. 현재 hook 동작 분석**

- 파일: `.claude/hooks/workflow-enforced.sh`
- 현재: 모든 UserPromptSubmit에 4-Phase 코드 워크플로우 출력

**0-2-B. /pm 예외 조건 추가**

- 위치: `workflow-enforced.sh` 스크립트 최상단 (첫 echo 전)
- 추가 코드:
  ```bash
  # /pm 기획 워크플로우 실행 시 코드 4-Phase 스킵
  INPUT=$(cat)
  if echo "$INPUT" | grep -qE '^\s*/pm(\s|$)'; then
    exit 0
  fi
  # 나머지 기존 코드에 stdin 재전달
  echo "$INPUT" | ...
  ```
- 주의: stdin은 한 번만 읽을 수 있으므로 변수에 저장 후 재활용 패턴 적용

**0-2-C. 검증**

- `/pm` 입력 시 4-Phase 프로토콜 미출력 확인
- 일반 코드 작업 시 4-Phase 정상 출력 확인

---

### 0-3. project-task-manager 역할 경계 명시

> 의존성: 없음 | 리스크: LOW

**0-3-A. 역할 경계 섹션 작성**

- 파일: `.claude/agents/project-task-manager.md`
- 추가 위치: `<role>` 섹션 하단 또는 `<constraints>` 섹션
- 추가 내용:

  ```markdown
  ## 역할 경계 (pm-planner와의 구분)

  ### 이 Agent가 담당하는 작업

  - 개발 태스크 단건 CRUD (조회/생성/상태변경/우선순위변경/삭제)
  - Status/Priority 관리
  - GitHub Project #4 항목 직접 조작

  ### /pm 워크플로우(pm-planner)가 담당하는 작업

  - Feature Issue 일괄 생성 (PRD → Issue 분해)
  - `feature:{name}` 라벨 자동 생성/관리
  - Milestone ↔ Feature ↔ Issue 계층 연결
  - Feature 상태 자동 전파

  ### pm-planner 호출 시

  - pm-planner의 지시에 따라 GitHub Issue/Project 조작 실행
  - 단, 기존 CRUD API는 그대로 유지
  ```

**0-3-B. 검증**

- 기존 `/tasks` 정상 작동 확인
- 역할 경계 섹션 존재 확인

---

### 0-4. /pm Skill 디렉토리 준비

> 의존성: 없음 | 리스크: LOW

**0-4-A. planning Skill 디렉토리 생성**

- 경로: `.claude/skills/planning/` (디렉토리만 생성)
- `skill-forced.sh`가 자동 스캔하므로 settings.json 수정 불필요

**0-4-B. 검증**

- `skill-forced.sh`가 `.claude/skills/planning/SKILL.md` 경로를 스캔하는 패턴 확인
  (파일이 없으면 스킵하므로 에러 없음)

---

## Phase 1: 기반 구조 구축

### 1-1. PM-DOCS 폴더 구조 정비

> 의존성: 없음 | 리스크: LOW

**1-1-A. 기존 폴더 구조 확인**

- 현재 존재: `PM-DOCS/Context Output/`, `PM-DOCS/Context Output/Archive/`, `PM-DOCS/Planning/`, `PM-DOCS/Planning/Feature_PRD/`, `PM-DOCS/Planning/IA/`, `PM-DOCS/Planning/Roadmap/`

**1-1-B. 누락 폴더/파일 생성**

- `PM-DOCS/Planning/templates/` 디렉토리 생성
- `PM-DOCS/Planning/IA/screen-index.yml` 초기 파일 생성 (빈 YAML 헤더)
- `PM-DOCS/Planning/IA/IA-table.md` 초기 파일 생성 (빈 테이블)
- `PM-DOCS/Planning/events-index.yml` 초기 파일 생성 (빈 YAML 헤더)
- `PM-DOCS/Planning/changelog.md` 초기 파일 생성 (Keep a Changelog 헤더)

**1-1-C. .gitkeep 파일 생성**

- `PM-DOCS/Context Output/.gitkeep` (Archive 제외 - 이미 폴더 존재)
- `PM-DOCS/Planning/Feature_PRD/.gitkeep`
- `PM-DOCS/Planning/Roadmap/.gitkeep`
- `PM-DOCS/Planning/templates/.gitkeep` (곧 템플릿으로 대체)

**1-1-D. 검증**

- `Definition of PM-DOCS folder.md`의 구조와 일치하는지 비교
- 모든 폴더 접근 가능 확인

---

### 1-2. PRD 템플릿 생성

> 의존성: 1-1 | 리스크: LOW

**1-2-A. PRD-TEMPLATE.md 파일 생성**

- 경로: `PM-DOCS/Planning/templates/PRD-TEMPLATE.md`
- 내용: 구현 계획서 STEP 3-A의 11섹션 템플릿 그대로
  - YAML frontmatter: feature_name, milestone, status, created_at, updated_at, author, label, progress (phase_a~e + issue_decomposed)
  - 본문 11섹션: 개요, 목표&성공지표, 유저스토리, 유저플로우, 화면정의, 이벤트정의, 수용기준, 기술요건, 엣지케이스, 우선순위&스코프, 참조문서
- 변경점: Feature_PRD 내 changelog.md 언급 제거 (Q9 결정)

**1-2-B. 검증**

- YAML frontmatter 파싱 성공
- 11개 섹션 완전성 확인

---

### 1-3. screens.yml 스키마 템플릿

> 의존성: 1-1 | 리스크: LOW

**1-3-A. screens-template.yml 파일 생성**

- 경로: `PM-DOCS/Planning/templates/screens-template.yml`
- 내용: 구현 계획서 1-3 스키마 그대로
  ```yaml
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

**1-3-B. 검증**

- YAML 문법 유효성 확인

---

### 1-4. events.yml 스키마 템플릿

> 의존성: 1-1 | 리스크: LOW

**1-4-A. events-template.yml 파일 생성**

- 경로: `PM-DOCS/Planning/templates/events-template.yml`
- 내용: 구현 계획서 1-4 Mixpanel 스키마 그대로

**1-4-B. 검증**

- YAML 문법 유효성 확인

---

### 1-5. changelog.md 양식 생성

> 의존성: 1-1 | 리스크: LOW

**1-5-A. changelog-template.md 파일 생성**

- 경로: `PM-DOCS/Planning/templates/changelog-template.md`
- 내용: Keep a Changelog 형식

**1-5-B. Planning/changelog.md 초기화**

- 경로: `PM-DOCS/Planning/changelog.md`
- 내용: changelog-template.md와 동일한 초기 형식 + "PM 워크플로우 시스템 초기화" 첫 항목

---

### 1-6. Milestone 파일 양식 생성

> 의존성: 1-1 | 리스크: LOW

**1-6-A. milestone-template.md 파일 생성**

- 경로: `PM-DOCS/Planning/templates/milestone-template.md`
- 내용: 구현 계획서 1-6 YAML frontmatter + MD body 그대로

**1-6-B. 검증**

- frontmatter 파싱 성공 확인

---

### 1-7. screen-index.yml / events-index.yml 초기 파일

> 의존성: 1-1, 1-3, 1-4 | 리스크: LOW

**1-7-A. screen-index.yml 초기화**

- 경로: `PM-DOCS/Planning/IA/screen-index.yml`
- 내용:
  ```yaml
  # 전역 화면 카탈로그 (자동 집계 - 직접 수정 금지)
  # 각 Feature_PRD/*/screens.yml에서 자동 통합됨
  last_updated: 'YYYY-MM-DD'
  total_screens: 0
  screens: []
  ```

**1-7-B. IA-table.md 초기화**

- 경로: `PM-DOCS/Planning/IA/IA-table.md`
- 내용:

  ```markdown
  # Information Architecture Table

  > 자동 생성 문서 - 직접 수정 금지
  > 원본: screen-index.yml

  | Feature                 | 화면 ID | 화면명 | Route | 설명 |
  | ----------------------- | ------- | ------ | ----- | ---- |
  | (아직 등록된 화면 없음) |         |        |       |      |
  ```

**1-7-C. events-index.yml 초기화**

- 경로: `PM-DOCS/Planning/events-index.yml`
- 내용:
  ```yaml
  # 전체 이벤트 통합본 (자동 집계 - 직접 수정 금지)
  # 각 Feature_PRD/*/events.yml에서 자동 통합됨
  last_updated: 'YYYY-MM-DD'
  total_events: 0
  events: []
  ```

---

## Phase 2: BMAD-METHOD 패턴 통합

### 2-1. PM Agent 정의 (pm-planner.md)

> 의존성: 1-7 (pm-config.yml) | 리스크: LOW

**2-1-A. Agent frontmatter 작성**

- 경로: `.claude/agents/pm-planner.md`
- frontmatter:
  ```yaml
  ---
  name: pm-planner
  description: PM 기획 워크플로우 전담. PRD 작성, Milestone 관리, Issue 분해, CIS 워크플로우 실행.
  keywords:
    [PRD, 기획, Feature, Milestone, Issue, /pm, CIS, 제품기획, 워크플로우]
  model: opus
  color: violet
  ---
  ```

**2-1-B. Agent 본문 구조 설계** (XML 태그 패턴 - code-writer.md 참조)

- `<role>`: BMAD PM Agent persona 원문 통합
  - Role, Identity, Communication Style, Core Principles
  - "Product Manager specializing in collaborative PRD creation..."
  - "Asks 'WHY?' relentlessly like a detective on a case..."
- `<reference>`: 참조 파일 경로
  - `planning/SKILL.md` (메인 Skill)
  - `planning/prd-workflow.md` (PRD Phase A-E)
  - `planning/cis-guide.md` (CIS S1-S5)
  - `planning/pm-config.yml` (중앙 설정)
  - `planning/prd-template.md` (PRD 작성용 템플릿 가이드)
- `<instructions>`:
  - /pm 호출 시 3가지 메뉴 분기 (New Task / Edit Task / Context Making)
  - AskUserQuestion으로 선택지 제공
  - 각 분기별 워크플로우 실행 지시
  - BMAD의 A/P/C 메뉴를 AskUserQuestion options로 대체
  - Facilitator 대화 패턴 적용 ("NEVER generate content without user input")
- `<constraints>`:
  - 9개 불변 규칙 전체 포함
  - Feature는 반드시 Milestone에 소속
  - Bug/Feature 라벨 상호 배타
  - Feature 상태 자동 전파만 허용
  - IA/events-index 직접 수정 금지
  - Archive 파일 PRD 참조 제외
- `<output_format>`:
  - PRD: `PM-DOCS/Planning/Feature_PRD/feature#{N}_{name}/PRD.md`
  - Milestone: `PM-DOCS/Planning/Roadmap/milestone-{NNN}.md`
  - CIS 산출물: `PM-DOCS/Context Output/{workflow}_{date}_{topic}.md`

**2-1-C. BMAD 원문 통합 섹션들**

- Persona & Principles 원문 (PM Agent)
- Success Criteria Framework (Step 3)
- Facilitation Principles 원문 (4개: Problem Solving, Design Thinking, Innovation, Storytelling)
- Checkpoint Protocol 원문 (A/P/C → AskUserQuestion 매핑)
- Smart Scope Negotiation 원문 (MVP/Growth/Vision)

**2-1-D. 검증**

- Agent가 Task tool로 호출 가능한지 확인
- skill-forced.sh가 agent 목록에 포함하는지 확인

---

### 2-2. PM Skill 정의 (SKILL.md)

> 의존성: 2-1 | 리스크: LOW

**2-2-A. Skill frontmatter 작성**

- 경로: `.claude/skills/planning/SKILL.md`
- frontmatter:
  ```yaml
  ---
  name: PM-Planning
  description: PM 기획 워크플로우. /pm 커맨드로 Milestone/Feature/Issue 관리, PRD 작성, CIS 워크플로우 실행.
  keywords: [PM, 기획, PRD, Milestone, Feature, Issue, CIS, /pm]
  estimated_tokens: ~2000
  user-invocable: true
  ---
  ```

**2-2-B. Skill 본문 구조**

- `/pm` 진입점 설명
- 3가지 메뉴 라우팅:
  1. **New Task** → Milestone / Feature / Issue 분기
  2. **Edit Task** → Milestone 수정 / Feature PRD 수정 / Issue 재배정
  3. **Context Making** → CIS 워크플로우 5종
- 각 분기별 서브파일 참조 경로
- pm-config.yml 참조 방법
- 불변 규칙 9개 요약

**2-2-C. 검증**

- `skill-forced.sh`가 planning Skill을 자동 감지하는지 확인
- frontmatter 6행 출력 정상 확인

---

### 2-3. PRD 워크플로우 서브파일 (prd-workflow.md)

> 의존성: 2-2, 1-2 | 리스크: MEDIUM

**2-3-A. prd-workflow.md 파일 생성**

- 경로: `.claude/skills/planning/prd-workflow.md`

**2-3-B. Phase A: 컨텍스트 수집**

- A1: Milestone 선택
  - `PM-DOCS/Planning/Roadmap/` 스캔 → 기존 Milestone 목록
  - AskUserQuestion으로 선택 또는 "새 Milestone 생성" 분기
  - Milestone 없으면 생성 유도 (불변 규칙 #1)
- A2: CIS 산출물 참조 선택
  - `PM-DOCS/Context Output/` 스캔 (Archive/ 제외)
  - 파일 생성일 기준 30일 이내만 표시 (시나리오 #4 대응)
  - AskUserQuestion으로 복수 선택 가능, 스킵 가능

**2-3-C. Phase B: 핵심 요구사항 수집** (BMAD Step 2-3 패턴 적용)

- B1: Feature명 + 한 줄 요약
  - 라벨명 자동 미리보기: `feature:{입력명}`
  - Feature명 중복 검사 (기존 Feature_PRD 폴더 스캔 + gh label list)
- B2: 목표 & 성공 지표
  - CIS 산출물 있으면 → 초안 자동 제안 → 수정/승인
  - BMAD Success Criteria Framework 적용 (User/Business/Technical)
  - SMART 기준 강제 ("vague → specific" 챌린지 패턴)
- B3: 유저스토리
  - "~로서, ~하고 싶다, ~하기 위해" 형식
  - CIS 기반 초안 제안 가능
- B4: 유저 플로우
  - B3 기반 → 진입점→핵심행동→완료/이탈

**2-3-D. Phase C: 상세 정의**

- C1: 화면 정의 (→ screens.yml)
  - B4 유저 플로우에서 식별된 화면
  - 기존 screen-index.yml 중복 검사 (화면 ID)
  - screens-template.yml 기반 YAML 생성
- C2: 이벤트 정의 (→ events.yml)
  - B4+C1에서 트래킹 필요 행동 식별
  - events-template.yml 기반 YAML 생성
- C3: 수용 기준 (AC)
  - B3 유저스토리별 Given-When-Then
  - 유저스토리 ↔ AC 매핑 완전성 체크

**2-3-E. Phase D: 기술 & 엣지 케이스**

- D1: 기술 요건
  - CIS+B/C 단계 정보 기반 자동 제안
  - API, DB, 외부 의존성 분류
- D2: 엣지 케이스 + 우선순위
  - MVP 스코프 vs 후속 개선 분류

**2-3-F. Phase E: 검증 & 저장**

- E1: 일관성 검증
  - 유저스토리 ↔ AC 매핑 완전성
  - 화면 ↔ 유저 플로우 참조 일관성
  - 이벤트 ↔ 화면 연결 유효성
  - 화면 ID 기존 인덱스 중복 검사 (시나리오 #8)
  - 누락 항목 체크
- E2: 산출물 저장
  - `Feature_PRD/feature#{N}_{name}/` 폴더 생성 (N은 자동 증분)
  - PRD.md, screens.yml, events.yml 저장 (changelog.md 미생성 - Q9)
  - PRD.md frontmatter progress 필드 업데이트
  - screen-index.yml 자동 집계
  - events-index.yml 자동 집계
  - Planning/changelog.md에 파일 단위 변경 기록
- E3: Issue 분해 분기
  - "GitHub Issue로 분해할까요?" → AskUserQuestion
  - Yes → Phase 5-1 Issue 자동 생성
  - No → PRD만 저장 후 완료

**2-3-G. 임시 저장 메커니즘** (시나리오 #6 대응)

- 각 Phase 완료 시 PRD.md 부분 저장 (status: "draft")
- progress frontmatter로 완료된 Phase 추적
- 다음 세션에서 `/pm → Edit Task → Feature` → 미완료 PRD 감지 → 이어서 작성

**2-3-H. 검증**

- 더미 Feature로 Phase A-E 전체 플로우 시뮬레이션

---

### 2-4. prd-template.md (Skill 서브파일)

> 의존성: 1-2 | 리스크: LOW

**2-4-A. prd-template.md 파일 생성**

- 경로: `.claude/skills/planning/prd-template.md`
- 내용: PRD 작성 시 pm-planner가 참조하는 가이드
  - PRD 11섹션별 작성 지침
  - 각 섹션의 필수/선택 필드
  - BMAD의 "facilitator, not generator" 원칙 적용 지침
  - SMART 기준 적용 가이드
  - 유저스토리 형식 가이드
  - Given-When-Then AC 작성 가이드

---

### 2-5. CIS 가이드 서브파일 (cis-guide.md)

> 의존성: 2-2 | 리스크: MEDIUM

**2-5-A. cis-guide.md 파일 생성**

- 경로: `.claude/skills/planning/cis-guide.md`

**2-5-B. S1-S5 상황 선택 로직** (CIS-workflow mapping logic.md 기반)

- AskUserQuestion으로 상황 선택지 제시
- 자동 추천 로직 포함

**2-5-C. 5개 CIS 워크플로우 상세 가이드** (BMAD 원문 최대 활용)

1. **Brainstorming 워크플로우**
   - BMAD brainstorming-coach.agent.yaml 원문 활용
   - 10-Step 프로세스: Context→Warm-up→Rapid Ideation→Theme Clustering→Challenge→Combine→Evaluate→Action Plan→Session Review→Output
   - 기법: SCAMPER, Reverse Brainstorming, Forced Connections, Random Stimulus
   - 산출물: `PM-DOCS/Context Output/brainstorming_{date}_{topic}.md`

2. **Design Thinking 워크플로우**
   - BMAD design-thinking-coach.agent.yaml 원문 활용
   - 7-Step 프로세스: Context→Empathize→Define→Ideate→Prototype→Test→Iterate
   - 핵심 원칙: "Keep users at the center of every decision"
   - 산출물: `PM-DOCS/Context Output/design-thinking_{date}_{topic}.md`

3. **Problem Solving 워크플로우**
   - BMAD creative-problem-solver.agent.yaml 원문 활용
   - 8-Step 프로세스: Define→Diagnose→Root Cause→Forces→Solutions→Evaluate→Implement→Monitor
   - 기법: Five Whys, Fishbone, TRIZ, Lateral Thinking
   - 산출물: `PM-DOCS/Context Output/problem-solving_{date}_{topic}.md`

4. **Innovation Strategy 워크플로우**
   - BMAD innovation-strategist.agent.yaml 원문 활용
   - 9-Step 프로세스: Context→Market→Current Model→Disruption→Opportunities→Options→Recommendation→Roadmap→Metrics
   - 기법: TAM/SAM/SOM, Five Forces, BMC, Blue Ocean, JTBD
   - 산출물: `PM-DOCS/Context Output/innovation-strategy_{date}_{topic}.md`

5. **Storytelling 워크플로우**
   - BMAD storyteller.agent.yaml 원문 활용
   - 10-Step 프로세스: Context→Framework→Elements→Arc→Hook→Narrative→Variations→Guidelines→Refinement→Output
   - 프레임워크: Hero's Journey, Pixar Story Spine, Brand Story, Pitch Narrative, Data Storytelling
   - 산출물: `PM-DOCS/Context Output/storytelling_{date}_{topic}.md`

**2-5-D. 검증**

- 각 CIS 워크플로우 선택 시 올바른 가이드 제공 확인

---

## Phase 3: 핵심 워크플로우 구현

### 3-1. /pm Skill 진입점 구현

> 의존성: Phase 2 전체 | 리스크: LOW

**3-1-A. SKILL.md 메인 라우팅 완성**

- 파일: `.claude/skills/planning/SKILL.md`
- `/pm` 입력 시 AskUserQuestion으로 3개 메뉴 표시:
  1. New Task - "새로운 일감 생성 (Milestone/Feature/Issue)"
  2. Edit Task - "기존 일감 수정"
  3. Context Making - "CIS 워크플로우로 컨텍스트 생성"
- 각 선택에 따른 서브 분기 로직

**3-1-B. New Task 서브 메뉴**

- AskUserQuestion으로 3개 선택지:
  1. Milestone - "마일스톤 생성"
  2. Feature - "피쳐 기획 (PRD 작성)"
  3. Issue - "GitHub Issue 생성 (Bug/Enhancement)"

**3-1-C. 검증**

- `/pm` → 3개 선택지 표시 → 각 분기 정상 이동 확인

---

### 3-2. Milestone 워크플로우

> 의존성: 3-1, 1-6 | 리스크: LOW

**3-2-A. Milestone 생성 플로우 구현**

- SKILL.md의 Milestone 섹션에 구현
- 단계:
  1. 마일스톤 번호 자동 채번 (기존 Roadmap/ 파일 스캔 → 최대 N+1)
  2. AskUserQuestion으로 메타데이터 입력 유도:
     - 마일스톤 목표
     - 기간 (시작일~종료일)
  3. milestone-template.md 기반 파일 생성
  4. `PM-DOCS/Planning/Roadmap/milestone-{NNN}.md` 저장
  5. Planning/changelog.md에 기록
  6. "바로 피쳐 기획할까요?" AskUserQuestion
     - Yes → Feature 워크플로우 (3-3)
     - No → 완료

**3-2-B. 검증**

- Milestone 생성 → Roadmap/ 파일 생성 + changelog 기록 확인

---

### 3-3. Feature 워크플로우 (5-Phase)

> 의존성: 3-1, 3-2, 1-2~1-5 | 리스크: HIGH

**3-3-A. Feature 진입점**

- Milestone 존재 필수 검증 (불변 규칙 #1)
  - Milestone 없으면: "먼저 Milestone을 생성해주세요" → Milestone 생성 유도
- Feature명 중복 검사 (Feature_PRD/ 폴더 스캔)

**3-3-B. Phase A-E 실행**

- prd-workflow.md (2-3)의 전체 플로우 실행
- 각 Phase 완료 시 AskUserQuestion으로 진행/수정/중단 선택 (BMAD A/P/C 패턴)
  - Continue → 다음 Phase
  - Adjust → 현재 Phase 재작업
  - Pause → 임시 저장 후 중단

**3-3-C. Feature 폴더 네이밍**

- `feature#{N}_{name}/` 형식 (N은 자동 증분)
- 기존 Feature_PRD/ 폴더 스캔 → 최대 N + 1
- name은 kebab-case 변환

**3-3-D. 검증**

- 더미 Feature 전체 플로우 → PRD.md + screens.yml + events.yml 생성 확인
- changelog 기록 확인
- screen-index.yml / events-index.yml 자동 집계 확인

---

### 3-4. Issue 워크플로우 (Bug/Enhancement)

> 의존성: 3-1 | 리스크: MEDIUM

**3-4-A. Issue 유형 선택**

- AskUserQuestion으로 Bug / Enhancement 분기

**3-4-B. Bug Issue 생성**

- GitHub Issue 생성 (gh issue create)
- 라벨: `bug` (고정)
- 마일스톤: 없음 (계층 밖 독립)
- Bug + Feature 라벨 동시 부여 차단 (불변 규칙 #2)
- "지금 작업 시작할까요?" 분기 (In progress / Backlog)

**3-4-C. Enhancement Issue 생성**

- GitHub Issue 생성
- Feature 목록 로드 → AskUserQuestion으로 1개 선택 (복수 선택 불가 - 불변 규칙 #7)
  - "unassigned" 선택지도 제공
- 라벨: 선택한 Feature의 `feature:{name}` 라벨
- 마일스톤: 해당 Feature의 상위 Milestone
- title 기반 중복 검사 (`gh issue list --search`)
- Project #4 등록 (project-task-manager 연동)

**3-4-D. 검증**

- Bug: Issue 생성 + `bug` 라벨 + 마일스톤 없음 확인
- Enhancement: Issue 생성 + `feature:{name}` 라벨 + 마일스톤 배정 확인

---

### 3-5. Edit Task 워크플로우

> 의존성: 3-2, 3-3, 3-4 | 리스크: MEDIUM

**3-5-A. Edit Task 메뉴**

- AskUserQuestion으로 3개 선택지:
  1. Milestone 수정
  2. Feature PRD 수정
  3. Issue 재배정

**3-5-B. Milestone 수정**

- 기존 Milestone 목록 표시 → 선택
- 수정 가능 항목: 목표, 기간, 상태(수동만 - 불변 규칙 #5)
- changelog 자동 기록

**3-5-C. Feature PRD 수정**

- 기존 Feature 목록 표시 → 선택
- 미완료 PRD 감지 시 이어서 작성 분기
- 수정 후 changelog 자동 기록
- Feature 상태 수동 변경 차단 (불변 규칙 #6 - 자동 전파만)

**3-5-D. Issue 재배정**

- 기존 Issue 목록 표시 → 선택
- Feature 재배정 (라벨 변경)
- 마일스톤 자동 업데이트 (Feature의 상위 Milestone)
- 기존 수동 Issue도 Feature 계층 편입 가능 (시나리오 #10)

**3-5-E. Feature Archive (소프트 삭제)**

- Feature 삭제 시 → status: "archived"
- 하위 Issue의 `feature:{name}` 라벨 제거
- 마일스톤은 유지

**3-5-F. 검증**

- Milestone 상태 수동 변경 성공 확인
- Feature PRD 수정 → changelog 기록 확인
- Issue 재배정 → 라벨/마일스톤 변경 확인

---

## Phase 4: CIS 통합

### 4-1. Context Making 진입점

> 의존성: 3-1, 2-5 | 리스크: LOW

**4-1-A. SKILL.md Context Making 섹션 완성**

- `/pm → Context Making` 선택 시 cis-guide.md 로드
- S1-S5 상황별 자동 추천 로직 적용
- 5개 워크플로우 선택지 표시

**4-1-B. 검증**

- 5개 워크플로우 선택지 정상 표시 확인

---

### 4-2. CIS 워크플로우 실행 로직

> 의존성: 4-1 | 리스크: MEDIUM

**4-2-A. 각 CIS 워크플로우 실행 구현**

- cis-guide.md의 5개 워크플로우 가이드에 따라 대화형 실행
- 각 워크플로우 완료 시 산출물 `PM-DOCS/Context Output/` 에 저장
- 파일명 규칙: `{workflow}_{YYYY-MM-DD}_{topic}.md`

**4-2-B. 검증**

- 각 CIS 워크플로우 실행 → Context Output/ 파일 생성 확인

---

### 4-3. CIS → PRD 참조 연결

> 의존성: 4-2, 3-3 | 리스크: LOW

**4-3-A. Phase A2 CIS 참조 로직 완성**

- prd-workflow.md Phase A2에서 CIS 산출물 선택
- PRD §11 참조 문서에 경로 링크 삽입
- Archive 파일 필터링 (30일 기준)

**4-3-B. 검증**

- CIS 산출물 선택 → PRD 참조 문서에 경로 삽입 확인

---

## Phase 5: 자동화 연결

### 5-1. GitHub Issue 자동 생성 (PRD 분해)

> 의존성: 3-3, 3-4 | 리스크: HIGH

**5-1-A. PRD → Issue 분해 로직**

- PRD의 유저스토리/AC 기반 Issue 분해
- 각 유저스토리 → 1개 Issue (또는 기술 요건별 분해)
- Sub-Issue 생성 (AC 단위)
- title 기반 중복 검사 (`gh issue list --search`)

**5-1-B. Issue 생성 실행**

- `gh issue create` 명령
- 라벨: `feature:{name}` 자동 부여
- 마일스톤: Feature의 상위 Milestone 자동 부여
- Project #4 등록 (project-task-manager 연동)
- 생성된 Issue 번호를 PRD.md에 역참조 기록

**5-1-C. 검증**

- PRD → Issue 분해 실행 → Issue 목록 확인
- 중복 검사 동작 확인

---

### 5-2. Feature 라벨 자동 생성

> 의존성: 3-3 | 리스크: LOW

**5-2-A. 라벨 생성 로직**

- Feature 생성 시 `gh label create "feature:{name}" --color ...`
- 이미 존재하면 스킵

**5-2-B. 검증**

- `gh label list` 에서 `feature:{name}` 존재 확인

---

### 5-3. Feature 상태 자동 전파

> 의존성: 5-1 | 리스크: MEDIUM

**5-3-A. 상태 계산 로직**

- `gh issue list --label "feature:{name}"` 으로 하위 Issue 상태 조회
- 규칙:
  - Issue 0개 → backlog
  - 1개라도 done이 아닌 Issue → ongoing (reopen 포함 - 시나리오 #3)
  - 전부 done → done
- PRD.md frontmatter status 업데이트
- Milestone 파일의 Feature 목록 상태 업데이트

**5-3-B. 트리거**

- Edit Task 실행 시 수동 트리거
- (v2) GitHub Actions로 자동 트리거 고려

**5-3-C. 검증**

- Issue 상태 변경 → Feature 상태 재계산 확인

---

### 5-4. IA/screen-index.yml 자동 집계

> 의존성: 3-3 | 리스크: LOW

**5-4-A. 집계 로직**

- `PM-DOCS/Planning/Feature_PRD/*/screens.yml` 전체 스캔
- 모든 screens.yml 통합 → screen-index.yml 갱신
- screen-index.yml 기반 → IA-table.md 재렌더링
- 화면 ID 중복 검사 (Feature 간 ID 충돌 감지)

**5-4-B. 트리거**

- Feature PRD 저장 시 (Phase E2)
- Feature PRD 수정 시 (Edit Task)

**5-4-C. 검증**

- 2개+ Feature의 screens.yml → screen-index.yml 정확성 확인

---

### 5-5. events-index.yml 자동 집계

> 의존성: 3-3 | 리스크: LOW

**5-5-A. 집계 로직**

- `PM-DOCS/Planning/Feature_PRD/*/events.yml` 전체 스캔
- 모든 events.yml 통합 → events-index.yml 갱신

**5-5-B. 검증**

- 2개+ Feature의 events.yml → events-index.yml 정확성 확인

---

### 5-6. 라벨/마일스톤 자동 배정

> 의존성: 5-1, 5-2 | 리스크: MEDIUM

**5-6-A. 자동 배정 로직**

- Issue 생성 시 `gh issue edit` 로 라벨/마일스톤 배정
- Feature 라벨 Issue만 마일스톤 부여 (불변 규칙 #3)
- Bug Issue에 마일스톤 배정 차단 (불변 규칙 #3)

**5-6-B. 검증**

- labeler.yml 브랜치 라벨과 충돌 없는지 확인

---

## Phase 6: 안전장치 & 검증

### 6-1. 중복 검사 로직

> 의존성: 5-1 | 리스크: LOW

**6-1-A. Feature명 중복 검사**

- Feature_PRD/ 폴더 스캔 + gh label list
- 중복 시 경고 + 기존 Feature 편집 유도

**6-1-B. Issue title 중복 검사**

- `gh issue list --search "{title}"` 로 검색
- 유사 Issue 존재 시 경고

---

### 6-2. Feature ↔ Milestone 필수 소속 검증

> 의존성: 3-2, 3-3 | 리스크: LOW

**6-2-A. Feature 생성 시 Milestone 검증**

- Milestone 미선택 차단
- Enhancement Issue 생성 시 Feature 미선택 경고 (unassigned 허용)

---

### 6-3. Archive 30일 자동 이동

> 의존성: 1-1 | 리스크: LOW

**6-3-A. 아카이빙 로직**

- `/pm` 실행 시 Context Output/ 파일 생성일 확인
- 30일 경과 파일 → Archive/ 이동 제안
- (v2) GitHub Actions 자동화 고려

---

### 6-4. PRD 중단 시 임시 저장

> 의존성: 3-3 | 리스크: LOW

**6-4-A. 임시 저장 메커니즘**

- 각 Phase 완료 시 PRD.md 부분 저장
- frontmatter status: "draft", progress 필드로 완료 Phase 추적
- Edit Task에서 미완료 PRD 자동 감지

---

### 6-5. 불변 규칙 검증 테스트 (수동)

> 의존성: Phase 0-5 전체 | 리스크: LOW

9개 시나리오 수동 테스트:

1. Milestone 없이 Feature 생성 → 차단
2. Bug+Feature 라벨 동시 부여 → 차단
3. Bug Issue에 마일스톤 배정 → 차단
4. Bug Issue에 Feature 계층 소속 → 비소속
5. Milestone 상태 자동 변경 시도 → 차단
6. Feature 상태 수동 변경 시도 → 차단
7. Enhancement에 Feature 복수 선택 → 단일 강제
8. Archive 파일 PRD 참조 → 목록 제외
9. IA/events-index 직접 수정 → 경고

---

### 6-6. 기존 시스템 통합 테스트 (수동)

> 의존성: Phase 0-5 전체 | 리스크: MEDIUM

6개 통합 시나리오:

1. /pm 실행 후 /tasks 정상 작동
2. Feature 생성 후 labeler.yml 정상 작동
3. Issue 생성 후 Project #4 등록
4. PR 생성 후 context-gen.yml 정상
5. skill-forced.sh가 planning Skill 인식
6. workflow-enforced.sh가 /pm 예외 적용

---

## 파일 생성/수정 요약

### 신규 생성 (16개)

| #   | 경로                                               | Phase |
| --- | -------------------------------------------------- | ----- |
| 1   | `.claude/skills/planning/pm-config.yml`            | 0-1   |
| 2   | `.claude/agents/pm-planner.md`                     | 2-1   |
| 3   | `.claude/skills/planning/SKILL.md`                 | 2-2   |
| 4   | `.claude/skills/planning/prd-workflow.md`          | 2-3   |
| 5   | `.claude/skills/planning/prd-template.md`          | 2-4   |
| 6   | `.claude/skills/planning/cis-guide.md`             | 2-5   |
| 7   | `PM-DOCS/Planning/templates/PRD-TEMPLATE.md`       | 1-2   |
| 8   | `PM-DOCS/Planning/templates/screens-template.yml`  | 1-3   |
| 9   | `PM-DOCS/Planning/templates/events-template.yml`   | 1-4   |
| 10  | `PM-DOCS/Planning/templates/changelog-template.md` | 1-5   |
| 11  | `PM-DOCS/Planning/templates/milestone-template.md` | 1-6   |
| 12  | `PM-DOCS/Planning/IA/screen-index.yml`             | 1-7   |
| 13  | `PM-DOCS/Planning/IA/IA-table.md`                  | 1-7   |
| 14  | `PM-DOCS/Planning/events-index.yml`                | 1-7   |
| 15  | `PM-DOCS/Planning/changelog.md`                    | 1-5   |
| 16  | `PM-DOCS/Planning/templates/` (디렉토리)           | 1-1   |

### 기존 수정 (3개)

| #   | 경로                                      | Phase | 변경 내용                      |
| --- | ----------------------------------------- | ----- | ------------------------------ |
| 1   | `.claude/hooks/workflow-enforced.sh`      | 0-2   | /pm 예외 조건 추가             |
| 2   | `.claude/agents/project-task-manager.md`  | 0-3   | 역할 경계 섹션 추가            |
| 3   | `.claude/skills/task-management/SKILL.md` | 0-1   | ID 참조를 pm-config.yml로 변경 |

---

## 실행 순서 & 의존성 그래프

```
Phase 0 (병렬 가능)
├── 0-1: pm-config.yml 생성 + SKILL.md/agent ID 참조 변경
├── 0-2: workflow-enforced.sh /pm 예외
├── 0-3: project-task-manager 역할 경계
└── 0-4: planning 디렉토리 생성
     ↓
Phase 1 (0-4 이후, 내부 병렬 가능)
├── 1-1: PM-DOCS 폴더 정비
├── 1-2: PRD-TEMPLATE.md ──────────┐
├── 1-3: screens-template.yml ─────┤
├── 1-4: events-template.yml ──────┤ (모두 1-1 이후)
├── 1-5: changelog 양식 ──────────┤
├── 1-6: milestone-template.md ────┤
└── 1-7: 인덱스 파일 초기화 ───────┘
     ↓
Phase 2 (Phase 1 이후)
├── 2-1: pm-planner.md Agent ──────┐
├── 2-2: SKILL.md (2-1 이후) ──────┤
├── 2-3: prd-workflow.md (2-2+1-2 이후) ─┤
├── 2-4: prd-template.md (1-2 이후) ─────┤
└── 2-5: cis-guide.md (2-2 이후) ────────┘
     ↓
Phase 3 (Phase 2 이후)
├── 3-1: /pm 진입점 (Phase 2 전체)
├── 3-2: Milestone 워크플로우 (3-1+1-6)
├── 3-3: Feature 워크플로우 (3-1+3-2+1-2~1-5) ★ 핵심
├── 3-4: Issue 워크플로우 (3-1)
└── 3-5: Edit Task (3-2+3-3+3-4)
     ↓
Phase 4 (3-1+2-5 이후)
├── 4-1: Context Making 진입점
├── 4-2: CIS 실행 로직 (4-1)
└── 4-3: CIS→PRD 참조 (4-2+3-3)
     ↓
Phase 5 (Phase 3-4 이후)
├── 5-1: Issue 자동 생성 (3-3+3-4)
├── 5-2: Feature 라벨 자동 생성 (3-3)
├── 5-3: Feature 상태 전파 (5-1)
├── 5-4: screen-index 집계 (3-3)
├── 5-5: events-index 집계 (3-3)
└── 5-6: 라벨/마일스톤 자동 배정 (5-1+5-2)
     ↓
Phase 6 (Phase 0-5 이후)
├── 6-1: 중복 검사 로직
├── 6-2: 필수 소속 검증
├── 6-3: Archive 30일 이동
├── 6-4: PRD 임시 저장
├── 6-5: 불변 규칙 테스트
└── 6-6: 통합 테스트
```

---

## 검증 방법

### Phase별 검증

- Phase 0: 기존 `/tasks` 정상, `/pm` 시 4-Phase 미출력
- Phase 1: 디렉토리 구조 + 템플릿 파일 존재 + YAML 파싱 성공
- Phase 2: Agent/Skill 파일 생성 + skill-forced.sh 자동 감지
- Phase 3: `/pm` → 메뉴 표시 → 각 워크플로우 실행 → 산출물 생성
- Phase 4: CIS 워크플로우 → Context Output/ 파일 생성
- Phase 5: PRD → Issue 분해 → 라벨/마일스톤 배정 → 상태 전파
- Phase 6: 불변 규칙 9개 + 통합 테스트 6개 통과

### 커밋 전략

- Phase 0: `CHORE: pm-config.yml 중앙 설정 + 기존 시스템 수정`
- Phase 1: `FEAT: PM-DOCS 폴더 구조 및 템플릿 생성`
- Phase 2: `FEAT: pm-planner Agent 및 planning Skill 정의`
- Phase 3: `FEAT: /pm 핵심 워크플로우 구현`
- Phase 4: `FEAT: CIS 워크플로우 통합`
- Phase 5: `FEAT: GitHub Issue 자동화 연결`
- Phase 6: `TEST: 불변 규칙 및 통합 검증`
