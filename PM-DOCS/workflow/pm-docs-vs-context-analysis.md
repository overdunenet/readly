# PM-DOCS vs .claude/context/business 비교 분석

## 1. 생성 원리의 핵심 차이

| 구분          | PM-DOCS (기획 문서)                        | .claude/context/business (Context 문서)            |
| ------------- | ------------------------------------------ | -------------------------------------------------- |
| **생성 시점** | `/pm` 커맨드로 **기획 단계에서 수동 생성** | **PR 머지 후** 코드 변경 기반으로 자동/반자동 생성 |
| **생성 주체** | PM/기획자 (pm-planner Agent)               | context-generator Agent (CI 기반)                  |
| **트리거**    | 사용자가 `/pm → New Task → Feature` 선택   | PR diff 분석 → 변경된 모듈의 비즈니스 의미 추출    |
| **방향**      | **미래 → 현재** (만들 것을 정의)           | **현재 → 과거** (만든 것을 기록)                   |

---

## 2. 역할과 관점의 차이

### PM-DOCS/Planning/Feature_PRD/ (PRD)

**"왜, 무엇을 만들 것인가"** — 기획서

```
CIS 아이디어 발산 → PRD 작성 (5-Phase) → Issue 분해 → 개발 착수
```

- 11개 섹션 (목표, 유저스토리, 유저플로우, 수용기준, 기술요건...)
- screens.yml로 화면 설계, events.yml로 이벤트 트래킹 정의
- **코드가 존재하기 전에** 작성됨
- GitHub Issue로 분해되어 개발 태스크가 됨

### .claude/context/business/ (Context)

**"왜 이렇게 만들었는가"** — 사후 정책 요약

```
PR 머지 → 코드 변경 분석 → 비즈니스 관점으로 변환 → context 문서 생성
```

- 간결한 구조 (목적, 핵심 기능 테이블, 사용자 흐름, 비즈니스 규칙)
- ~200 토큰 내외로 압축
- **코드가 구현된 후에** 생성됨
- Claude Code가 코드 작업 시 **배경 지식**으로 참조

---

## 3. 코드에 작용하는 방식

```
                    코드 작성 전                    코드 작성 후
                    ──────────                    ──────────
PM-DOCS/PRD ──→ GitHub Issue ──→ [개발자 코드 작성] ──→ PR 머지
     │                                                     │
     │ "이렇게 만들어라"                    "이렇게 만들었다" │
     │ (설계 명세)                          (사후 기록)      │
     │                                                     ↓
     │                                    .claude/context/business/
     │                                    .claude/context/codebase/
     │                                                     │
     └──────────────── 다음 기능 개발 시 ←─────────────────┘
                       context로 배경지식 활용
```

### PRD → 코드 (직접 작용)

- PRD의 수용기준(AC)이 테스트 케이스가 됨
- PRD의 기술요건이 Entity/Service/Controller 구조를 결정
- screens.yml이 라우트와 컴포넌트 구조를 결정
- Issue로 분해되어 실제 개발 태스크가 됨

### Context → 코드 (간접 작용)

- Claude Code가 새 기능 개발 시 **기존 비즈니스 규칙을 이해**하는 배경지식
- 예: `access-control.md`를 읽고 freeContent/paidContent 분리 규칙을 지키며 코딩
- frontmatter의 `related_contexts`로 business ↔ codebase 연결 추적

---

## 4. 구체적 예시: Follow 기능

| 단계              | PM-DOCS                                                                               | Context                                                                     |
| ----------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 기획 시           | `/pm → Feature → follow-users` PRD.md 작성 (유저스토리, 수용기준, 화면정의 등 11섹션) | 아직 없음                                                                   |
| 개발 중           | PRD를 참조하며 Entity, Service, Router 구현                                           | 아직 없음                                                                   |
| PR 머지 후        | PRD 상태 → `approved` → `decomposed`                                                  | `business/user-follow.md` (~200토큰), `codebase/follow-module.md` 자동 생성 |
| 다음 기능 개발 시 | 새 PRD에서 follow 기능을 전제조건으로 참조                                            | Claude Code가 context를 읽고 팔로우 규칙을 이해한 채로 코딩                 |

---

## 5. 요약

|                | PRD (PM-DOCS)                    | Context (business/)               |
| -------------- | -------------------------------- | --------------------------------- |
| **한 줄 정의** | 제품 설계도 (Blueprint)          | 구현 배경 사전 (Reference)        |
| **토큰 크기**  | 크다 (~2000+)                    | 작다 (~200)                       |
| **업데이트**   | PM이 수동으로                    | PR 기반 증분 자동                 |
| **코드 작용**  | **직접** — Issue로 분해되어 개발 | **간접** — AI가 배경지식으로 참조 |
| **소비자**     | 개발자 (구현 명세로)             | Claude Code (컨텍스트로)          |
| **수명**       | Feature 완료 시 archived         | 코드가 존재하는 한 유지           |

**핵심**: PRD는 "코드를 만들기 위한 입력"이고, Context는 "만든 코드를 이해하기 위한 출력"이다. 이 둘이 순환하면서 프로젝트의 지식이 축적된다.
