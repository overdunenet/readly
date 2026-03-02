# Claude Code 작업 가이드

## Context 절약 원칙

Main Agent의 Context Window는 제한적입니다. Subagent가 할 수 있는 작업은 Subagent에 위임합니다.

<delegation_rules>

### 위임 규칙

| 작업                           | 전담 Agent                     |
| ------------------------------ | ------------------------------ |
| 코드베이스 탐색/검색           | `explore`                      |
| 여러 파일 읽기                 | `explore`, `context-collector` |
| .claude/context/ 문서 수집     | `context-collector`            |
| 코드 패턴/구조 파악            | `context-collector`            |
| 복잡한 계획 수립               | `task-planner`                 |
| 영향 분석                      | `impact-analyzer`              |
| 코드 리뷰                      | `code-reviewer`                |
| 테스트/빌드 검증               | `qa-tester`                    |
| 단순 수정 (lint, 오타, 설정값) | `simple-code-writer` (haiku)   |
| 로직 작성, 기능 구현, 리팩토링 | `code-writer` (opus)           |
| Git 작업 (commit, PR, branch)  | `git-manager`                  |
| Context 문서 정리              | `context-manager`              |
| 설계/아키텍처 결정             | `architect`                    |
| UI 컴포넌트 설계               | `designer`                     |
| 스펙/기획 문서 검증            | `director`                     |
| Plan 품질 검증                 | `plan-verifier`                |
| PM 기획 워크플로우             | `pm-planner`                   |
| GitHub Project 태스크 관리     | `project-task-manager`         |
| Context 문서 자동 생성 (CI)    | `context-generator`            |

### Main Agent 전담

- 사용자와 대화/질문 응답
- Task 흐름 관리 (TaskCreate, TaskUpdate, TaskList)
- Subagent 호출 및 결과 전달

</delegation_rules>

<workflow>

## 작업 워크플로우

```
1. Context 수집 → 2. TaskList 생성 → 3. 수정 계획 (사용자 Confirm 필수)
                        ↓
4. 사이드이펙트 검증 (Code Flow, UserFlow, Breaking Change)
                        ↓
5. 코드 수정 (작은 단위) → 6. 단위별 커밋
                        ↓
7. Self Code Review (lint) → 8. Task 완료 검증
```

</workflow>

<agent_team_rules>

## Agent Team 행동 강령

> 아래 규칙은 사용자가 명시적으로 agent team 구성을 요청하여 **여러 subagent를 병렬로 스폰하는 경우에만** 적용한다. 단일 subagent 위임(예: explore, git-manager 등 일상적 위임)에는 적용하지 않는다.

### 1. 결과 전달

- Subagent는 구조화된 형식(요약 + 상세)으로 Main에 반환한다
- Main은 후속 agent에 필요한 context만 선별하여 전달한다

### 2. 실패 보고

- Subagent는 작업 실패 시 아래 형식으로 Main에 보고 후 중단한다:
  1. 실패 원인
  2. 시도한 대안
  3. 권장 다음 단계

### 3. 충돌 방지

- Main은 동일 파일을 수정하는 agent를 동시에 실행하지 않는다
- Main이 의존성 기반으로 실행 순서를 결정한다

### 4. 스폰 전 오너십 확인

- 병렬 subagent 스폰 전 각 agent의 수정 예정 파일을 선언한다
- 파일 겹침 여부를 확인하고, 겹치면 순차 실행 또는 분담을 재조정한다
- 할당표를 사용자에게 보여주고 승인 후 스폰한다

### 5. 재시도 상한

- Subagent는 동일 접근을 3회 이상 재시도하지 않는다
- 해결되지 않으면 Main에 보고 후 중단한다

</agent_team_rules>

## 문서 참조

<reference>

| 유형               | 위치                                    |
| ------------------ | --------------------------------------- |
| PM 기획 문서       | `.claude/context/planning/`             |
| 프로젝트 배경 정보 | `.claude/context/`                      |
| 공통 코딩 원칙     | `.claude/skills/Coding/SKILL.md`        |
| Git 규칙           | `.claude/skills/Git/SKILL.md`           |
| 문서 작성 가이드   | `.claude/skills/Documentation/SKILL.md` |

</reference>
