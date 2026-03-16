---
name: prd-workflow
description: Feature PRD 5-Phase 대화형 워크플로우. Phase A(컨텍스트)→B(요구사항)→C(상세)→D(기술)→E(검증/저장).
keywords: [PRD, 워크플로우, Phase, Feature, 유저스토리, 수용기준, 화면정의]
estimated_tokens: ~3000
---

# PRD 대화형 워크플로우 (Phase A → E)

> BMAD Step-File 패턴 차용: 각 Phase를 순차 실행, 건너뛰기 금지
> Facilitator 원칙: 내용을 대신 생성하지 않고, 사용자의 답변을 이끌어낸다

## 워크플로우 개요

```
Phase A: 컨텍스트 수집 (A0: Product Brief → A1: Milestone → A2: CIS)
  ↓
Phase B: 핵심 요구사항 수집
  ↓
Phase C: 상세 정의
  ↓
Phase D: 기술 & 엣지 케이스
  ↓
Phase E: 검증 & 저장
  ↓
(선택) Issue 분해
```

각 Phase 완료 시 **Checkpoint Protocol** 적용:

- **Continue** → 다음 Phase
- **Adjust** → 현재 Phase 재작업
- **Pause** → 임시 저장 후 중단 (status: "draft", progress 필드 업데이트)

---

## Phase A: 컨텍스트 수집

### A0: Product Brief 필수 읽기

1. `PM-DOCS/Context Output/PRODUCT_BRIEF.md` 파일을 읽는다
2. 다음 항목을 PRD 작성의 전략적 기반으로 활용한다:
   - **Vision & Mission**: PRD §1 개요 - 배경 및 목적의 근거
   - **Target Users**: PRD §3 유저스토리 - 역할 정의의 근거
   - **Value Proposition**: PRD §3 유저스토리 - 가치 정의의 근거
   - **Roadmap**: PRD §10 우선순위 & 스코프 - MVP vs 후속 판단 근거
3. PRD frontmatter에 `product_brief_ref` 필드를 기록한다:
   ```yaml
   product_brief_ref: PM-DOCS/Context Output/PRODUCT_BRIEF.md
   ```

> Product Brief의 "부록: PRD 작성 시 참조 가이드" 섹션에 각 Product Brief 섹션 → PRD 섹션 매핑이 정리되어 있다.

### A1: Milestone 선택

1. `PM-DOCS/Planning/Roadmap/` 스캔 → 기존 Milestone 목록 표시
2. AskUserQuestion으로 선택지 제시:
   - 기존 Milestone 목록 (milestone_id + goal)
   - "새 Milestone 생성" 옵션
3. **Milestone이 0개인 경우**: "먼저 Milestone을 생성해주세요" 안내 → Milestone 생성 워크플로우로 이동 (불변 규칙 #1)
4. 선택된 Milestone 정보를 PRD frontmatter에 기록

### A2: CIS 산출물 참조 선택

1. `PM-DOCS/Context Output/` 스캔 (Archive/ 제외)
2. 파일 생성일 기준 **30일 이내** 파일만 표시 (시나리오 #4 대응)
3. AskUserQuestion으로 복수 선택 가능:
   - 최신순 10개 파일 표시
   - "참조 없이 진행" 옵션
4. 선택된 CIS 산출물 경로를 PRD §11 참조 문서에 기록

### A 완료 → Checkpoint (Continue/Adjust/Pause)

- PRD.md 파일 생성 (status: "draft", progress.phase_a: true)
- Feature 폴더 생성: `Feature_PRD/feature#{N}_{name}/`

---

## Phase B: 핵심 요구사항 수집

### B1: Feature명 + 한 줄 요약

1. AskUserQuestion으로 Feature명 입력 요청
2. 자동 처리:
   - 라벨명 미리보기: `feature:{입력명의 kebab-case}`
   - Feature명 중복 검사: Feature_PRD/ 폴더 스캔 + `gh label list --search "feature:"`
   - 중복 시: "이미 존재하는 Feature입니다. 기존 Feature를 수정하시겠습니까?" 안내
3. 한 줄 요약 입력 → PRD §1 개요에 기록

### B2: 목표 & 성공 지표

1. CIS 산출물이 있으면 → 관련 인사이트 기반 초안 제안 → 사용자 수정/승인
2. BMAD Success Criteria Framework 적용:
   - **User Success**: 사용자가 얻는 가치
   - **Business Success**: 비즈니스 임팩트
   - **Technical Success**: 기술적 달성 지표
3. SMART 기준 강제:
   - 모호한 표현 감지 시 구체화 챌린지
   - 예: "UX 개선" → "회원가입 완료율 60%→75% (3개월 내)"
4. PRD §2에 기록

### B3: 유저스토리

1. "~로서, ~하고 싶다, ~하기 위해" 형식 안내
2. CIS 산출물 있으면 → 페르소나/인사이트 기반 초안 제안
3. 핵심 유저스토리 3-7개 수집
4. 각 US에 고유 ID 부여 (US-1, US-2, ...)
5. PRD §3에 기록

### B4: 유저 플로우

1. B3 유저스토리 기반 → 메인 플로우 도출:
   - [진입] → [핵심 행동] → [결과] → [완료/이탈]
2. 대안 플로우 식별 (조건 분기)
3. PRD §4에 기록

### B 완료 → Checkpoint (Continue/Adjust/Pause)

- PRD.md 업데이트 (progress.phase_b: true)

---

## Phase C: 상세 정의

### C1: 화면 정의 (→ screens.yml)

1. B4 유저 플로우에서 식별된 화면 목록 도출
2. 각 화면에 대해 수집:
   - 화면 ID (SCR-{NNN}): 기존 screen-index.yml 중복 검사
   - 화면명, Route, 설명
   - 진입 조건, 주요 UI 요소, 상태
3. `screens-template.yml` 기반 YAML 생성
4. PRD §5 요약 테이블 + screens.yml 상세 파일 생성

### C2: 뷰포트 선택 & 와이어프레임 생성 (→ wireframes.html)

> 참조: `.claude/skills/wireframe/SKILL.md`

1. C1에서 screens.yml 작성 완료 후, PM에게 뷰포트를 선택받는다:
   - AskUserQuestion으로 4가지 선택지 제시:
     1. 모바일 전용 (Phone 375px)
     2. PC 전용 (Desktop 1280px)
     3. 모바일 + PC 둘 다
     4. 화면별로 개별 선택
   - "4. 화면별 개별 선택" 시: 각 화면(SCR-\*)에 대해 모바일/PC/둘다 선택
2. wireframe SKILL 참조하여 `wireframes.html` 자동 생성:
   - screens.yml + PRD 유저 플로우(§4) 기반
   - 각 화면의 기본 상태 레이아웃
   - 주요 에러/빈 상태 (선택적)
   - 공통 영역(Header 등) + 공통 패턴(에러, 빈 상태)
3. PM에게 확인 요청: "wireframes.html을 브라우저에서 열어 확인해주세요"
4. 피드백 → 수정 → 재확인 루프
5. 확인 완료 후 다음 단계(이벤트 정의)로 진행

### C3: 이벤트 정의 (→ events.yml)

1. B4+C1에서 트래킹 필요 행동 식별
2. 각 이벤트에 대해 수집:
   - 이벤트명, 트리거, 연결 화면 ID
   - 카테고리 (interaction/navigation/conversion/error)
   - 프로퍼티, KPI, 퍼널
3. `events-template.yml` 기반 YAML 생성
4. PRD §6 요약 테이블 + events.yml 상세 파일 생성

### C4: 수용 기준 (AC)

1. B3 유저스토리별 Given-When-Then 형식으로 AC 작성
2. 유저스토리 ↔ AC 매핑 완전성 체크:
   - 모든 US에 최소 1개 AC 존재 확인
   - AC 없는 US → 사용자에게 알림
3. PRD §7에 기록

### C 완료 → Checkpoint (Continue/Adjust/Pause)

- PRD.md 업데이트 (progress.phase_c: true)
- screens.yml, events.yml, wireframes.html 파일 저장

---

## Phase D: 기술 & 엣지 케이스

### D1: 기술 요건

1. CIS + B/C 단계 정보 기반 자동 제안:
   - API 변경 (tRPC Router, Service, Entity)
   - DB 스키마 변경 (Migration)
   - 외부 의존성
2. 사용자 확인/수정
3. PRD §8에 기록

### D2: 엣지 케이스 + 우선순위

1. 유저 플로우 + AC 기반 엣지 케이스 식별
2. 각 엣지 케이스별 처리 방법 정의
3. **Smart Scope Negotiation** 적용:
   - MVP (이번 Feature): 핵심 유저스토리 구현에 필수적인 것만
   - Growth (다음 이터레이션): 개선 가능한 항목
   - Vision (장기): 추가 확장 가능 항목
4. PRD §9, §10에 기록

### D 완료 → Checkpoint (Continue/Adjust/Pause)

- PRD.md 업데이트 (progress.phase_d: true)

---

## Phase E: 검증 & 저장

### E1: 일관성 검증

다음 항목을 자동 검증하고 결과를 사용자에게 보고:

1. **유저스토리 ↔ AC 매핑 완전성**: 모든 US에 AC가 있는지
2. **화면 ↔ 유저 플로우 참조 일관성**: 유저 플로우에 언급된 화면이 screens.yml에 있는지
3. **이벤트 ↔ 화면 연결 유효성**: events.yml의 screen_id가 screens.yml에 있는지
4. **화면 ID 중복 검사**: 기존 screen-index.yml과 비교하여 ID 충돌 감지 (시나리오 #8)
5. **누락 항목 체크**: PRD 11섹션 중 빈 섹션 없는지
6. **와이어프레임 ↔ 화면 일치**: wireframes.html에 screens.yml의 모든 화면이 포함되었는지

검증 실패 시 → 해당 Phase로 돌아가서 수정 유도

### E2: 산출물 저장

1. Feature 폴더 확인: `Feature_PRD/feature#{N}_{name}/`
2. 파일 저장:
   - `PRD.md` (frontmatter progress 전체 true로 업데이트, status: "approved")
   - `screens.yml` (최종본)
   - `events.yml` (최종본)
   - `wireframes.html` (최종본, screens.yml이 있는 경우)
3. **Feature 라벨 생성**: `gh label create "feature:{name}" --color EDEDED` (이미 있으면 스킵)
4. **screen-index.yml 자동 집계**:
   - `Feature_PRD/*/screens.yml` 전체 스캔
   - 통합 → `IA/screen-index.yml` 갱신
   - screen-index.yml 기반 → `IA/IA-table.md` 재렌더링
5. **events-index.yml 자동 집계**:
   - `Feature_PRD/*/events.yml` 전체 스캔
   - 통합 → `Planning/events-index.yml` 갱신
6. **Planning/changelog.md 기록**:

   ```markdown
   ## [YYYY-MM-DD]

   ### Added

   - Feature*PRD/feature#{N}*{name}/PRD.md 생성
   - Feature*PRD/feature#{N}*{name}/screens.yml 생성
   - Feature*PRD/feature#{N}*{name}/events.yml 생성
   - GitHub 라벨 feature:{name} 생성
   ```

### E3: Issue 분해 분기

1. AskUserQuestion: "GitHub Issue로 분해할까요?"
   - **Yes** → Issue 자동 생성 워크플로우
   - **No** → PRD만 저장 후 완료

### E4: Planning Context 동기화

PRD 저장 완료 후 `.claude/context/planning/INDEX.md`를 업데이트합니다:

- Feature PRD 목록에 새 PRD 추가
- Roadmap 현황 갱신
- supersedes 관계가 있으면 명시 (예: 이 PRD가 business/payment.md의 정책을 변경함)

### Issue 자동 생성 (E3-Yes 선택 시)

1. PRD의 유저스토리/AC 기반 Issue 분해:
   - 각 유저스토리 → 1개 Enhancement Issue
   - 기술 요건 중 독립 작업 → 별도 Issue
2. 각 Issue 생성:
   - `gh issue create --title "{US-N}: {요약}" --body "{AC 내용}"`
   - 라벨: `feature:{name}` 자동 부여
   - 마일스톤: Feature의 상위 Milestone
3. title 기반 중복 검사 (`gh issue list --search`)
4. Project #4 등록
5. 생성된 Issue 번호를 PRD.md에 역참조 기록
6. PRD frontmatter progress.issue_decomposed: true
7. PRD status: "decomposed"

---

## 임시 저장 메커니즘

### Pause 선택 시

1. 현재까지 작성된 PRD.md를 Feature 폴더에 저장
2. frontmatter 업데이트:
   - status: "draft"
   - progress: 완료된 Phase만 true
   - updated_at: 현재 날짜
3. screens.yml / events.yml이 있으면 함께 저장

### 이어서 작성 (Edit Task → Feature)

1. Feature_PRD/ 스캔 → status: "draft" PRD 감지
2. progress 필드에서 마지막 완료 Phase 확인
3. 다음 Phase부터 이어서 실행
