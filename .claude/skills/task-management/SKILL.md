---
name: Task-Management
description: GitHub Project를 통한 태스크 관리. gh CLI 명령어, 우선순위 설정, 워크플로우.
keywords: [태스크, task, gh, github, project, 우선순위, priority]
estimated_tokens: ~600
---

# GitHub Project 태스크 관리

> **참고**: GitHub Project ID/옵션 값은 `.claude/skills/planning/pm-config.yml`에서 중앙 관리됩니다.
> 아래 테이블은 빠른 참조용이며, 값 변경 시 pm-config.yml을 우선 수정하세요.

## 프로젝트 정보

| 항목           | 값                                             |
| -------------- | ---------------------------------------------- |
| Project URL    | https://github.com/orgs/overdunenet/projects/4 |
| Project Number | 4                                              |
| Owner          | overdunenet                                    |

## gh CLI 명령어

### 태스크 조회

```bash
# 전체 목록
gh project item-list 4 --owner overdunenet

# JSON 상세 조회
gh project item-list 4 --owner overdunenet --format json
```

### 태스크 생성

```bash
# Draft 아이템 (빠른 추가)
gh project item-create 4 --owner overdunenet --title "태스크 제목"

# Issue로 생성 후 추가
gh issue create -R overdunenet/readly --title "제목" --body "내용"
gh project item-add 4 --owner overdunenet --url <issue-url>
```

### 태스크 상태 변경

```bash
# 상태 변경 (Status 필드)
gh project item-edit \
  --project-id PVT_kwDOBneqM84BOTlj \
  --id <item-id> \
  --field-id PVTSSF_lADOBneqM84BOTljzg9DAno \
  --single-select-option-id <status-option-id>
```

### 태스크 삭제

```bash
gh project item-delete 4 --owner overdunenet --id <item-id>
```

## Status 옵션

| Status      | Option ID | 설명                  |
| ----------- | --------- | --------------------- |
| Backlog     | f75ad846  | 백로그 (아직 시작 전) |
| Ready       | 61e4505c  | 준비됨 (시작 가능)    |
| In progress | 47fc9ee4  | 진행 중               |
| In review   | df73e18b  | 리뷰 중               |
| Done        | 98236657  | 완료                  |

## Priority 옵션

| Priority | Option ID | 설명                         |
| -------- | --------- | ---------------------------- |
| P0       | 79628723  | 긴급 - 즉시 처리 필요        |
| P1       | 0a877460  | 중요 - 현재 스프린트 내 처리 |
| P2       | da944a9c  | 보통 - 여유 있을 때 처리     |

## 필드 ID 참조

| 필드     | Field ID                       |
| -------- | ------------------------------ |
| Status   | PVTSSF_lADOBneqM84BOTljzg9DAno |
| Priority | PVTSSF_lADOBneqM84BOTljzg9DArc |

## /tasks 커맨드

세션 중 태스크 목록을 확인하려면:

```
/tasks
```

이 커맨드는 현재 프로젝트의 태스크를 조회하고 다음을 표시합니다:

- 진행 중인 태스크
- Ready 상태의 태스크 (우선순위순)
- P0 긴급 태스크 알림

## 태스크 관리 원칙

1. **한 번에 하나의 태스크만** In progress 상태로 유지
2. **P0은 즉시 처리** - 다른 작업 중이라도 전환
3. **완료 후 바로 Done** - 태스크 상태 업데이트 잊지 않기
4. **큰 태스크는 분할** - Sub-issue 활용
