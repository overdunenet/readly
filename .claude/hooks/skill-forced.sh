#!/bin/bash

# .claude/hooks/skill-forced.sh
# Skill/Agent 평가 프로토콜 - UserPromptSubmit hook

echo "✅ [Hook] Skill/Agent 평가 프로토콜 실행됨"

cat << 'EOF'
MANDATORY SKILL & AGENT EVALUATION PROTOCOL

작업을 시작하기 전에 반드시 아래 단계를 순서대로 완료하세요:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT 절약 원칙 (최우선)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Main Agent의 Context Window는 제한적입니다. 다음 작업은 **반드시 Subagent에 위임**하세요:

| 작업 유형 | 사용할 Agent | 이유 |
|----------|-------------|------|
| 코드베이스 탐색/검색 | explore | 파일 내용이 Main Context에 쌓이지 않음 |
| 여러 파일 읽기 | explore | 탐색 결과만 요약해서 받음 |
| 복잡한 계획 수립 | oh-my-claudecode:planner | 계획 결과만 받음 |
| 코드 리뷰 | oh-my-claudecode:code-reviewer | 리뷰 결과만 받음 |
| 빌드/테스트 검증 | oh-my-claudecode:build-fixer | 검증 결과만 받음 |

**절대 금지:**
- Main Agent에서 직접 Glob/Grep으로 여러 파일 탐색
- Main Agent에서 직접 여러 파일 Read
- Main Agent에서 복잡한 분석 수행

**허용:**
- 단일 파일 수정 (Edit)
- 새 파일 생성 (Write)
- 단순 명령 실행 (Bash)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: SKILL 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 - Skill 평가: 각 Skill에 대해 다음을 명시하세요:
  - Skill 이름
  - YES 또는 NO (이 요청에 해당 Skill이 필요한가?)
  - 한 줄 이유

Step 2 - Skill 로드: YES로 표시된 Skill의 문서를 참조하세요.

---

### Readly 프로젝트 Skill

| Skill | 경로 | 키워드 |
|-------|------|--------|
| API 개발 | `.claude/skills/api/SKILL.md` | 백엔드, tRPC, Router, Service, Entity, Repository |
| Frontend 개발 | `.claude/skills/frontend/SKILL.md` | 프론트엔드, React, 컴포넌트, 스타일링, 폼, 모달 |
| 공통 패턴 | `.claude/skills/common/SKILL.md` | Git, 네이밍, 코딩 컨벤션 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1.5: CONTEXT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

필요시 Context 문서를 참조하세요 (Subagent로 위임 권장):

| Context | 경로 | 설명 |
|---------|------|------|
| 시스템 아키텍처 | `.claude/context/architecture/INDEX.md` | 전체 구조, 통신 흐름 |
| 도메인/기능 | `.claude/context/domain/features.md` | 접근 권한, 기능 명세 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AGENT 평가 (필수 - Context 절약)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3 - Agent 평가: 각 Agent에 대해 YES/NO를 명시하세요.
Step 4 - Agent 활용: YES로 표시된 Agent는 Task 도구로 호출하세요.

---

### 탐색/분석 Agent (★ 필수 활용)

| Agent | 언제 사용 |
|-------|----------|
| explore | 파일 찾기, 패턴 검색, 코드 구조 파악 |
| oh-my-claudecode:architect | 복잡한 설계/디버깅, 의존성 추적 |

**반드시 explore 사용:**
- "~가 어디에 있어?" → `Task(subagent_type="explore", prompt="...")`
- "~를 사용하는 파일 찾아줘" → `Task(subagent_type="explore", prompt="...")`

### 계획 Agent

| Agent | 언제 사용 |
|-------|----------|
| oh-my-claudecode:planner | 요구사항 명확화, 계획 수립 |
| oh-my-claudecode:analyst | 영향 분석 필요 시 |

### 검증 Agent (★ 구현 후 필수)

| Agent | 언제 사용 |
|-------|----------|
| oh-my-claudecode:code-reviewer | 코드 작성 완료 후 리뷰 |
| oh-my-claudecode:build-fixer | 빌드 에러 수정 |

**구현 완료 후 반드시:**
```
Task(subagent_type="oh-my-claudecode:code-reviewer", prompt="방금 작성한 [파일들]을 리뷰해줘")
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5 - 구현: 모든 관련 Skill 참조 및 Agent 호출 후에만 구현을 시작하세요.

---

### 평가 형식 예시

**Skill 평가:**
- API 개발: YES - 새 API 엔드포인트 생성
- Frontend 개발: NO - 프론트엔드 변경 없음
- 공통 패턴: YES - 커밋 메시지 작성 필요

**Agent 평가:**
- explore: YES - Post 관련 파일 위치 파악 필요
- oh-my-claudecode:planner: NO - 단순 기능 추가
- oh-my-claudecode:code-reviewer: YES - 구현 후 리뷰 필수

---

### 중요

- **탐색 작업은 반드시 Subagent로**: Main Context 절약
- **구현 후 검증은 필수**: code-reviewer 사용
- **단순 작업은 예외**: 설정 파일 수정, 오타 수정은 직접 처리 가능

지금 바로 모든 사용 가능한 Skill과 Agent를 평가하세요.
EOF
