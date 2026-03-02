---
name: post-detail-ui
description: 팔로워 포스트 상세페이지 UI - 피드에서 본문 열람, SEO 메타태그
keywords: [포스트상세, PostDetail, 피드, DOMPurify, Helmet, prose]
estimated_tokens: ~350
related_contexts:
  - business-access-control
  - codebase-post-entity
  - codebase-seo-implementation
---

# 포스트 상세페이지 UI

팔로워가 피드에서 포스트를 클릭하여 본문을 읽는 상세페이지 UI입니다. DOMPurify로 HTML을 안전하게 렌더링하고, react-helmet-async로 SEO 메타태그를 설정합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/컴포넌트 |
| ---- | ---- | ------------------- |
| apps/client/src/routes/posts/$postId.tsx | 포스트 상세 라우트 | PostDetailPage, Route (createFileRoute('/posts/$postId')) |
| apps/client/src/components/post/PostDetail.tsx | 포스트 상세 본문 렌더링 | PostDetail, PostDetailProps, ACCESS_LEVEL_LABEL |
| apps/client/src/components/feed/FeedCard.tsx | 피드 카드 (상세 링크) | FeedCard, FeedCardProps (postId prop 추가) |

## 핵심 흐름

1. 홈 피드(`/`) → FeedCard 클릭 → `/posts/$postId` 라우트로 이동
2. `PostDetailPage` → `trpc.post.getOne.useQuery({ postId })` 호출
3. 로딩/에러/정상 상태 분기 → `PostDetail` 컴포넌트 렌더링
4. `PostDetail` → DOMPurify.sanitize()로 HTML 본문 안전 렌더링 (prose 클래스)
5. react-helmet-async로 SEO 메타태그 설정 (title, og:title, og:description, og:image)

## 컴포넌트 계층

```
PostDetailPage (Route: /posts/$postId)
├── Helmet (SEO 메타태그)
└── PostDetail
    ├── AuthorHeader (프로필이미지, 닉네임, 작성일)
    ├── Title + AccessLevelBadge
    ├── Thumbnail (있는 경우)
    ├── ContentBody (DOMPurify sanitized HTML, prose)
    └── AuthorFooter (작성자 영역)
```

## tRPC 연동

- **Query**: `post.getOne` (인증 불필요, 선택적 userId로 권한 체크)
- 응답: post 기본 정보 + author 객체 (id, nickname, profileImage)

## 라이브러리

- `dompurify`: XSS 방지 (HTML 본문 sanitize)
- `@tailwindcss/typography`: prose 클래스 (리치 텍스트 스타일링)
- `tailwind-styled-components`: CSS-in-JS 스타일링

## ACCESS_LEVEL_LABEL

| accessLevel  | 라벨       |
| ------------ | ---------- |
| `subscriber` | 구독자 전용 |
| `purchaser`  | 구매자 전용 |
| `private`    | 비공개     |
| `public`     | (라벨 없음) |

## 관련 Business Context

- [access-control.md](../business/access-control.md): 접근 레벨 정책

## 관련 Codebase Context

- [post-entity.md](./post-entity.md): PostEntity 구조, tRPC Router
- [seo-implementation.md](./seo-implementation.md): Helmet SEO 패턴
- [post-manage-ui.md](./post-manage-ui.md): 에디터 측 포스트 관리 (비교)
