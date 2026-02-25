---
name: post-manage-ui
description: 에디터 포스트 목록 관리 UI - 필터링, 검색, 발행/삭제 액션
keywords: [포스트관리, 에디터, PostListItem, 필터, 발행, 삭제]
estimated_tokens: ~300
---

# 포스트 관리 UI

에디터가 자신의 포스트를 목록으로 조회하고, 필터/검색/발행/삭제 등의 관리 작업을 수행하는 프론트엔드 모듈입니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/컴포넌트 |
| ---- | ---- | ------------------- |
| apps/client/src/routes/_auth/editor/posts/index.tsx | 포스트 관리 페이지 | PostsPage, statusFilter, searchQuery |
| apps/client/src/components/posts/manage/PostListItem.tsx | 포스트 목록 카드 | PostListItem, formatRelativeTime() |
| apps/client/src/components/posts/manage/PostStatusBadge.tsx | 상태 뱃지 | PostStatusBadge (draft/published/scheduled) |
| apps/client/src/components/posts/manage/PostAccessBadge.tsx | 접근레벨 뱃지 | PostAccessBadge (public/subscriber/purchaser/private) |
| apps/client/src/components/posts/manage/PostActions.tsx | 액션 드롭다운 | PostActions (수정/발행/삭제) |

## 핵심 흐름

1. `PostsPage` → `trpc.post.getMy` 호출 → 포스트 목록 조회
2. `statusFilter` + `searchQuery` → `useMemo`로 클라이언트 필터링
3. 각 포스트 → `PostListItem` 렌더링 (썸네일, 제목, 발췌, 뱃지, 액션)
4. 사용자 액션 → `trpc.post.publish/unpublish/delete` mutation → 캐시 무효화

## 컴포넌트 계층

```
PostsPage
├── Header (제목 + 새 포스트 작성 버튼)
├── Toolbar (FilterTabs + SearchInput)
└── PostList
    └── PostListItem[]
        ├── PostStatusBadge
        ├── PostAccessBadge
        └── PostActions → ConfirmModal (삭제 확인)
```

## tRPC 연동

- **Query**: `post.getMy` (내 포스트 목록)
- **Mutations**: `post.publish`, `post.unpublish`, `post.delete`
- 성공 시 `utils.post.getMy.invalidate()`로 캐시 무효화
- 실패 시 `AlertModal`로 에러 메시지 표시

## 스타일링

- `tailwind-styled-components` 기반 CSS-in-JS
- `lucide-react` 아이콘 (FileText, Plus, Search, Lock, Eye, EyeOff, Pencil, Trash2, MoreVertical)
- 반응형: 모바일에서 썸네일 숨김 (sm 브레이크포인트)

## 관련 Business Context

- [overview.md](../business/overview.md): 에디터 포스트 발행 흐름
- [access-control.md](../business/access-control.md): 접근 레벨 정책

## 관련 Codebase Context

- [post-entity.md](./post-entity.md): PostEntity 구조, tRPC Router 엔드포인트
- [post-editor.md](./post-editor.md): CKEditor 포스트 작성 UI
