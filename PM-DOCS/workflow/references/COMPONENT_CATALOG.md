# BMad Method & CIS 컴포넌트 카탈로그

> **목적**: bmad-method와 bmad-cis의 모든 에이전트와 워크플로우를 목록화하여 Readly 통합 후보 선정 지원

---

## 📋 bmad-cis 에이전트 & 워크플로우

### 에이전트 (7개)

| Agent                           | ID                                         | Persona                     | 용도                          | Readly 적용성                                      |
| ------------------------------- | ------------------------------------------ | --------------------------- | ----------------------------- | -------------------------------------------------- |
| **Brainstorming Coach**         | `_bmad/cis/agents/brainstorming-coach`     | Carson (20년 경력의 진행자) | 발산적 사고, 아이디어 생성    | ⭐⭐⭐⭐⭐ (CIS-workflow S1, S3에서 현재 사용)     |
| **Design Thinking Coach**       | `_bmad/cis/agents/design-thinking-coach`   | Empathy 중심 설계 전문가    | 사용자 중심 설계, 솔루션 검증 | ⭐⭐⭐⭐⭐ (CIS-workflow S1, S2, S4에서 현재 사용) |
| **Innovation Strategist**       | `_bmad/cis/agents/innovation-strategist`   | 혁신 전략가                 | 비즈니스 모델 혁신, 시장 분석 | ⭐⭐⭐⭐ (CIS-workflow S3에서 현재 사용)           |
| **Problem Solver (Creative)**   | `_bmad/cis/agents/creative-problem-solver` | 창의적 문제 해결 전문가     | 근본 원인 분석, 창의적 솔루션 | ⭐⭐⭐⭐⭐ (CIS-workflow S2에서 현재 사용)         |
| **Problem Solver (Systematic)** | `_bmad/cis/agents/problem-solving-coach`   | 체계적 분석 전문가          | 문제 진단, 로직 분석          | ⭐⭐⭐⭐ (CIS-workflow S2에서 현재 사용)           |
| **Storyteller**                 | `_bmad/cis/agents/storyteller/storyteller` | 스토리텔링 전문가           | 내러티브 작성, 제품 스토리    | ⭐⭐⭐ (마케팅/PR 도메인)                          |
| **Presentation Master**         | `_bmad/cis/agents/presentation-master`     | 프레젠테이션 전문가         | 발표 구성, 설득 구조          | ⭐⭐⭐ (임원 보고서, 피칭)                         |

### 워크플로우 (5개)

| Workflow                | 단계                                                     | 입력                | 출력                           | Readly 적용성               |
| ----------------------- | -------------------------------------------------------- | ------------------- | ------------------------------ | --------------------------- |
| **Brainstorming**       | 1. Setup 2. SCAMPER 3. Reverse Brainstorm 4. Convergence | 문제/주제           | 아이디어 목록 (10-20개)        | ⭐⭐⭐⭐⭐ (현재 사용 중)   |
| **Design Thinking**     | 1. Empathize 2. Define 3. Ideate 4. Prototype 5. Test    | 사용자 정보, 문제   | 프로토타입 스케치, 테스트 결과 | ⭐⭐⭐⭐⭐ (현재 사용 중)   |
| **Innovation Strategy** | 1. Assess 2. Diverge 3. Converge 4. Plan                 | 현재 전략/시장 정보 | 3년 혁신 로드맵                | ⭐⭐⭐⭐ (분기 전략 수립)   |
| **Problem Solving**     | 1. Define 2. Root Cause 3. Solution Gen 4. Action Plan   | 문제 진술           | 원인 분석 + 해결책 + 액션 플랜 | ⭐⭐⭐⭐⭐ (버그/이슈 분석) |
| **Storytelling**        | 1. Hero's Journey 2. Story Arc 3. Narrative              | 제품/기능 특성      | 3-4 버전의 스토리              | ⭐⭐⭐ (마케팅/제품 런칭)   |

### 팀 설정 (1개)

| Team               | 에이전트 구성                                                       | 용도                              |
| ------------------ | ------------------------------------------------------------------- | --------------------------------- |
| **Creative Squad** | Brainstorming Coach + Design Thinking Coach + Innovation Strategist | 크로스펑셔널 창의 세션 (3인 협업) |

---

## 📋 bmad-method 에이전트 & 워크플로우

### 에이전트 (12+)

| Agent                   | 역할                   | 전문성                           | Readly 적용성 | 통합 우선순위 |
| ----------------------- | ---------------------- | -------------------------------- | ------------- | ------------- |
| **PM Agent**            | Project Manager        | PRD 작성, Feature 분해, 우선순위 | ⭐⭐⭐⭐⭐    | 🔴 High       |
| **Architect Agent**     | System Architect       | 기술 설계, API 설계, DB 스키마   | ⭐⭐⭐⭐      | 🔴 High       |
| **Developer Agent**     | Software Developer     | 코드 작성, 코드리뷰, 버그 수정   | ⭐⭐⭐⭐⭐    | 🔴 High       |
| **Designer Agent**      | UX/UI Designer         | 디자인 시스템, UI 디자인         | ⭐⭐⭐⭐      | 🟡 Medium     |
| **QA Agent**            | Quality Assurance      | 테스트 계획, 테스트 케이스       | ⭐⭐⭐⭐      | 🟡 Medium     |
| **Scrum Master Agent**  | Scrum Master           | 스프린트 계획, 장애물 제거       | ⭐⭐⭐        | 🟢 Low        |
| **DevOps Agent**        | DevOps Engineer        | CI/CD, 배포, 모니터링            | ⭐⭐⭐        | 🟡 Medium     |
| **Tech Lead Agent**     | Technical Lead         | 기술 전략, 코드 스탠다드         | ⭐⭐⭐⭐      | 🟡 Medium     |
| **Security Agent**      | Security Engineer      | 보안 검증, 취약점 분석           | ⭐⭐⭐        | 🟢 Low        |
| **Analytics Agent**     | Analytics Specialist   | 데이터 분석, 메트릭 정의         | ⭐⭐⭐        | 🟢 Low        |
| **Documentarian Agent** | Technical Writer       | 기술 문서, API 문서              | ⭐⭐⭐        | 🟡 Medium     |
| **Integration Agent**   | Integration Specialist | 외부 시스템 연동, API 통합       | ⭐⭐⭐        | 🟡 Medium     |

### 워크플로우 (34+)

주요 워크플로우만 나열:

#### 분석 단계 (6개)

| Workflow                  | 용도                         | Duration | Readly 사용 가능 |
| ------------------------- | ---------------------------- | -------- | ---------------- |
| Discovery & Requirements  | 요구사항 수집 및 분석        | 2-3일    | ⭐⭐⭐⭐         |
| User Research             | 사용자 조사 및 페르소나 정의 | 3-5일    | ⭐⭐⭐⭐         |
| Competitive Analysis      | 경쟁사 분석                  | 2-3일    | ⭐⭐⭐           |
| Risk Assessment           | 위험 요소 식별               | 1-2일    | ⭐⭐⭐⭐         |
| Feasibility Study         | 기술적 실현 가능성 검토      | 2-3일    | ⭐⭐⭐⭐         |
| Business Case Development | 비즈니스 케이스 작성         | 2-3일    | ⭐⭐⭐⭐         |

#### 설계 단계 (8개)

| Workflow               | 용도                  | Duration | Readly 사용 가능 |
| ---------------------- | --------------------- | -------- | ---------------- |
| Architecture Design    | 시스템 아키텍처 설계  | 3-5일    | ⭐⭐⭐⭐⭐       |
| API Design             | REST/GraphQL API 설계 | 2-3일    | ⭐⭐⭐⭐⭐       |
| Database Schema Design | DB 스키마 설계        | 2-3일    | ⭐⭐⭐⭐⭐       |
| UI/UX Design           | 인터페이스 설계       | 5-7일    | ⭐⭐⭐⭐         |
| Data Flow Mapping      | 데이터 흐름 설계      | 2-3일    | ⭐⭐⭐⭐         |
| Integration Planning   | 외부 시스템 연동 계획 | 2-3일    | ⭐⭐⭐           |
| Security Design        | 보안 아키텍처 설계    | 2-3일    | ⭐⭐⭐⭐         |
| Test Strategy          | 테스트 전략 수립      | 2-3일    | ⭐⭐⭐⭐         |

#### 구현 단계 (10개)

| Workflow                   | 용도                    | Duration | Readly 사용 가능 |
| -------------------------- | ----------------------- | -------- | ---------------- |
| Backend Development        | 백엔드 코드 작성        | 7-14일   | ⭐⭐⭐⭐⭐       |
| Frontend Development       | 프론트엔드 코드 작성    | 7-14일   | ⭐⭐⭐⭐⭐       |
| Database Implementation    | DB 구현 및 마이그레이션 | 3-5일    | ⭐⭐⭐⭐         |
| API Implementation         | API 구현                | 5-7일    | ⭐⭐⭐⭐⭐       |
| Integration Implementation | 외부 시스템 연동 구현   | 3-7일    | ⭐⭐⭐           |
| Security Implementation    | 보안 요소 구현          | 3-5일    | ⭐⭐⭐           |
| Code Review & Refactoring  | 코드 리뷰 및 리팩토링   | 2-5일    | ⭐⭐⭐⭐⭐       |
| Documentation              | 기술 문서 작성          | 3-5일    | ⭐⭐⭐⭐         |
| Deployment Preparation     | 배포 준비               | 1-2일    | ⭐⭐⭐           |
| Release Management         | 릴리스 관리             | 1-3일    | ⭐⭐⭐           |

#### 테스트 단계 (6개)

| Workflow            | 용도                    | Duration | Readly 사용 가능 |
| ------------------- | ----------------------- | -------- | ---------------- |
| Unit Testing        | 단위 테스트             | 2-5일    | ⭐⭐⭐⭐         |
| Integration Testing | 통합 테스트             | 2-5일    | ⭐⭐⭐⭐         |
| System Testing      | 시스템 테스트           | 3-7일    | ⭐⭐⭐⭐         |
| UAT Planning        | 사용자 인수 테스트 계획 | 2-3일    | ⭐⭐⭐⭐         |
| Performance Testing | 성능 테스트             | 2-5일    | ⭐⭐⭐           |
| Security Testing    | 보안 테스트             | 2-5일    | ⭐⭐⭐           |

#### 배포 & 런칭 (4개)

| Workflow               | 용도              | Duration | Readly 사용 가능 |
| ---------------------- | ----------------- | -------- | ---------------- |
| Go/No-Go Assessment    | 배포 준비도 평가  | 1-2일    | ⭐⭐⭐⭐         |
| Deployment             | 프로덕션 배포     | 0.5-2일  | ⭐⭐⭐⭐         |
| Launch Communication   | 론칭 커뮤니케이션 | 1-3일    | ⭐⭐⭐           |
| Post-Launch Monitoring | 런칭 후 모니터링  | 3-7일    | ⭐⭐⭐⭐         |

---

## 🎯 Readly-Specific 적용 분석

### Phase 2 추천 Agent 3개 우선순위

#### 1️⃣ **PM Agent** (bmad-method)

- **현재 역할**: Readly에 PM agent가 없음
- **추가 효과**: PRD 자동 분해, Feature 검증 자동화
- **통합 시간**: 1-2주
- **위험도**: 낮음 (기존 workflow와 독립적)
- **기대 효과**: Feature 품질 향상, PRD 일관성

#### 2️⃣ **Architect Agent** (bmad-method)

- **현재 역할**: 기술 스펙 검증 담당 없음
- **추가 효과**: API 설계, DB 스키마 자동 검증
- **통합 시간**: 1-2주
- **위험도**: 낮음 (설계 단계에서만 개입)
- **기대 효과**: 기술 리뷰 프로세스 간소화

#### 3️⃣ **Developer Agent** (bmad-method)

- **현재 역할**: 개발 가이드, 코드리뷰
- **추가 효과**: 코드 품질 자동 검증, 구현 가이드
- **통합 시간**: 2주
- **위험도**: 중간 (기존 Developer workflow와 겹침)
- **기대 효과**: 개발 생산성 향상, 코드 표준화

---

## 🔄 Readly CIS-workflow 매핑 현황

### 현재 S1~S5 시나리오별 CIS 사용 현황

```
S1 (신규 기능 기획)
├─ Design Thinking Coach ✅ (현재 사용)
├─ Brainstorming Coach ✅ (현재 사용)
└─ 추가 가능: Innovation Strategist (bmad-cis)

S2 (데이터 기반 개선, 문제 발견)
├─ Problem Solver (Creative) ✅ (현재 사용)
├─ Design Thinking Coach ✅ (현재 사용)
└─ 추가 가능: Problem Solver (Systematic) - bmad-cis

S3 (전략적 이니셔티브)
├─ Innovation Strategist ✅ (현재 사용)
├─ Brainstorming Coach ✅ (현재 사용)
└─ 추가 가능: Storyteller (bmad-cis)

S4 (사용자 요청/VOC)
├─ Design Thinking Coach ✅ (현재 사용)
├─ Problem Solver (Creative) ✅ (현재 사용)
└─ 추가 가능: 없음 (충분함)

S5 (기술 부채/리팩토링)
├─ CIS 스킵 (기술 중심)
└─ 추가 가능: Developer Agent (bmad-method)
```

### 결론

- ✅ CIS 에이전트 5개 모두 현재 운영 중
- ✅ 기존 S1~S5 매핑과 충돌 없음
- 📝 추가 가능한 보충 에이전트: Innovation Strategist (S1), Systematic Problem Solver (S2), Storyteller (S3), Developer Agent (S5)

---

## 📊 선택적 통합 로드맵

### 즉시 (Week 1-2)

- [ ] 이 카탈로그 팀 리뷰 및 승인
- [ ] 5개 CIS 에이전트 현황 점검 (정상 작동 여부)
- [ ] bmad-method PM Agent 상세 분석

### 단기 (Week 3-4)

- [ ] PM Agent 추출 및 통합
  - 경로 설정, module 필드 수정
  - .claude/agents/pm.agent.yaml 생성
  - 테스트 및 문서화
- [ ] Architect Agent 분석 완료

### 중기 (Week 5-6)

- [ ] Architect Agent 통합
- [ ] Developer Agent 분석

### 장기 (Week 7+)

- [ ] Developer Agent 통합 (필요시)
- [ ] 추가 워크플로우 평가

---

**작성자**: Claude Code
**최종 수정**: 2025-02-17
