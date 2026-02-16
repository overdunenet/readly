#!/bin/bash
# 세션 시작 시 GitHub Project 태스크 조회

# gh CLI 확인
if ! command -v gh &> /dev/null; then
  exit 0
fi

# 프로젝트 태스크 조회
TASKS=$(gh project item-list 4 --owner overdunenet --format json 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "⚠️ GitHub Project 접근 실패. 권한 확인: gh auth refresh -s read:project,project"
  exit 0
fi

# 태스크 개수 확인 (Done 상태 제외)
TOTAL=$(echo "$TASKS" | jq '[.items[] | select(.status != "Done")] | length')

if [ "$TOTAL" -eq 0 ]; then
  exit 0
fi

{
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Readly 태스크 현황"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  printf "%-8s │ %-6s │ %-14s │ %-40s\n" "Priority" "#" "Status" "Title"
  echo "─────────┼────────┼────────────────┼──────────────────────────────────────────"

  # 태스크 출력 (Done 제외, Priority 순: P0 → P1 → P2 → 없음)
  # jq에서 Issue 번호를 직접 포맷: Issue → #번호, DraftIssue → "draft"
  echo "$TASKS" | jq -r '
    .items
    | map(select(.status != "Done"))
    | sort_by(
        if .priority == "P0" then 0
        elif .priority == "P1" then 1
        elif .priority == "P2" then 2
        else 3 end
      )
    | .[]
    | "\(.priority // "-")\t\(if .content.type == "Issue" and .content.number then "#\(.content.number)" else "draft" end)\t\(.status // "-")\t\(.title)"
  ' | {
    draft_idx=0
    while IFS=$'\t' read -r priority issue_no task_status title; do
      # DraftIssue는 순번 부여
      if [ "$issue_no" = "draft" ]; then
        draft_idx=$((draft_idx + 1))
        issue_no="D-${draft_idx}"
      fi
      # Title 길이 제한 (37자)
      if [ ${#title} -gt 37 ]; then
        title="${title:0:37}..."
      fi
      printf "%-8s │ %-6s │ %-14s │ %-40s\n" "$priority" "$issue_no" "$task_status" "$title"
    done
  }

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💡 /tasks 로 상세 목록 확인 | 진행중: ${TOTAL}개"
  echo ""
} > /dev/tty

exit 0
