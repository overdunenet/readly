# F3. 글쓰기 & 발행 - Implementation Guide

> 본 문서는 F3 PRD를 기반으로, 현재 코드베이스를 분석하여 작성한 구현 가이드입니다.
> 백엔드 아키텍처 중심으로 설계하되, 프론트엔드 변경 사항도 포함합니다.
>
> 작성일: 2026-03-25
> PRD 버전: approved (Phase A-E 완료)

---

## A. 현재 구현 상태 분석

### A.1. 백엔드 현재 상태

| 구성 요소          | 파일 경로                                                       | 현재 상태                                                                                               |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| PostEntity         | `apps/api/src/module/domain/post.entity.ts`                     | 기본 CRUD + DDD 패턴 (create, edit, publish, unpublish, canBeEditedBy, canBeReadBy)                     |
| PostService        | `apps/api/src/module/post/post.service.ts`                      | createPost, updatePost, publishPost, unpublishPost, deletePost, getPost, getMyPosts, getAccessiblePosts |
| PostRouter         | `apps/api/src/module/post/post.router.ts`                       | create, update, publish, unpublish, delete, getOne, getMy, getAccessible                                |
| PostController     | `apps/api/src/module/post/post.controller.ts`                   | MessagePattern 기반 마이크로서비스 컨트롤러                                                             |
| RepositoryProvider | `apps/api/src/module/shared/transaction/repository.provider.ts` | Post, User, Follow, SocialAccount, Otp, Payment, Cash 레포지토리 등록                                   |

**PostEntity 현재 컬럼:**

```
id (uuid PK), title (varchar), freeContent (text), paidContent (text, nullable),
contentType (enum: text/image/mixed, default 'text'),
excerpt (text nullable), thumbnail (varchar nullable),
accessLevel (enum: public/subscriber/purchaser/private, default 'public'),
status (varchar, default 'draft'), price (int, default 0),
publishedAt (timestamptz nullable), authorId (uuid FK -> users),
createdAt, updatedAt, deletedAt
```

**posts 테이블 마이그레이션:** `1753715719917-posts.ts`

### A.2. 프론트엔드 현재 상태

| 구성 요소             | 파일 경로                                                            | 현재 상태                                                                       |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 내 서점 관리 레이아웃 | `apps/client/src/routes/_auth/editor.tsx`                            | EditorHeader + EditorLeftMenu + Outlet (내 서점 관리)                           |
| EditorHeader          | `apps/client/src/components/editor/EditorHeader.tsx`                 | 로고 + 검색/알림/유저 메뉴 (내 서점 관리 헤더)                                  |
| EditorLeftMenu        | `apps/client/src/components/editor/EditorLeftMenu.tsx`               | 대시보드/포스트관리/통계/수익/설정 사이드바                                     |
| CKEditor 통합         | `apps/client/src/components/posts/create/FormEditorSection.tsx`      | CKEditor 5 ClassicEditor, 기본 플러그인 (Bold, Italic, Heading, Link, Image 등) |
| 헤더 섹션             | `apps/client/src/components/posts/create/HeaderSection.tsx`          | 뒤로가기, 임시저장/발행 버튼 (단순 버튼)                                        |
| 권한/가격 섹션        | `apps/client/src/components/posts/create/PermissionPriceSection.tsx` | 접근 권한 4종 라디오 + 구매자 전용 시 가격 입력                                 |
| 인증 스토어           | `apps/client/src/stores/auth.ts`                                     | Zustand 기반 AuthState                                                          |
| 라우팅                | `apps/client/src/routes/__root.tsx`                                  | TanStack Router, 자동 인증 갱신                                                 |

**CKEditor 현재 설정:**

```typescript
plugins: [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  BlockQuote,
  CodeBlock,
  Link,
  Image,
  ImageInsert,
  Base64UploadAdapter,
  RemoveFormat,
];
```

### A.3. PRD 대비 Gap 분석 요약

| 영역            | 이미 구현                                                                                                       | 새로 필요                                                                                 | 변경/확장 필요                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| PostEntity      | title, freeContent, paidContent, contentType, excerpt, thumbnail, accessLevel(enum), price, status, publishedAt | paywallPosition, tags, seriesId, episodeNumber, viewerBadge, bookstoreId(F2)              | excerpt를 summary 역할로 활용, publish() 확장, 서버 사이드 content split/merge 로직 추가 |
| DraftEntity     | -                                                                                                               | 전체 신규 (drafts 테이블)                                                                 | -                                                                                        |
| SeriesEntity    | -                                                                                                               | 전체 신규 (series 테이블)                                                                 | -                                                                                        |
| PostService     | 기본 CRUD + 발행                                                                                                | -                                                                                         | publish 확장 (메타데이터 + viewerBadge 계산 + draft 정리)                                |
| DraftService    | -                                                                                                               | 전체 신규 (save, getList, getById, delete, cleanup)                                       | -                                                                                        |
| SeriesService   | -                                                                                                               | 전체 신규 (create, getByBookstore, getNextEpisodeNumber)                                  | -                                                                                        |
| CKEditor        | 기본 서식 플러그인                                                                                              | PaywallDivider 플러그인 (Option A: HTML 마커 경량 방식 / Option B: 커스텀 위젯 고급 방식) | 툴바에 게시선 버튼 추가                                                                  |
| 내 서점 관리 UI | /editor 내 서점 관리                                                                                            | /write 몰입형 에디터 라우트                                                               | -                                                                                        |
| 발행 UI         | 단순 버튼 클릭                                                                                                  | PublishSheet 바텀시트                                                                     | HeaderSection 발행 플로우 변경                                                           |
| 임시저장        | PostEntity status='draft'                                                                                       | DraftAutoSave 훅, DraftListModal                                                          | 개념 분리 (Post draft != 임시저장 스냅샷)                                                |
| 미리보기        | -                                                                                                               | PreviewModal 전체 신규                                                                    | -                                                                                        |

---

## B. 데이터베이스 아키텍처 설계

### B.1. 설계 결정 사항

| #   | 결정                                                  | 근거                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1 | `excerpt` 컬럼을 PRD의 "summary" 역할로 재사용        | 동일한 목적 (본문 요약). 컬럼 추가 불필요, 기존 데이터 보존                                                                                                                                                                                        |
| D-2 | `thumbnail` 컬럼을 PRD의 "thumbnailUrl" 역할로 재사용 | 이미 varchar URL 저장용. 컬럼명 변경 불필요                                                                                                                                                                                                        |
| D-3 | Draft를 별도 `drafts` 테이블로 분리                   | Post.status='draft'는 "미발행 포스트"이고, Draft는 "작성 중 스냅샷". 생명주기가 다름. 최대 5개 버전 관리 필요                                                                                                                                      |
| D-4 | 서버 사이드 Content Split/Merge 방식 채택             | 에디터에서는 단일 HTML로 작성하되, 서버 저장 시 paywall 마커(`<hr class="paywall-divider">`) 기준으로 freeContent/paidContent로 split. 불러올 때는 merge하여 단일 HTML로 에디터에 전달. `paywallPosition`은 CKEditor model offset 정수로 별도 저장 |
| D-5 | `tags`는 jsonb 배열로 저장                            | 태그 검색 최적화보다 유연성 우선 (MVP). GIN 인덱스 향후 추가 가능                                                                                                                                                                                  |
| D-6 | `viewerBadge`는 발행 시점에 계산하여 저장             | 매 조회 시 계산하지 않고, 발행/수정 시 한 번 계산. 조건: 시리즈 소속 AND 본문 1000자 이상                                                                                                                                                          |

### B.2. PostEntity 확장

```
기존 컬럼 (유지/변경)
─────────────────────────
id, title, freeContent (기존 content에서 분리), paidContent (nullable, 기존 content에서 분리),
contentType (enum: text/image/mixed), excerpt, thumbnail,
accessLevel (enum: public/subscriber/purchaser/private), status,
price, publishedAt, authorId, createdAt, updatedAt, deletedAt

새로 추가할 컬럼
─────────────────────────
paywall_position  INTEGER     NULLABLE    게시선 위치 (CKEditor model offset)
tags              JSONB       NULLABLE    태그 배열 (예: ["소설","로맨스"])
series_id         UUID        NULLABLE    FK -> series(id)
episode_number    INTEGER     NULLABLE    시리즈 내 회차 번호
viewer_badge      BOOLEAN     DEFAULT false    전자책 뷰어 표시 여부
bookstore_id      UUID        NOT NULL*   FK -> bookstores(id)   ← F2 선행
```

> \*bookstore_id NOT NULL 제약은 F2에서 bookstores 테이블 생성 후 추가. F3 마이그레이션에서는 F2 마이그레이션이 선행 완료되었음을 전제.

**PostEntity.ts 변경 코드 구조:**

```typescript
// 기존 content 컬럼을 freeContent/paidContent로 분리 (서버 사이드 split)
@Column({ type: 'text', comment: '무료 공개 콘텐츠 (paywall 마커 이전 영역)' })
freeContent: string;

@Column({ type: 'text', nullable: true, comment: '유료 콘텐츠 (paywall 마커 이후 영역, 무료 글이면 null)' })
paidContent: string | null;

@Column({ type: 'enum', enum: ['text', 'image', 'mixed'], default: 'text', comment: '콘텐츠 유형' })
contentType: 'text' | 'image' | 'mixed';

// accessLevel을 enum 타입으로 변경
@Column({ type: 'enum', enum: ['public', 'subscriber', 'purchaser', 'private'], default: 'public', comment: '접근 권한' })
accessLevel: 'public' | 'subscriber' | 'purchaser' | 'private';

// 추가할 컬럼
@Column({ type: 'int', nullable: true, comment: '유료 게시선 위치 (CKEditor model offset)' })
paywallPosition: number | null;

@Column({ type: 'jsonb', nullable: true, comment: '태그 배열' })
tags: string[] | null;

@Column({ type: 'uuid', nullable: true, comment: '소속 시리즈 ID' })
seriesId: string | null;

@ManyToOne(() => SeriesEntity, { nullable: true })
@JoinColumn({ name: 'series_id' })
series: SeriesEntity | null;

@Column({ type: 'int', nullable: true, comment: '시리즈 회차 번호' })
episodeNumber: number | null;

@Column({ type: 'boolean', default: false, comment: '전자책 뷰어 안내 배지' })
viewerBadge: boolean;

@Column({ type: 'uuid', comment: '서점 ID' })
bookstoreId: string;

@ManyToOne(() => BookstoreEntity)
@JoinColumn({ name: 'bookstore_id' })
bookstore: BookstoreEntity;
```

**edit() 메서드 확장:**

```typescript
edit(input: {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  contentType?: 'text' | 'image' | 'mixed';
  excerpt?: string;
  thumbnail?: string;
  accessLevel?: PostAccessLevel;
  price?: number;
  // --- 추가 ---
  paywallPosition?: number | null;
  tags?: string[] | null;
  seriesId?: string | null;
  episodeNumber?: number | null;
}): void { ... }
```

**publish() 메서드 확장:**

```typescript
publish(input?: {
  paywallPosition?: number | null;
  tags?: string[] | null;
  seriesId?: string | null;
  episodeNumber?: number | null;
  accessLevel?: PostAccessLevel;
  price?: number;
  excerpt?: string;
  thumbnail?: string;
}): void {
  if (this.status === 'published') {
    throw new Error('Post is already published');
  }

  // 발행 시 메타데이터 반영
  if (input) {
    this.edit(input);
  }

  // viewerBadge 자동 계산
  this.viewerBadge = this.calculateViewerBadge();

  this.status = 'published';
  this.publishedAt = new Date();
}

private calculateViewerBadge(): boolean {
  const isSeriesPost = this.seriesId !== null;
  const freeLen = this.freeContent?.replace(/<[^>]*>/g, '').length ?? 0;
  const paidLen = this.paidContent?.replace(/<[^>]*>/g, '').length ?? 0;
  return isSeriesPost && (freeLen + paidLen) >= 1000;
}
```

### B.3. 서버 사이드 Content Split/Merge 로직

에디터에서는 단일 HTML로 콘텐츠를 작성하지만, 서버에 저장할 때는 paywall 마커를 기준으로 freeContent/paidContent로 분리하여 저장한다.

**저장 시 (Split):**

```typescript
// 에디터 → 서버: 단일 HTML을 paywall 마커 기준으로 split
function splitContentByPaywall(html: string): {
  freeContent: string;
  paidContent: string | null;
} {
  const marker = '<hr class="paywall-divider"';
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) {
    // 게시선 없음 = 무료 글, 전체가 freeContent
    return { freeContent: html, paidContent: null };
  }

  // 마커 태그 전체를 찾아서 분리
  const markerEndIndex = html.indexOf('>', markerIndex) + 1;
  const freeContent = html.substring(0, markerIndex).trim();
  const paidContent = html.substring(markerEndIndex).trim();

  return { freeContent, paidContent: paidContent || null };
}
```

**불러올 때 (Merge):**

```typescript
// 서버 → 에디터: freeContent + paidContent를 paywall 마커 삽입하여 merge
function mergeContentWithPaywall(
  freeContent: string,
  paidContent: string | null
): string {
  if (!paidContent) {
    return freeContent;
  }

  return `${freeContent}<hr class="paywall-divider" />${paidContent}`;
}
```

**독자 뷰 (보안):**

```typescript
// 독자에게 응답 시: 결제/구독 상태에 따라 paidContent 포함 여부 결정
function getContentForReader(
  post: PostEntity,
  hasAccess: boolean
): { freeContent: string; paidContent: string | null } {
  return {
    freeContent: post.freeContent,
    paidContent: hasAccess ? post.paidContent : null, // 접근 권한 없으면 미전송
  };
}
```

| 시나리오                 | freeContent | paidContent   | 설명                                    |
| ------------------------ | ----------- | ------------- | --------------------------------------- |
| 무료 글 (게시선 없음)    | 전체 본문   | null          | 모든 독자에게 freeContent 전달          |
| 유료 글 + 접근 권한 있음 | 게시선 이전 | 게시선 이후   | 양쪽 모두 전달                          |
| 유료 글 + 접근 권한 없음 | 게시선 이전 | null (미전송) | freeContent만 전달 + "유료 콘텐츠" 안내 |

### B.4. 새 Entity: DraftEntity

```
drafts 테이블
─────────────────────────
id              UUID        PK, DEFAULT uuid_generate_v4()
user_id         UUID        NOT NULL, FK -> users(id)
post_id         UUID        NULLABLE, FK -> posts(id)    ← 새 글: null, 수정: postId
title           VARCHAR     NULLABLE
content         TEXT        NULLABLE
paywall_position INTEGER    NULLABLE
metadata        JSONB       NULLABLE    ← { tags, accessLevel, price, seriesId, episodeNumber, excerpt, thumbnail }
saved_at        TIMESTAMPTZ NOT NULL
type            VARCHAR     NOT NULL    ← 'auto' | 'manual' | 'edit_snapshot'
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

**DraftEntity.ts 구조:**

```typescript
export type DraftType = 'auto' | 'manual' | 'edit_snapshot';

@Entity('drafts')
export class DraftEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '작성자 ID' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: '연결된 포스트 ID (수정 시)',
  })
  postId: string | null;

  @ManyToOne(() => PostEntity, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity | null;

  @Column({ type: 'varchar', nullable: true, comment: '제목' })
  title: string | null;

  @Column({ type: 'text', nullable: true, comment: '본문' })
  content: string | null;

  @Column({ type: 'int', nullable: true, comment: '게시선 위치' })
  paywallPosition: number | null;

  @Column({ type: 'jsonb', nullable: true, comment: '발행 설정 스냅샷' })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', comment: '저장 시점' })
  savedAt: Date;

  @Column({ type: 'varchar', comment: '저장 유형 (auto/manual)' })
  type: DraftType;
}
```

**Draft 메타데이터 JSONB 스키마:**

```typescript
interface DraftMetadata {
  tags?: string[];
  accessLevel?: PostAccessLevel;
  price?: number;
  seriesId?: string;
  episodeNumber?: number;
  excerpt?: string;
  thumbnail?: string;
}
```

### B.5. 새 Entity: SeriesEntity

```
series 테이블
─────────────────────────
id              UUID        PK, DEFAULT uuid_generate_v4()
bookstore_id    UUID        NOT NULL, FK -> bookstores(id)
name            VARCHAR     NOT NULL
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

**SeriesEntity.ts 구조:**

```typescript
@Entity('series')
export class SeriesEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '서점 ID' })
  bookstoreId: string;

  @ManyToOne(() => BookstoreEntity)
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({ type: 'varchar', comment: '시리즈명' })
  name: string;

  @OneToMany(() => PostEntity, post => post.series)
  posts: PostEntity[];
}
```

### B.6. ERD 관계도

```
                    ┌──────────┐
                    │  users   │
                    └────┬─────┘
                         │ 1:N
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │bookstores│ │  posts   │ │  drafts  │
      └────┬─────┘ └─┬──┬──┬─┘ └──────────┘
           │         │  │  │         ▲
           │ 1:N     │  │  │         │ N:1 (postId nullable)
           ▼         │  │  │    ┌────┘
      ┌──────────┐   │  │  │    │
      │  series  │◄──┘  │  │    │
      └──────────┘  N:1 │  │    │
                        │  │    │
            series_id───┘  │    │
            bookstore_id───┘    │
            post_id─────────────┘

  Key Relations:
  - User 1:N Post (authorId)
  - User 1:N Draft (userId)
  - Bookstore 1:N Post (bookstoreId)     ← F2 선행
  - Bookstore 1:N Series (bookstoreId)   ← F2 선행
  - Series 1:N Post (seriesId, nullable)
  - Post 1:N Draft (postId, nullable)
```

### B.7. 마이그레이션 계획

| 순서 | 마이그레이션               | 선행 조건         | 설명                                                                                                                                                                           |
| ---- | -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0    | (F2) CreateBookstoresTable | F1 완료           | bookstores 테이블 생성                                                                                                                                                         |
| 0    | (F2) AddBookstoreIdToPosts | bookstores 존재   | posts에 bookstore_id FK 추가                                                                                                                                                   |
| 1    | CreateSeriesTable          | bookstores 존재   | series 테이블 생성, FK: bookstore_id -> bookstores                                                                                                                             |
| 2    | ExtendPostsForWriting      | series 존재       | posts의 content→free_content/paid_content 분리, content_type enum 추가, access_level을 enum으로 변경, paywall_position, tags, series_id(FK), episode_number, viewer_badge 추가 |
| 3    | CreateDraftsTable          | users, posts 존재 | drafts 테이블 생성, FK: user_id -> users, post_id -> posts                                                                                                                     |

> 마이그레이션 0번은 F2 범위. F3 마이그레이션은 1~3번만 담당.
> 생성 명령: `npx typeorm migration:create src/database/migration/<MigrationName>` (apps/api/ 디렉토리)
> SnakeNamingStrategy 적용: Entity 속성 camelCase -> DB 컬럼 snake_case

---

## C. 백엔드 API 설계

### C.1. PostRouter 변경사항

**스키마 확장:**

```typescript
// editPostInputSchema 확장
// 에디터에서는 단일 content(HTML)를 전송, 서버에서 split하여 freeContent/paidContent로 저장
const editPostInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(), // 에디터 → 서버: 단일 HTML (서버에서 split)
  contentType: z.enum(['text', 'image', 'mixed']).optional(),
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  accessLevel: z
    .enum(['public', 'subscriber', 'purchaser', 'private'])
    .optional(),
  price: z.number().int().min(100).max(100000).multipleOf(100).optional(), // 100~100,000원, 100원 단위
  // --- 추가 ---
  paywallPosition: z.number().int().min(0).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  seriesId: z.string().uuid().nullable().optional(),
  episodeNumber: z.number().int().min(1).nullable().optional(),
});

// publishInputSchema (신규)
// 발행 시에도 에디터에서 단일 content를 전송, 서버에서 split 후 저장
const publishInputSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).optional(), // 에디터 → 서버: 단일 HTML (서버에서 split)
  contentType: z.enum(['text', 'image', 'mixed']).optional(),
  paywallPosition: z.number().int().min(0).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  seriesId: z.string().uuid().nullable().optional(),
  episodeNumber: z.number().int().min(1).nullable().optional(),
  accessLevel: z
    .enum(['public', 'subscriber', 'purchaser', 'private'])
    .optional(),
  price: z.number().int().min(100).max(100000).multipleOf(100).optional(), // 100~100,000원, 100원 단위
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
});

// postResponseSchema 확장
// 독자 뷰에서는 접근 권한에 따라 paidContent가 null일 수 있음 (B.3 참조)
const postResponseSchema = z.object({
  // ... 기존 필드 (title, excerpt, thumbnail, status, publishedAt, authorId, ...) ...
  freeContent: z.string(),
  paidContent: z.string().nullable(), // 접근 권한 없으면 null (서버에서 필터링)
  contentType: z.enum(['text', 'image', 'mixed']),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
  paywallPosition: z.number().nullable(),
  tags: z.array(z.string()).nullable(),
  seriesId: z.string().nullable(),
  episodeNumber: z.number().nullable(),
  viewerBadge: z.boolean(),
  bookstoreId: z.string(),
});
```

**publish mutation 변경:**

```typescript
// Before: 단순 publish (postId만)
@Mutation({ input: z.object({ postId: z.string() }) })
async publish(ctx, postId) { ... }

// After: 메타데이터 포함 publish
@Mutation({ input: publishInputSchema })
async publish(ctx, input) {
  return this.microserviceClient.send('post.publish', {
    postId: input.postId,
    authorId: ctx.user.sub,
    publishInput: input,
  });
}
```

**create mutation 변경:**

```typescript
// Before: title + content 필수
// After: bookstoreId 필수 추가
@Mutation({
  input: editPostInputSchema
    .required({ title: true, content: true })
    .extend({ bookstoreId: z.string().uuid() }),
})
async create(ctx, input) {
  return this.microserviceClient.send('post.create', {
    authorId: ctx.user.sub,
    input,
  });
}
```

### C.2. 새 DraftRouter

```typescript
@Router({ alias: 'draft' })
export class DraftRouter extends BaseTrpcRouter {

  // 임시저장 (자동/수동)
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string().uuid().nullable().optional(),
      title: z.string().nullable().optional(),
      content: z.string().nullable().optional(),
      paywallPosition: z.number().int().nullable().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
      type: z.enum(['auto', 'manual', 'edit_snapshot']),
    }),
  })
  async save(ctx, input) { ... }

  // 임시저장 목록 (최근 5개)
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({
      postId: z.string().uuid().nullable().optional(),
    }).optional(),
  })
  async getList(ctx, input?) { ... }

  // 임시저장 상세
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({ draftId: z.string().uuid() }),
  })
  async getById(ctx, draftId) { ... }

  // 임시저장 삭제
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({ draftId: z.string().uuid() }),
  })
  async delete(ctx, draftId) { ... }

  // 발행 완료 시 정리
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({ postId: z.string().uuid() }),
  })
  async cleanupByPostId(ctx, postId) { ... }
}
```

### C.3. 새 SeriesRouter

```typescript
@Router({ alias: 'series' })
export class SeriesRouter extends BaseTrpcRouter {

  // 즉석 시리즈 생성
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      bookstoreId: z.string().uuid(),
      name: z.string().min(1).max(100),
    }),
  })
  async create(ctx, input) { ... }

  // 서점의 시리즈 목록
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({ bookstoreId: z.string().uuid() }),
  })
  async getByBookstore(ctx, bookstoreId) { ... }

  // 다음 회차 번호
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({ seriesId: z.string().uuid() }),
  })
  async getNextEpisodeNumber(ctx, seriesId) { ... }
}
```

### C.4. Service 레이어 상세

**DraftService:**

```typescript
@Injectable()
export class DraftService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  // 임시저장 (5개 초과 시 가장 오래된 auto 삭제)
  async save(userId: string, input: SaveDraftInput): Promise<DraftEntity> {
    const draft = DraftEntity.create({ ...input, userId });
    const saved = await this.repositoryProvider.DraftRepository.save(draft);

    // 5개 초과 시 오래된 auto 삭제 (수동 우선 보존)
    await this.enforceLimit(userId, input.postId);

    return saved;
  }

  // 최근 5개 조회
  async getList(userId: string, postId?: string): Promise<DraftEntity[]> {
    return this.repositoryProvider.DraftRepository.find({
      where: { userId, ...(postId ? { postId } : {}) },
      order: { savedAt: 'DESC' },
      take: 5,
    });
  }

  // 발행 완료 시 해당 postId의 모든 draft 삭제
  async cleanupByPostId(userId: string, postId: string): Promise<void> {
    await this.repositoryProvider.DraftRepository.delete({ userId, postId });
  }

  // 빈 내용 저장 스킵 (E-09)
  private isEmptyDraft(input: SaveDraftInput): boolean {
    return !input.title?.trim() && !input.content?.trim();
  }

  // 5개 제한 강제 (E-06)
  private async enforceLimit(userId: string, postId?: string): Promise<void> {
    const drafts = await this.repositoryProvider.DraftRepository.find({
      where: { userId, ...(postId ? { postId } : {}) },
      order: { savedAt: 'DESC' },
    });

    if (drafts.length > 5) {
      // 수동 저장본 및 edit_snapshot 우선 보존: auto를 먼저 삭제
      const toDelete = drafts.slice(5).sort((a, b) => {
        if (a.type === 'auto' && b.type !== 'auto') return -1;
        if (a.type !== 'auto' && b.type === 'auto') return 1;
        return 0;
      });
      await this.repositoryProvider.DraftRepository.remove(toDelete);
    }
  }
}
```

**PostService 확장 (publishPost):**

```typescript
async publishPost(
  postId: string,
  authorId: string,
  publishInput?: PublishPostInput
): Promise<PostEntity> {
  return this.repositoryProvider.transaction(async (tx) => {
    const postRepo = getPostRepository(tx);
    const draftRepo = getDraftRepository(tx);

    const post = await postRepo.findOneByIdForEdit(postId, authorId);

    // 메타데이터 포함 발행
    post.publish(publishInput);
    const saved = await postRepo.save(post);

    // 발행 완료 시 임시저장 정리
    await draftRepo.delete({ userId: authorId, postId });

    return saved;
  });
}
```

**SeriesService:**

```typescript
@Injectable()
export class SeriesService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async create(bookstoreId: string, name: string): Promise<SeriesEntity> {
    const series = new SeriesEntity();
    series.bookstoreId = bookstoreId;
    series.name = name;
    return this.repositoryProvider.SeriesRepository.save(series);
  }

  async getByBookstore(bookstoreId: string): Promise<SeriesEntity[]> {
    return this.repositoryProvider.SeriesRepository.find({
      where: { bookstoreId },
      order: { createdAt: 'DESC' },
    });
  }

  // 트랜잭션 내 처리로 race condition 방지 (E-11)
  async getNextEpisodeNumber(seriesId: string): Promise<number> {
    const result =
      await this.repositoryProvider.PostRepository.createQueryBuilder('post')
        .select('MAX(post.episodeNumber)', 'maxEpisode')
        .where('post.seriesId = :seriesId', { seriesId })
        .getRawOne();

    return (result?.maxEpisode ?? 0) + 1;
  }
}
```

### C.5. 트랜잭션 경계

| 작업             | 트랜잭션 범위                                 | 이유                          |
| ---------------- | --------------------------------------------- | ----------------------------- |
| 발행             | Post 업데이트 + viewerBadge 계산 + Draft 정리 | 발행과 정리가 원자적이어야 함 |
| 시리즈 회차 할당 | 최대 회차 조회 + 포스트 저장                  | race condition 방지           |
| 유료->무료 전환  | 게시선 삭제 + 가격 0으로 변경                 | 일관성 보장                   |

### C.6. RepositoryProvider 확장

```typescript
// repository.provider.ts에 추가
get DraftRepository() {
  return getDraftRepository(this.transaction);
}

get SeriesRepository() {
  return getSeriesRepository(this.transaction);
}
```

### C.7. 새 모듈 등록

```typescript
// draft.module.ts
@Module({
  imports: [SharedModule],
  controllers: [DraftController],
  providers: [DraftService],
  exports: [DraftService],
})
export class DraftModule {}

// series.module.ts
@Module({
  imports: [SharedModule],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
```

---

## D. 프론트엔드 변경 사항

### D.1. 라우팅 구조

```
현재 구조                          PRD 요구 구조
─────────────                      ─────────────
/editor         (내 서점 관리)      /editor         (내 서점 관리 - 유지, 향후 /my-bookstore 이전 검토)
/editor/posts   (포스트 목록)      /editor/posts   (유지)
                                   /write          (새 글 - 몰입형 에디터) ← 신규
                                   /write/:postId  (글 수정 - 몰입형 에디터) ← 신규
```

**새 라우트 파일:**

- `apps/client/src/routes/_auth/write.tsx` - 몰입형 에디터 레이아웃 (사이드바 없음, 최소 헤더)
- `apps/client/src/routes/_auth/write.$postId.tsx` - 기존 글 수정 (같은 레이아웃, postId로 내용 로드)

**몰입형 에디터 레이아웃 특징:**

- EditorHeader/EditorLeftMenu 사용하지 않음
- 최소 헤더: 뒤로가기 + 자동저장 상태 + 임시저장 버튼 + 발행하기 버튼
- 전체 화면 에디터 (제목 + 본문)
- 하단 상태 바 (유료 발행 예정 / 자동 저장 시간)

### D.2. 유료 게시선 (PaywallDivider) 구현

> PRD 리뷰 후 개발자가 프로젝트 상황에 맞는 옵션을 선택할 수 있도록 두 가지 구현 방식을 병렬로 제시한다.
> 참고: 투비컨티뉴드(tobe-continued), 포스타입(postype)의 유료 게시선 에디터 구현 사례

#### Option A: HTML 마커 삽입 방식 (경량)

CKEditor의 기존 `HorizontalLine` 플러그인 또는 `HTML embed` 기능을 커스터마이징하여, HTML 마커 기반으로 유료 경계를 표시하는 방식.

**구현 구조:**

```
apps/client/src/components/editor/plugins/
  paywall-divider/
    PaywallDividerPlugin.ts       (HorizontalLine 확장 또는 HTML embed 래퍼)
    paywall-divider.css           (게시선 스타일)
```

**핵심 동작:**

1. **삽입**: 툴바 버튼 클릭 시 `<hr class="paywall-divider" />` HTML 마커를 본문에 삽입
2. **렌더링**: CSS로 `hr.paywall-divider`를 시각적 게시선으로 스타일링 ("여기부터 유료 콘텐츠" 라벨 표시)
3. **제한**: 게시선 1개만 허용, 이미 존재하면 버튼 비활성화
4. **삭제**: 게시선 선택 후 Delete/Backspace
5. **저장**: 서버에서 `<hr class="paywall-divider" />` 마커 기준으로 freeContent/paidContent split
6. **불러오기**: freeContent + paidContent를 마커 삽입하여 merge 후 에디터에 로드

**paywallPosition 추출:**

```typescript
// HTML content에서 게시선 마커 위치 추출
function getPaywallPosition(htmlContent: string): number | null {
  const marker = '<hr class="paywall-divider"';
  const index = htmlContent.indexOf(marker);
  if (index === -1) return null;

  // 마커 이전의 블록 엘리먼트 수를 offset으로 계산
  const beforeMarker = htmlContent.substring(0, index);
  const blockCount = (
    beforeMarker.match(/<\/(p|h[1-6]|blockquote|pre|li|div)>/g) || []
  ).length;
  return blockCount;
}
```

**장점:**

- 기존 CKEditor 플러그인 구조(HorizontalLine) 재활용 가능, 개발 비용 낮음
- 플러그인 아키텍처 학습 곡선 최소화
- 빠른 MVP 검증에 적합

**단점:**

- 드래그로 위치 이동 등 고급 인터랙션 제한
- HR 엘리먼트 기반이므로 커스텀 UI 표현에 한계

---

#### Option B: CKEditor 커스텀 위젯 플러그인 (고급)

CKEditor 5의 Widget API를 활용하여 PaywallDivider 전용 플러그인을 풀 커스텀으로 개발하는 방식. Schema, Conversion, Command, UI를 모두 직접 구현한다.

**구현 구조:**

```
apps/client/src/components/editor/plugins/
  paywall-divider/
    PaywallDividerPlugin.ts       (메인 플러그인 - Plugin 통합)
    PaywallDividerEditing.ts      (Schema 정의 + 모델<->뷰 Conversion)
    PaywallDividerUI.ts           (툴바 버튼)
    PaywallDividerCommand.ts      (삽입/삭제 커맨드)
    paywall-divider.css           (게시선 스타일)
```

**핵심 동작:**

1. **삽입**: 커서 위치에 `paywallDivider` 커스텀 모델 엘리먼트 삽입
2. **렌더링**: `<div class="paywall-divider">여기부터 유료 콘텐츠</div>` 위젯으로 변환
3. **드래그**: CKEditor Widget API의 DnD 지원 활용, 드래그로 위치 이동 가능
4. **제한**: 게시선 1개만 허용, 이미 존재하면 버튼 비활성화
5. **삭제**: 게시선 선택 후 Delete/Backspace 또는 위젯 내 X 버튼
6. **시각적 프리뷰**: 게시선 상/하 영역에 "무료 영역" / "유료 영역" 시각적 구분 표시

**paywallPosition 추출:**

```typescript
// CKEditor 모델에서 게시선 위치 추출
function getPaywallPosition(editor: ClassicEditor): number | null {
  const root = editor.model.document.getRoot();
  const range = editor.model.createRangeIn(root);

  for (const item of range.getItems()) {
    if (item.is('element', 'paywallDivider')) {
      return item.startOffset;
    }
  }
  return null;
}
```

**장점:**

- 투비컨티뉴드/포스타입 수준의 풍부한 UX 구현 가능 (드래그 이동, 시각적 프리뷰)
- CKEditor 모델 레벨에서 정확한 position 추적
- 향후 확장성 높음 (애니메이션, 인라인 설정 등)

**단점:**

- CKEditor 5 플러그인 아키텍처 (Schema/Conversion/Command) 학습 곡선
- 개발 비용 높음 (4~5개 파일, Widget API 이해 필요)
- 디버깅 복잡도 증가

---

#### 공통 사항 (두 옵션 모두)

| 항목                          | 설명                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| 유료 전환 자동화              | 게시선 삽입 시 accessLevel을 자동으로 'paid'로 전환 제안                                              |
| freeContent/paidContent split | 서버 사이드에서 paywall 마커 기준으로 분리 저장 (B.3 참조)                                            |
| 미리보기 표시                 | PreviewModal에서 게시선 기준으로 유료 영역 블러 처리 (옵션 무관)                                      |
| 게시선 1개 제한               | 에디터 내 게시선은 항상 최대 1개                                                                      |
| paywallPosition 저장          | PostEntity.paywallPosition에 정수 offset으로 저장 + freeContent/paidContent split (B.1 D-4, B.3 참조) |

**옵션 선택 가이드:**

- MVP 우선, 빠른 출시가 목표 -> **Option A**
- UX 완성도 우선, 충분한 개발 리소스 확보 -> **Option B**
- Option A로 시작 후 사용자 피드백에 따라 Option B로 업그레이드하는 점진적 전략도 가능

### D.3. 새 컴포넌트

| 컴포넌트          | 경로                                     | 설명                                            |
| ----------------- | ---------------------------------------- | ----------------------------------------------- |
| WriteEditor       | `components/write/WriteEditor.tsx`       | 몰입형 에디터 메인 (제목 + CKEditor + 상태바)   |
| WriteHeader       | `components/write/WriteHeader.tsx`       | 최소 헤더 (뒤로가기, 저장 상태, 임시저장, 발행) |
| PublishSheet      | `components/write/PublishSheet.tsx`      | 발행 바텀시트 (분류, 가격, 권한, 메타데이터)    |
| SeriesSelector    | `components/write/SeriesSelector.tsx`    | 시리즈 드롭다운 + 즉석 생성                     |
| MetadataSection   | `components/write/MetadataSection.tsx`   | 썸네일, 요약문, 태그 설정                       |
| DraftListModal    | `components/write/DraftListModal.tsx`    | 임시저장 목록 모달                              |
| PreviewModal      | `components/write/PreviewModal.tsx`      | 독자 뷰 미리보기 모달                           |
| ViewerBadge       | `components/write/ViewerBadge.tsx`       | 전자책 뷰어 안내 배지                           |
| PaidToFreeWarning | `components/write/PaidToFreeWarning.tsx` | 유료->무료 전환 경고 모달                       |
| StatusBar         | `components/write/StatusBar.tsx`         | 하단 상태바 (자동저장, 유료 상태, 글자 수)      |

### D.4. 상태 관리

**editorStore.ts (Zustand):**

```typescript
interface EditorState {
  // 에디터 기본 상태
  mode: 'new' | 'edit';
  postId: string | null;
  bookstoreId: string | null;

  // 콘텐츠
  title: string;
  content: string;
  paywallPosition: number | null;

  // 발행 설정
  accessLevel: PostAccessLevel;
  price: number;
  seriesId: string | null;
  episodeNumber: number | null;
  tags: string[];
  excerpt: string;
  thumbnail: string | null;

  // 상태 플래그
  isDirty: boolean;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  hasPaywall: boolean;

  // 액션
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setPaywallPosition: (pos: number | null) => void;
  setPublishSettings: (settings: Partial<PublishSettings>) => void;
  markSaved: () => void;
  reset: () => void;
}
```

### D.5. 임시저장 훅

**useDraftAutoSave.ts:**

```typescript
function useDraftAutoSave(options: {
  interval?: number; // 기본 30000ms (30초)
  largeContentInterval?: number; // 대용량 시 60000ms (60초)
  largeContentThreshold?: number; // 100KB
}) {
  // Layer 1: 30초 주기 자동 저장 (setInterval + debounce)
  // Layer 2: beforeunload + visibilitychange 이벤트
  // Layer 3: heartbeat 실패 감지 -> 마지막 상태 백업
  // Layer 4: 수동 저장 (Cmd/Ctrl+S 키보드 이벤트)
  // Layer 5: localStorage 폴백 (네트워크 끊김 시)
}
```

---

## E. 선행 조건 및 의존성

### E.1. 반드시 먼저 완료 (Blocking)

| #   | 항목                                | 현재 상태         | F3 시작 전 필요                       | 담당 |
| --- | ----------------------------------- | ----------------- | ------------------------------------- | ---- |
| B-1 | BookstoreEntity + bookstores 테이블 | F2 PRD decomposed | 테이블 생성 마이그레이션 실행         | F2   |
| B-2 | PostEntity.bookstoreId FK           | F2 PRD 확정       | posts 테이블에 bookstore_id 컬럼 추가 | F2   |
| B-3 | 서점 보유 확인 API                  | F2 PRD 확정       | `bookstore.hasBookstore` 프로시저     | F2   |
| B-4 | UserEntity (현재 상태)              | 구현 완료         | 변경 없음                             | F1   |

### E.2. 병렬 진행 가능

| 항목                                               | 이유                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| CKEditor PaywallDivider 플러그인 (Option A 또는 B) | 백엔드 API와 독립적. 프론트엔드 단독 개발 가능. 옵션 선택 후 단독 진행 |
| DraftEntity + DraftService                         | BookstoreEntity와 무관. users/posts FK만 필요                          |
| 프론트엔드 UI 컴포넌트 (mock 데이터)               | API 완성 전 목업으로 개발 가능                                         |
| 임시저장 인프라 (useDraftAutoSave)                 | Draft API와 독립적으로 로직 개발 가능                                  |

### E.3. F2와의 연동 포인트

| 연동                     | F2 제공                            | F3 소비                                          |
| ------------------------ | ---------------------------------- | ------------------------------------------------ |
| 서점 소유 검증           | BookstoreService.findByUserId()    | /write 접근 가드, Post 생성 시 bookstoreId 검증  |
| bookstoreId FK           | bookstores 테이블                  | PostEntity.bookstoreId, SeriesEntity.bookstoreId |
| 서점 관리 -> 글쓰기 진입 | /my-bookstore 내 "글쓰기" 버튼     | /write로 이동                                    |
| 작품 목록 -> 글 수정     | /my-bookstore/works 내 "수정" 버튼 | /write/:postId로 이동                            |

### E.4. F4(시리즈 관리)와의 경계

F3에서 시리즈 관련 최소 기능만 구현:

| F3 범위 (이번)                    | F4 범위 (후행)                                  |
| --------------------------------- | ----------------------------------------------- |
| SeriesEntity + series 테이블 생성 | 시리즈 상세 관리 (커버 이미지, 설명, 가격 정책) |
| 즉석 시리즈 생성 (이름만)         | 시리즈 편집/삭제                                |
| 시리즈 선택 드롭다운              | 시리즈 목록 페이지                              |
| 회차 자동 부여                    | 회차 재배치/순서 변경                           |
| postEntity.seriesId FK            | 시리즈별 통계/수익                              |

---

## F. 구현 순서 제안

### Phase 0: 선행 조건 확인 (F2 의존)

- [ ] bookstores 테이블 존재 확인
- [ ] posts.bookstore_id 컬럼 존재 확인
- [ ] 서점 보유 확인 API 존재 확인
- 완료 조건: F2 데이터 레이어가 마이그레이션 완료 상태

### Phase 1: 데이터 레이어 (DB + Entity) -- 예상 1~2일

- [ ] 1A: SeriesEntity 정의 + series 테이블 마이그레이션
- [ ] 1B: PostEntity 확장 (paywallPosition, tags, seriesId, episodeNumber, viewerBadge)
- [ ] 1B: posts 테이블 마이그레이션 (컬럼 추가)
- [ ] 1C: DraftEntity 정의 + drafts 테이블 마이그레이션
- [ ] 1D: RepositoryProvider에 DraftRepository, SeriesRepository 등록
- [ ] 1E: PostEntity.edit(), publish() 메서드 확장
- 완료 조건: `yarn workspace api migration:run` 성공, Entity 타입 컴파일 통과

### Phase 2: 백엔드 서비스 레이어 -- 예상 2~3일

- [ ] 2A: DraftService + DraftController + DraftModule 생성
- [ ] 2B: DraftRouter 생성 (save, getList, getById, delete, cleanupByPostId)
- [ ] 2C: SeriesService + SeriesController + SeriesModule 생성
- [ ] 2D: SeriesRouter 생성 (create, getByBookstore, getNextEpisodeNumber)
- [ ] 2E: PostService.publishPost() 확장 (메타데이터 + viewerBadge + draft 정리)
- [ ] 2F: PostRouter 스키마 확장 (input/output에 새 필드 반영)
- [ ] 2G: PostService에 서점 보유 검증 로직 추가
- 완료 조건: 모든 tRPC endpoint가 Postman/테스트에서 정상 응답

### Phase 3: 프론트엔드 기반 -- 예상 2~3일

- [ ] 3A: /write, /write/:postId 라우트 생성
- [ ] 3B: WriteEditor + WriteHeader 컴포넌트 (몰입형 에디터)
- [ ] 3C: editorStore 생성 (Zustand)
- [ ] 3D: CKEditor PaywallDivider 플러그인 개발 (Option A: HTML 마커 방식 또는 Option B: 커스텀 위젯 방식 택 1)
- [ ] 3E: StatusBar 컴포넌트 (자동저장 상태, 유료 상태, 글자 수)
- [ ] 3F: 서점 미보유 시 /write 접근 가드 (리다이렉트)
- 완료 조건: 에디터에서 글 작성 + 게시선 삽입/삭제 가능 (Option B 선택 시 드래그 이동 포함)

### Phase 4: 임시저장 시스템 -- 예상 1~2일

- [ ] 4A: useDraftAutoSave 훅 개발
- [ ] 4B: DraftListModal 컴포넌트 (목록 조회, 불러오기, 삭제)
- [ ] 4C: 에디터 진입 시 임시저장 복원 토스트 ("이전 글이 있습니다")
- [ ] 4D: 키보드 단축키 (Cmd/Ctrl+S) 수동 저장
- [ ] 4E: localStorage 폴백 + 네트워크 복구 후 동기화
- 완료 조건: 자동/수동 임시저장 동작 + 목록 CRUD + 복원 + 이탈 시 백업

### Phase 5: 발행 플로우 -- 예상 2~3일

- [ ] 5A: PublishSheet 바텀시트 컴포넌트
- [ ] 5B: SeriesSelector (시리즈 드롭다운 + 즉석 생성)
- [ ] 5C: MetadataSection (썸네일 자동/업로드, 요약문 자동 추출, 태그 입력)
- [ ] 5D: 접근 권한 설정 (기존 PermissionPriceSection 로직 이관)
- [ ] 5E: ViewerBadge 안내 (시리즈 + 1000자 조건)
- [ ] 5F: 발행 API 호출 + 성공/실패 처리
- [ ] 5G: Smart Default 적용 (무료 + 전체공개 + 단편)
- 완료 조건: 전체 발행 플로우 동작 (발행 시트 -> 설정 -> 발행 완료)

### Phase 6: 미리보기 + 수정 + 마무리 -- 예상 1~2일

- [ ] 6A: PreviewModal (독자 뷰 렌더링, 게시선 기준 유료 영역 블러)
- [ ] 6B: PaidToFreeWarning (유료->무료 전환 경고 팝업)
- [ ] 6C: /write/:postId 기존 글 수정 (내용 로드 + 메타데이터 복원)
- [ ] 6D: 에러 처리 (E-01 ~ E-19)
- [ ] 6E: 통합 테스트 + AC 검증
- 완료 조건: 모든 Acceptance Criteria (AC-1.1 ~ AC-10.2) 충족

### 전체 예상 기간

| Phase    | 예상 기간                    | 병렬 가능                    |
| -------- | ---------------------------- | ---------------------------- |
| Phase 0  | F2 의존                      | -                            |
| Phase 1  | 1~2일                        | -                            |
| Phase 2  | 2~3일                        | Phase 3A, 3C, 3D와 병렬 가능 |
| Phase 3  | 2~3일                        | Phase 2와 부분 병렬          |
| Phase 4  | 1~2일                        | Phase 5 선행 필요 없음       |
| Phase 5  | 2~3일                        | Phase 4와 병렬 가능          |
| Phase 6  | 1~2일                        | Phase 4, 5 완료 후           |
| **총계** | **약 8~12일** (병렬 진행 시) |                              |

### 병렬화 전략

```
                Phase 1 (DB)
                    │
           ┌────────┴────────┐
           ▼                 ▼
      Phase 2 (BE)    Phase 3 (FE 기반)
           │                 │
           ▼                 ▼
    ┌──────┴──────┐   Phase 3D (PaywallDivider A or B)
    │             │
Phase 4 (임시저장) Phase 5 (발행)
    │             │
    └──────┬──────┘
           ▼
      Phase 6 (마무리)
```

---

## G. 보안 체크리스트

| #   | 항목                 | 검증 위치                  | 설명                                                  |
| --- | -------------------- | -------------------------- | ----------------------------------------------------- |
| S-1 | 서점 소유 검증       | PostService                | post.bookstoreId -> bookstore.userId === ctx.user.sub |
| S-2 | 글 수정 권한         | PostEntity.canBeEditedBy() | authorId 일치 검증                                    |
| S-3 | XSS 방지             | PostService + 프론트엔드   | CKEditor 내장 sanitizer + 서버 측 DOMPurify           |
| S-4 | 이미지 크기 제한     | 업로드 미들웨어            | 5MB per image                                         |
| S-5 | 서점 미보유 API 접근 | PostService/DraftService   | bookstore 소유 여부 검증                              |
| S-6 | Draft 소유 검증      | DraftService               | draft.userId === ctx.user.sub                         |
| S-7 | 시리즈 소유 검증     | SeriesService              | series.bookstoreId -> bookstore.userId 검증           |

---

## H. 참조 파일 인덱스

### 수정 대상 파일

| 파일                                                            | 변경 내용                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/api/src/module/domain/post.entity.ts`                     | 컬럼 추가, edit()/publish() 확장, viewerBadge 계산                              |
| `apps/api/src/module/post/post.service.ts`                      | publishPost 확장, 서점 검증 추가                                                |
| `apps/api/src/module/post/post.router.ts`                       | 스키마 확장 (input/output)                                                      |
| `apps/api/src/module/post/post.controller.ts`                   | publish 페이로드 확장                                                           |
| `apps/api/src/module/shared/transaction/repository.provider.ts` | Draft, Series 레포지토리 등록                                                   |
| `apps/client/src/components/posts/create/FormEditorSection.tsx` | PaywallDivider 플러그인 추가 - Option A 또는 B (또는 새 에디터 컴포넌트로 대체) |

### 신규 생성 파일

| 파일                                                            | 설명                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `apps/api/src/module/domain/draft.entity.ts`                    | DraftEntity                                                                   |
| `apps/api/src/module/domain/series.entity.ts`                   | SeriesEntity                                                                  |
| `apps/api/src/module/draft/draft.service.ts`                    | DraftService                                                                  |
| `apps/api/src/module/draft/draft.controller.ts`                 | DraftController                                                               |
| `apps/api/src/module/draft/draft.router.ts`                     | DraftRouter                                                                   |
| `apps/api/src/module/draft/draft.module.ts`                     | DraftModule                                                                   |
| `apps/api/src/module/series/series.service.ts`                  | SeriesService                                                                 |
| `apps/api/src/module/series/series.controller.ts`               | SeriesController                                                              |
| `apps/api/src/module/series/series.router.ts`                   | SeriesRouter                                                                  |
| `apps/api/src/module/series/series.module.ts`                   | SeriesModule                                                                  |
| `apps/api/src/database/migration/XXXX-CreateSeriesTable.ts`     | series 마이그레이션                                                           |
| `apps/api/src/database/migration/XXXX-ExtendPostsForWriting.ts` | posts 확장 마이그레이션                                                       |
| `apps/api/src/database/migration/XXXX-CreateDraftsTable.ts`     | drafts 마이그레이션                                                           |
| `apps/client/src/routes/_auth/write.tsx`                        | 새 글 작성 라우트                                                             |
| `apps/client/src/routes/_auth/write.$postId.tsx`                | 글 수정 라우트                                                                |
| `apps/client/src/components/write/WriteEditor.tsx`              | 몰입형 에디터 메인                                                            |
| `apps/client/src/components/write/WriteHeader.tsx`              | 에디터 최소 헤더                                                              |
| `apps/client/src/components/write/PublishSheet.tsx`             | 발행 바텀시트                                                                 |
| `apps/client/src/components/write/SeriesSelector.tsx`           | 시리즈 선택/생성                                                              |
| `apps/client/src/components/write/MetadataSection.tsx`          | 메타데이터 설정                                                               |
| `apps/client/src/components/write/DraftListModal.tsx`           | 임시저장 목록 모달                                                            |
| `apps/client/src/components/write/PreviewModal.tsx`             | 미리보기 모달                                                                 |
| `apps/client/src/components/write/ViewerBadge.tsx`              | 전자책 뷰어 배지                                                              |
| `apps/client/src/components/write/PaidToFreeWarning.tsx`        | 유료->무료 경고                                                               |
| `apps/client/src/components/write/StatusBar.tsx`                | 하단 상태바                                                                   |
| `apps/client/src/components/editor/plugins/paywall-divider/`    | CKEditor PaywallDivider 플러그인 (Option A: 1~2개 파일, Option B: 4~5개 파일) |
| `apps/client/src/stores/editor.ts`                              | 에디터 Zustand 스토어                                                         |
| `apps/client/src/hooks/useDraftAutoSave.ts`                     | 자동 임시저장 훅                                                              |
