---
description: PM 기획 워크플로우 진입 (Milestone/Feature/Issue/CIS)
---

# /pm — PM 기획 워크플로우

pm-planner subagent를 Task 도구로 즉시 호출하세요.

**중요 지시**:

- Skill/Agent 평가 출력, workflow_protocol Phase1, Context 수집 등 **어떤 전처리도 수행하지 않습니다**.
- pm-planner에게 "pm-planner.md의 <instructions> Step 1부터 즉시 실행 (AskUserQuestion으로 3가지 메뉴 제시)"를 지시합니다.
- pm-planner 호출 시 사용자 원본 입력($ARGUMENTS)을 그대로 전달합니다.

호출 예시:

```
Task(subagent_type="pm-planner", description="PM 워크플로우 진입", prompt="사용자 입력: $ARGUMENTS\n\npm-planner.md의 <instructions> Step 1을 즉시 실행하세요. AskUserQuestion으로 New Task / Edit Task / Context Making 3메뉴를 제시하세요.")
```
