# 외부 워크플로우 저장소 통합 분석

> **분석 날짜**: 2025-02-17
> **대상**: bmad-cis, bmad-method과 Readly 기존 워크플로우의 호환성 및 충돌 분석
> **목적**: Readly 기존 체계와의 충돌 최소화하면서 필요한 컴포넌트만 선택적으로 통합하기 위한 로드맵 제공

---

## 📋 Executive Summary

### 현재 상황

- **Readly**: 이미 BMad CIS 워크플로우 기반 시스템 운영 중 (Definition of the tasks.md, CIS-workflow mapping logic.md)
- **bmad-cis**: Creative Intelligence Suite (브레인스토밍, 디자인씽킹 등 Agent/Workflow 모음)
- **bmad-method**: 핵심 BMad 프레임워크 (34+ 워크플로우, 12+ 전문 에이전트)

### 핵심 발견

| 항목                   | 상태      | 영향                                   |
| ---------------------- | --------- | -------------------------------------- |
| **에이전트 정의 방식** | ✅ 호환   | `.agent.yaml` 형식 동일                |
| **워크플로우 구조**    | ✅ 호환   | `.yaml` 설정 형식 동일                 |
| **기존 CIS 의존성**    | ⚠️ 부분적 | 이미 사용 중인 workflow 존재           |
| **Task 계층 구조**     | ✅ 호환   | Milestone→Feature→Issue 독립 운영 가능 |
| **Configuration 충돌** | ⚠️ 잠재적 | 경로, 모듈명 겹칠 수 있음              |

---

## 📦 저장소 상세 분석

### 1. bmad-cis (Creative Intelligence Suite)

#### 구조

```
bmad-cis/
├── src/
│   ├── agents/                    # 7개 Creative 에이전트
│   │   ├── brainstorming-coach.agent.yaml
│   │   ├── design-thinking-coach.agent.yaml
│   │   ├── innovation-strategist.agent.yaml
│   │   ├── creative-problem-solver.agent.yaml
│   │   ├── storyteller/
│   │   └── presentation-master.agent.yaml
│   ├── workflows/                 # 5개 Creative 워크플로우
│   │   ├── brainstorming/
│   │   ├── design-thinking/
│   │   ├── innovation-strategy/
│   │   ├── problem-solving/
│   │   └── storytelling/
│   ├── teams/                     # 팀 설정 (creative-squad.yaml)
│   └── module.yaml                # 모듈 메타데이터
├── test/                          # Agent schema 검증 테스트
├── docs/                          # 상세 문서
└── website/                       # 웹사이트

```

#### 포함 내용

- **7개 에이전트**: 각각 persona, menu, instructions 포함
- **5개 워크플로우**: brainstorming, design-thinking, innovation-strategy, problem-solving, storytelling
- **1개 팀 구성**: creative-squad (다중 에이전트 협업)
- **테스트 픽스처**: Agent YAML 스키마 검증 300+ 케이스

#### 특징

- Agent metadata에 `module: cis` 명시
- Workflow config에 `config_source` 경로 사용
- `{project-root}/_bmad/cis/` 경로 convention
- Markdown 기반 워크플로우 인스트럭션

---

### 2. bmad-method (BMad Method Core)

#### 구조

```
bmad-method/
├── src/
│   ├── agents/                    # 12+ 핵심 에이전트
│   ├── workflows/                 # 34+ 워크플로우
│   ├── teams/                     # 다중 agent 팀 설정
│   └── module.yaml
├── tools/
│   ├── cli/                       # 설치 & 스캐폴딩 도구
│   │   └── installers/            # 다양한 IDE 템플릿
│   ├── docs/                      # 문서 생성 도구
│   └── maintainer/                # 유지보수 도구
├── test/                          # 34+ 워크플로우 테스트
├── docs/                          # 상세 문서
└── website/                       # 문서 사이트

```

#### 포함 내용

- **12+ 에이전트**: PM, Architect, Developer, UX, Scrum Master, Designer, QA, DevOps 등
- **34+ 워크플로우**: 분석→설계→구현→테스트 전체 생명주기
- **CLI 도구**: 프로젝트 초기화, 템플릿 생성, 의존성 관리
- **IDE 템플릿**: Claude Code, Windsurf, Codex, Kiro, OpenCode, Trae 지원

#### 특징

- Agent metadata에 `module: bmm` (BMad Method) 명시
- `_bmad/core/` 경로 convention
- Node.js 기반 CLI 설치 도구
- 웹 기반 번들 배포 지원

---

### 3. Readly 기존 구조

#### 현재 운영 중인 시스템

```
PM-DOCS/
├── planning/
│   └── Roadmap/                   # Milestone 정의
├── Workflow/
│   ├── CIS-workflow mapping logic.md   # S1~S5 scenario 기반 CIS 선택 로직
│   ├── Definition of the tasks.md      # Milestone→Feature→Issue 계층 구조
│   ├── claude-system-analysis.md       # 시스템 분석 문서
│   ├── flowchart/                      # 워크플로우 다이어그램
│   └── reference agent/                # 기존 reference 자료
└── .claude/
    ├── context/                        # 비즈니스/코드베이스 정보
    └── skills/                         # 개발 가이드 문서
```

#### 운영 원칙

- **Scenario 기반 CIS 사용**: S1(신규 기능)~S5(리팩토링) 상황별 CIS 워크플로우 결정
- **3단계 계층 구조**: Milestone (수동) → Feature (자동) → Issue (수동)
- **문서 기반 설정**: YAML 대신 Markdown 문서로 로직 정의

---

## ⚠️ 잠재적 충돌 분석

### 1. **경로 Convention 충돌**

#### 문제

```
bmad-cis    : {project-root}/_bmad/cis/
bmad-method : {project-root}/_bmad/core/
Readly      : {project-root}/.claude/
```

- `_bmad/` 폴더와 `.claude/` 폴더가 다른 root 레벨 위치
- Git에서 underscore vs dot으로 구분 가능하나 네비게이션 복잡

#### 영향도

- **HIGH**: IDE 플러그인 설정, 경로 참조 스크립트 수정 필요

#### 해결 전략

```
선택 1 (권장): Readly 기존 구조 유지
  └─ _bmad/ 폴더는 reference만 두고 .claude/에서 필요한 것만 추출

선택 2: _bmad/ 통합
  └─ _bmad/cis/ + _bmad/core/ 운영 후 .claude/skills에서 참조
```

---

### 2. **Agent 메타데이터 Module 필드 충돌**

#### 문제

```yaml
# bmad-cis의 brainstorming-coach
agent:
  metadata:
    module: cis        # module: cis

# bmad-method의 PM agent
agent:
  metadata:
    module: bmm        # module: bmm

# Readly에서 새로 정의한다면?
# module: readly? custom?
```

#### 영향도

- **MEDIUM**: Agent 로더가 module 필드로 필터링하면 혼재 문제 발생

#### 해결 전략

- Readly agent에는 명시적으로 `module: readly` 설정
- Agent 로더에 namespace 개념 추가 (optional)

---

### 3. **Workflow Output 경로 충돌**

#### 문제

```yaml
# bmad-cis workflow
config_source: "{project-root}/_bmad/cis/config.yaml"
output_folder: "{config_source}:output_folder"

# bmad-method workflow
config_source: "{project-root}/_bmad/core/config.yaml"
output_folder: "{config_source}:output_folder"
```

- 각 모듈이 자신의 config.yaml을 기대
- 출력 폴더 충돌 가능

#### 영향도

- **MEDIUM**: 워크플로우 실행 시 config 파일 찾지 못할 수 있음

#### 해결 전략

```
1. 통합 config 관리
   └─ {project-root}/.claude/config/
      ├── cis-config.yaml
      └── bmm-config.yaml

2. 환경 변수 주입
   └─ CIS_OUTPUT_FOLDER, BMM_OUTPUT_FOLDER 설정

3. Template 상대 경로 수정
   └─ "../../../config/" 형태로 경로 재계산
```

---

### 4. **Task 계층 구조 충돌 여부**

#### 현황

```
Readly:
  Milestone (수동) → Feature → GitHub Issue

BMad Method:
  (자체 Task 계층이 있을 수 있음)
```

#### 분석 결과

✅ **충돌 없음**:

- Readly의 계층 구조는 GitHub 레벨에서만 작동
- BMad Agent들은 workflow 실행 시 자신의 output만 생성
- 두 시스템이 독립적으로 운영 가능

---

## 🚀 선택적 통합 전략

### Phase 1: Reference-Only 모드 (현재)

**목표**: 기존 workflow 보존, 외부 저장소는 reference 자료로만 운영

```
PM-DOCS/Workflow/references/
├── bmad-cis/           # 전체 클론 (reference)
├── bmad-method/        # 전체 클론 (reference)
└── INTEGRATION_ANALYSIS.md  # 이 문서
```

**액션 아이템**:

- ✅ 완료: 두 저장소 전체 클론
- 📝 TODO: reference 자료에서 패턴 추출
- 📝 TODO: 기존 Readly workflow와 비교 매트릭스 작성

---

### Phase 2: 선택적 Agent 추출 (선택사항)

**목표**: bmad-method의 특정 에이전트를 Readly에 통합

**추출 우선순위** (Readly 도메인 기준):

1. **PM Agent** (bmad-method)
   - 경로: `bmad-method/src/agents/pm.agent.yaml`
   - 용도: PRD 검증, Feature 분해
   - 통합 난도: ⭐⭐ (설정 경로 수정 필요)

2. **Architect Agent** (bmad-method)
   - 경로: `bmad-method/src/agents/architect.agent.yaml`
   - 용도: 기술 스펙 검증
   - 통합 난도: ⭐⭐

3. **Developer Agent** (bmad-method)
   - 경로: `bmad-method/src/agents/developer.agent.yaml`
   - 용도: 코드 리뷰, 구현 가이드
   - 통합 난도: ⭐⭐

**통합 프로세스**:

```
1. Agent YAML 파일 복사
   └─ {bmad-repo}/src/agents/xxx.agent.yaml
      → .claude/agents/xxx.agent.yaml

2. 경로 참조 수정
   - {project-root}/_bmad/core/ → {project-root}/.claude/
   - 상대 경로 재계산

3. Module 필드 업데이트
   - module: bmm → module: readly

4. 테스트
   - 에이전트 trigger 검증
   - 워크플로우 실행 테스트

5. 문서 통합
   - .claude/skills/agents/ 에 가이드 작성
```

---

### Phase 3: Workflow 통합 (선택사항)

**목표**: bmad-cis 워크플로우를 CIS-workflow mapping logic에 추가

**변경 사항**:

```
기존:
  S1 → Design Thinking / Brainstorming (CIS 정의)

통합 후:
  S1 → Design Thinking / Brainstorming (bmad-cis 공식 버전)
  S1 → Innovation Strategy (bmad-method 추가 옵션)
  S1 → Storytelling (bmad-cis 추가 옵션)
```

**통합 난도**: ⭐⭐⭐ (워크플로우 간 호환성 검증 필요)

---

## 📊 통합 영향도 매트릭스

| 항목             | Phase 1 (현재) | Phase 2 (Agent) | Phase 3 (Workflow) |
| ---------------- | -------------- | --------------- | ------------------ |
| 기존 시스템 영향 | ❌ None        | ⚠️ Medium       | ⚠️ High            |
| 구현 난도        | ✅ Easy        | ⭐⭐ Medium     | ⭐⭐⭐ High        |
| 테스트 복잡도    | ✅ Low         | ⭐⭐ Medium     | ⭐⭐⭐ High        |
| 완료 기간        | ✅ 즉시        | 2-3주           | 4-6주              |
| 롤백 용이성      | ✅ Easy        | ⭐⭐ Medium     | ⚠️ Difficult       |

---

## ✅ 권장 사항

### 단기 (1주일)

1. ✅ 이 분석 문서 검토 및 확인
2. 📝 각 저장소의 Agent 목록 작성 (이름, 용도, 복잡도)
3. 📝 기존 Readly workflow와 bmad-cis/bmad-method workflow 비교표 작성

### 중기 (2-3주)

4. 필요한 Agent 1-2개 선택 후 Phase 2 진행
5. 경로 설정, 모듈 명 업데이트 테스트
6. .claude/agents/ 폴더 구조 설계

### 장기 (1개월 이후)

7. 추가 Agent 통합 고려
8. Workflow 일부 통합 (필요시)
9. 공식 문서 갱신

---

## 📝 다음 작업 체크리스트

- [ ] 이 분석 문서 팀 검토 완료
- [ ] Phase 1 (reference-only) 현황 유지 결정
- [ ] Phase 2 진행 여부 결정 (Agent 추출)
- [ ] 필요시 Phase 2 대상 에이전트 명시
- [ ] .claude/context/ 에 bmad-method/cis 개요 문서 추가
- [ ] 팀 위키에 통합 가이드 공유

---

## 🔗 참고 자료

### 클론된 저장소

- **bmad-cis**: `PM-DOCS/Workflow/references/bmad-cis/`
- **bmad-method**: `PM-DOCS/Workflow/references/bmad-method/`

### 기존 Readly 문서

- `PM-DOCS/Workflow/Definition of the tasks.md` - Task 계층 구조
- `PM-DOCS/Workflow/CIS-workflow mapping logic.md` - Scenario별 CIS 선택 로직

### 주요 구성 요소

- bmad-cis/src/agents/ - 7개 Creative 에이전트
- bmad-cis/src/workflows/ - 5개 Creative 워크플로우
- bmad-method/src/agents/ - 12+ 핵심 에이전트
- bmad-method/src/workflows/ - 34+ 워크플로우

---

**작성자**: Claude Code
**최종 수정**: 2025-02-17
