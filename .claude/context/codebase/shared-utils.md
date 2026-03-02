---
name: shared-utils
description: 프론트엔드 공통 유틸리티 함수 (날짜 포맷 등)
keywords: [유틸리티, utils, formatRelativeTime, 날짜]
estimated_tokens: ~150
related_contexts:
  - codebase-post-detail-ui
  - codebase-post-manage-ui
---

# 프론트엔드 공통 유틸리티

프론트엔드에서 여러 컴포넌트가 공용으로 사용하는 유틸리티 함수 모음입니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수 |
| ---- | ---- | --------- |
| apps/client/src/shared/utils/date.ts | 날짜 유틸리티 | formatRelativeTime(date) |

## 핵심 흐름

1. `formatRelativeTime(date)` → Date/string 입력 → 상대 시간 문자열 반환
2. 변환 규칙: "방금 전", "N분 전", "N시간 전", "N일 전", "N개월 전", "N년 전"

## 사용처

- `FeedCard`: 피드 목록에서 포스트 작성 시간 표시
- `PostDetail`: 포스트 상세페이지에서 작성일 표시
- `PostListItem`: 에디터 포스트 관리 목록에서 시간 표시

## 관련 Codebase Context

- [post-detail-ui.md](./post-detail-ui.md): PostDetail에서 사용
- [post-manage-ui.md](./post-manage-ui.md): PostListItem에서 사용
