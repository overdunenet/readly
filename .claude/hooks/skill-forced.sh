#!/bin/bash

# .claude/hooks/skill-forced.sh
# Skill/Agent 평가 프로토콜 - UserPromptSubmit hook
# 프로젝트(.claude) + 글로벌(~/.claude) skills/agents/context 자동 탐색

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_CLAUDE_DIR="$(dirname "$SCRIPT_DIR")"
GLOBAL_CLAUDE_DIR="$HOME/.claude"

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
| 여러 파일 읽기 | explore / context-collector | 탐색 결과만 요약해서 받음 |
| 패턴/구조 파악 | context-collector | 분석 결과만 받음 |
| 복잡한 계획 수립 | task-planner | 계획 결과만 받음 |
| 영향 분석 | impact-analyzer | 분석 결과만 받음 |
| 코드 리뷰 | code-reviewer | 리뷰 결과만 받음 |
| 테스트/빌드 검증 | qa-tester | 검증 결과만 받음 |
| 여러 파일 코드 작성 | code-writer / designer | 구현 결과만 받음 |
| Git 작업 | git-manager | 커밋/PR 결과만 받음 |

**절대 금지:**
- Main Agent에서 직접 Glob/Grep으로 여러 파일 탐색
- Main Agent에서 직접 여러 파일 Read (2개 이상)
- Main Agent에서 복잡한 분석/계획 수행
- Main Agent에서 3개 이상 파일 수정
- **Main Agent에서 직접 Git 명령어 실행 (git add, commit, push 등)**

**허용:**
- 단일~소수(1-2개) 파일 수정 (Edit)
- 단일~소수(1-2개) 파일 생성 (Write)
- 단순 명령 실행 (Bash) - **단, Git 명령어 제외**
- 사용자와 대화/질문 응답

**Git 작업은 반드시 Subagent 사용:**
```
Task(subagent_type="git-manager", prompt="현재 변경사항을 커밋해줘")
Task(subagent_type="git-manager", prompt="PR을 생성해줘")
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: SKILL 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 - Skill 평가: 각 Skill에 대해 다음을 명시하세요:
  - Skill 이름
  - YES 또는 NO (이 요청에 해당 Skill이 필요한가?)
  - 한 줄 이유

Step 2 - Skill 활성화: YES로 표시된 모든 Skill의 SKILL.md를 읽으세요.

---

### 사용 가능한 Skills

EOF

# === Skills 탐색 함수 ===
scan_skills() {
  local base_dir="$1"
  local label="$2"

  if [ -d "$base_dir/skills" ]; then
    local found=false
    for skill_dir in "$base_dir/skills"/*/; do
      if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        skill_file="$skill_dir/SKILL.md"

        if [ -f "$skill_file" ]; then
          if [ "$found" = false ]; then
            echo "#### $label"
            echo ""
            found=true
          fi
          # 상대 경로 표시
          local display_path="${skill_dir#$PROJECT_CLAUDE_DIR/}"
          if [[ "$skill_dir" == "$GLOBAL_CLAUDE_DIR"* ]]; then
            display_path="~/.claude/skills/$skill_name/SKILL.md"
          else
            display_path=".claude/skills/$skill_name/SKILL.md"
          fi
          echo "**[$skill_name]** \`$display_path\`"
          echo '```yaml'
          head -6 "$skill_file"
          echo '```'
          echo ""
        fi
      fi
    done
  fi
}

# 프로젝트 Skills (우선)
scan_skills "$PROJECT_CLAUDE_DIR" "프로젝트 Skills (.claude/skills/)"

# 글로벌 Skills (다른 경우에만)
if [ "$PROJECT_CLAUDE_DIR" != "$GLOBAL_CLAUDE_DIR" ]; then
  scan_skills "$GLOBAL_CLAUDE_DIR" "글로벌 Skills (~/.claude/skills/)"
fi

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1.5: CONTEXT 확인 (Subagent로 위임 권장)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**권장:** Context 확인은 `context-collector` Agent에 위임하세요.

```
Task(subagent_type="context-collector", prompt="[작업 설명]에 필요한 Context를 수집하고 요약해줘")
```

---

### 사용 가능한 Context 문서

EOF

# === Context 탐색 함수 ===
scan_context() {
  local base_dir="$1"
  local label="$2"

  if [ -d "$base_dir/context" ]; then
    local found=false
    # 루트 레벨 md 파일
    for ctx_file in "$base_dir/context"/*.md; do
      if [ -f "$ctx_file" ]; then
        ctx_name=$(basename "$ctx_file" .md)
        if [ "$found" = false ]; then
          echo "#### $label"
          echo ""
          found=true
        fi
        local display_path
        if [[ "$ctx_file" == "$GLOBAL_CLAUDE_DIR"* ]]; then
          display_path="~/.claude/context/$ctx_name.md"
        else
          display_path=".claude/context/$ctx_name.md"
        fi
        echo "- **[$ctx_name]** \`$display_path\`"
      fi
    done
    # 서브디렉토리
    for ctx_dir in "$base_dir/context"/*/; do
      if [ -d "$ctx_dir" ]; then
        dir_name=$(basename "$ctx_dir")
        for ctx_file in "$ctx_dir"/*.md; do
          if [ -f "$ctx_file" ]; then
            ctx_name=$(basename "$ctx_file" .md)
            if [ "$found" = false ]; then
              echo "#### $label"
              echo ""
              found=true
            fi
            local display_path
            if [[ "$ctx_file" == "$GLOBAL_CLAUDE_DIR"* ]]; then
              display_path="~/.claude/context/$dir_name/$ctx_name.md"
            else
              display_path=".claude/context/$dir_name/$ctx_name.md"
            fi
            echo "- **[$dir_name/$ctx_name]** \`$display_path\`"
          fi
        done
      fi
    done
    if [ "$found" = true ]; then
      echo ""
    fi
  fi
}

# 프로젝트 Context (우선)
scan_context "$PROJECT_CLAUDE_DIR" "프로젝트 Context (.claude/context/)"

# 글로벌 Context (다른 경우에만)
if [ "$PROJECT_CLAUDE_DIR" != "$GLOBAL_CLAUDE_DIR" ]; then
  scan_context "$GLOBAL_CLAUDE_DIR" "글로벌 Context (~/.claude/context/)"
fi

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AGENT 평가 (필수 - Context 절약)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3 - Agent 평가: 각 Agent에 대해 다음을 명시하세요:
  - Agent 이름
  - YES 또는 NO (이 요청에 해당 Agent 활용이 필요한가?)
  - 한 줄 이유

Step 4 - Agent 활용: YES로 표시된 Agent는 Task 도구로 호출하세요.
  예: Task(subagent_type="task-planner", prompt="...")

---

### 사용 가능한 Agents

EOF

# === Agents 탐색 함수 ===
scan_agents() {
  local base_dir="$1"
  local label="$2"

  if [ -d "$base_dir/agents" ]; then
    local found=false
    for agent_file in "$base_dir/agents"/*.md; do
      if [ -f "$agent_file" ]; then
        agent_name=$(basename "$agent_file" .md)

        # CLAUDE.md는 제외
        if [ "$agent_name" != "CLAUDE" ]; then
          if [ "$found" = false ]; then
            echo "#### $label"
            echo ""
            found=true
          fi
          local display_path
          if [[ "$agent_file" == "$GLOBAL_CLAUDE_DIR"* ]]; then
            display_path="~/.claude/agents/$agent_name.md"
          else
            display_path=".claude/agents/$agent_name.md"
          fi
          echo "**[$agent_name]** \`$display_path\`"
          echo '```yaml'
          head -6 "$agent_file"
          echo '```'
          echo ""
        fi
      fi
    done
  fi
}

# 프로젝트 Agents (우선)
scan_agents "$PROJECT_CLAUDE_DIR" "프로젝트 Agents (.claude/agents/)"

# 글로벌 Agents (다른 경우에만)
if [ "$PROJECT_CLAUDE_DIR" != "$GLOBAL_CLAUDE_DIR" ]; then
  scan_agents "$GLOBAL_CLAUDE_DIR" "글로벌 Agents (~/.claude/agents/)"
fi

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5 - 구현: 모든 관련 Skill 확인 및 Agent 호출 후에만 구현을 시작하세요.

---

### 중요

- **탐색 작업은 반드시 Subagent로**: Main Context 절약
- **구현 후 검증은 필수**: code-reviewer + qa-tester
- **단순 작업은 예외**: 설정 파일 수정, 오타 수정은 직접 처리 가능

지금 바로 모든 사용 가능한 Skill과 Agent를 평가하세요.
EOF
