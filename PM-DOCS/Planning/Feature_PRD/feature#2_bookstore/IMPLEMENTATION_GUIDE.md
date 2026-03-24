# Feature #2 서점 시스템 — 구현 가이드

> 이 문서는 PRD를 현재 코드베이스에 적용할 때의 **기술 상세**와 **최적 구현 순서**를 정리합니다.
> 분석 기준일: 2026-03-22

## 현재 코드베이스 요약

| 영역               | 현재 상태                        | PRD 요구사항                                     |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| 서점 개념          | 없음 (User가 곧 작가)            | 별도 BookstoreEntity (1:1)                       |
| 작품 소속          | PostEntity.authorId → UserEntity | PostEntity.bookstoreId → BookstoreEntity         |
| 서점 프로필        | 없음 (UserEntity.nickname만)     | penName, storeName, bio, profileImage, genreTags |
| 발행 디폴트        | 없음                             | 단편/시리즈별 유/무료, 가격, 등급 디폴트         |
| 서점 리뷰          | 없음                             | BookstoreReviewEntity                            |
| 파일 업로드        | 인프라 없음                      | 이미지 + Word/HWP 파싱                           |
| 독자용 서점 페이지 | 없음                             | 장르 태그 + 최신/인기 + 단편/시리즈 탭           |

---

## Breaking Points

### DB 스키마 Breaking Points

| #    | 현재 코드                     | PRD 요구사항               | 충돌 유형   | 위험도 |
| ---- | ----------------------------- | -------------------------- | ----------- | ------ |
| BP-1 | BookstoreEntity 없음          | 서점 정보 저장 필요        | Entity 부재 | HIGH   |
| BP-2 | PostEntity에 bookstoreId 없음 | 포스트-서점 연결 필요      | 컬럼 부재   | HIGH   |
| BP-3 | 파일 업로드 인프라 없음       | 이미지/문서 업로드 필요    | 인프라 부재 | HIGH   |
| BP-4 | UserEntity에 country 없음     | 한국 유저만 서점 오픈 제한 | 컬럼 부재   | MEDIUM |

### API Breaking Points

| #    | 현재 코드                          | PRD 요구사항                                       | 충돌 유형      | 위험도 |
| ---- | ---------------------------------- | -------------------------------------------------- | -------------- | ------ |
| BP-5 | PostRouter.getMy가 authorId로 필터 | 서점별 작품 조회 필요 (bookstoreId)                | 쿼리 확장 필요 | LOW    |
| BP-6 | FollowRouter가 User 팔로우         | 서점 팔로우와 동일 (userId 기반이므로 재사용 가능) | 없음           | NONE   |

### 프론트엔드 Breaking Points

| #    | 현재 코드                | PRD 요구사항                        | 충돌 유형        | 위험도 |
| ---- | ------------------------ | ----------------------------------- | ---------------- | ------ |
| BP-7 | /editor 하위에 작가 관리 | /my-bookstore 하위로 서점 관리 분리 | 라우트 구조 변경 | MEDIUM |
| BP-8 | 서점 페이지 라우트 없음  | /bookstore/:id 신규 필요            | 라우트 부재      | HIGH   |

---

## Entity 상세 설계

### 공통 Enum 정의

```typescript
// apps/api/src/module/domain/enums.ts

export enum CountryEnum {
  KR = 'KR',
}

export enum AccessLevelEnum {
  PUBLIC = 'public',
  SUBSCRIBER = 'subscriber',
  PURCHASER = 'purchaser',
}

export enum AgeRatingEnum {
  ALL = 'all',
  ADULT = 'adult',
}
```

> DB에는 varchar로 저장, TypeScript 코드에서는 enum으로 타입 안전성 확보.

### BookstoreEntity

```typescript
// apps/api/src/module/domain/bookstore.entity.ts

@Entity('bookstores')
export class BookstoreEntity extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 30 })
  penName: string;

  @Column({ type: 'varchar', length: 50 })
  storeName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  profileImage: string | null;

  @Column({ type: 'varchar', nullable: true })
  coverImage: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  genreTags: string[];

  @Column({ type: 'varchar', default: CountryEnum.KR })
  country: CountryEnum;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  termsAgreedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  openedAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => PostEntity, post => post.bookstore)
  posts: PostEntity[];

  @OneToOne(() => PublishDefaultEntity, pd => pd.bookstore)
  publishDefault: PublishDefaultEntity;
}
```

**설계 근거:**

- UserEntity 확장이 아닌 별도 Entity — 모든 유저가 서점을 가지지 않으므로
- `userId` Unique Constraint — 1인 1서점 정책 강제
- `genreTags` jsonb — varchar[]보다 TypeORM 쿼리 호환성이 좋고 GIN 인덱스 지원
- `country` enum — DB에는 varchar로 저장, 코드에서는 `CountryEnum`으로 타입 안전성 확보
- `termsAgreedAt` nullable Date — boolean 대신 약관 동의 일시를 명확히 기록

### BookstoreReviewEntity

```typescript
// apps/api/src/module/domain/bookstore-review.entity.ts

@Entity('bookstore_reviews')
@Unique(['bookstoreId', 'reviewerId']) // 유저당 서점별 1개 제한
export class BookstoreReviewEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  bookstoreId: string;

  @ManyToOne(() => BookstoreEntity)
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({ type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ type: 'text' })
  content: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

**인덱스:** `CREATE INDEX idx_bookstore_reviews_bookstore_created ON bookstore_reviews (bookstore_id, created_at DESC)`

### PublishDefaultEntity

```typescript
// apps/api/src/module/domain/publish-default.entity.ts

@Entity('publish_defaults')
export class PublishDefaultEntity extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  bookstoreId: string;

  @OneToOne(() => BookstoreEntity)
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({ type: 'varchar', default: AccessLevelEnum.PUBLIC })
  defaultAccessLevel: AccessLevelEnum; // DB: varchar, 코드: enum

  @Column({ type: 'int', default: 0 })
  defaultPrice: number;

  @Column({ type: 'varchar', default: AgeRatingEnum.ALL })
  defaultAgeRating: AgeRatingEnum; // DB: varchar, 코드: enum
}
```

### PostEntity 변경

```typescript
// apps/api/src/module/domain/post.entity.ts (추가 필드)

@Column({ type: 'uuid' })
bookstoreId: string;

@ManyToOne(() => BookstoreEntity)
@JoinColumn({ name: 'bookstore_id' })
bookstore: BookstoreEntity;

@Column({ type: 'int', nullable: true })
sortOrder: number | null;
```

**주의:** 마이그레이션 시 기존 포스트를 제거하고 `NOT NULL`로 설정. MVP에서는 기존 테스트 데이터만 존재하므로 클린 스타트가 적합.

**PostEntity.create 확장 필요:**

- `PostEntity.create()` factory method에 `bookstoreId: string` 파라미터 추가 (필수)
- `PostService.createPost()`의 input에 `bookstoreId` 추가 (필수)
- 서점 보유 유저만 포스트 생성 가능 (서점 없으면 포스트 생성 차단)

---

## tRPC Router 상세

### BookstoreRouter

```typescript
// apps/api/src/module/bookstore/bookstore.router.ts

export const bookstoreRouter = {
  // === Mutations (인증 필수) ===

  'bookstore.open': {
    input: z.object({
      penName: z.string().min(1).max(30),
      storeName: z.string().min(1).max(50),
      termsAgreed: z.literal(true),
    }),
    // → BookstoreService.open(userId, input)
    // → 한국 유저 검증 → Unique 검증 → BookstoreEntity 생성
  },

  'bookstore.updateProfile': {
    input: z.object({
      penName: z.string().min(1).max(30).optional(),
      bio: z.string().max(500).nullable().optional(),
      profileImage: z.string().url().nullable().optional(),
      coverImage: z.string().url().nullable().optional(),
      genreTags: z.array(z.string()).max(10).optional(),
    }),
    // → 소유권 검증 → 부분 업데이트
  },

  'bookstore.updateSettings': {
    input: z.object({
      defaultAccessLevel: z
        .enum(['public', 'subscriber', 'purchaser'])
        .optional(),
      defaultPrice: z.number().min(0).optional(),
      defaultAgeRating: z.enum(['all', 'adult']).optional(),
    }),
    // → PublishDefaultEntity upsert
  },

  'bookstore.updatePostOrder': {
    input: z.object({
      postOrders: z.array(
        z.object({
          postId: z.string().uuid(),
          sortOrder: z.number(),
        })
      ),
    }),
    // → 트랜잭션으로 일괄 업데이트
  },

  // === Queries (인증 필수) ===

  'bookstore.getMyBookstore': {
    // → userId로 BookstoreEntity 조회 (publishDefault 포함)
  },

  'bookstore.hasBookstore': {
    // → boolean 반환
  },

  'bookstore.getMyWorks': {
    input: z.object({
      status: z.enum(['all', 'published', 'draft', 'private']).default('all'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }),
    // → bookstoreId로 PostEntity 목록 조회 (상태 필터 + 정렬)
  },

  // === Queries (공개) ===

  'bookstore.getById': {
    input: z.object({ bookstoreId: z.string().uuid() }),
    // → BookstoreEntity + publishDefault + 포스트 수
  },

  'bookstore.getByUserId': {
    input: z.object({ userId: z.string().uuid() }),
    // → userId로 BookstoreEntity 조회
  },

  'bookstore.getPosts': {
    input: z.object({
      bookstoreId: z.string().uuid(),
      type: z.enum(['all', 'single', 'series']).default('all'),
      sort: z.enum(['latest', 'popular']).default('latest'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }),
    // → 발행된 포스트만 조회 (status: 'published')
  },

  'bookstore.getPopularPosts': {
    input: z.object({
      bookstoreId: z.string().uuid(),
      limit: z.number().default(6),
    }),
    // → 조회수/좋아요 기준 상위 N개
  },
};
```

### BookstoreReviewRouter

```typescript
// apps/api/src/module/bookstore-review/bookstore-review.router.ts

export const bookstoreReviewRouter = {
  'bookstoreReview.create': {
    input: z.object({
      bookstoreId: z.string().uuid(),
      content: z.string().min(1).max(500),
    }),
    // → UQ(bookstoreId, reviewerId) 위반 시 ConflictException
    // → 자기 서점에 리뷰 불가 검증
  },

  'bookstoreReview.update': {
    input: z.object({
      reviewId: z.string().uuid(),
      content: z.string().min(1).max(500),
    }),
    // → reviewerId === ctx.user.sub 검증
  },

  'bookstoreReview.delete': {
    input: z.object({ reviewId: z.string().uuid() }),
    // → reviewerId === ctx.user.sub 소유권 검증 + soft delete
  },

  'bookstoreReview.getByBookstore': {
    input: z.object({
      bookstoreId: z.string().uuid(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
    // → 최신순 페이지네이션, reviewer 정보 join
  },
};
```

---

## DB 마이그레이션 상세

### M-1: bookstores 테이블

```sql
CREATE TABLE bookstores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  pen_name VARCHAR(30) NOT NULL,
  store_name VARCHAR(50) NOT NULL,
  bio TEXT,
  profile_image VARCHAR,
  cover_image VARCHAR,
  genre_tags JSONB DEFAULT '[]',
  country VARCHAR DEFAULT 'KR',
  is_active BOOLEAN DEFAULT TRUE,
  terms_agreed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bookstores_user_id ON bookstores (user_id);
```

### M-2: publish_defaults 테이블

```sql
CREATE TABLE publish_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookstore_id UUID NOT NULL UNIQUE REFERENCES bookstores(id),
  default_access_level VARCHAR DEFAULT 'public',
  default_price INT DEFAULT 0,
  default_age_rating VARCHAR DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### M-3: bookstore_reviews 테이블

```sql
CREATE TABLE bookstore_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookstore_id UUID NOT NULL REFERENCES bookstores(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (bookstore_id, reviewer_id)
);

CREATE INDEX idx_bookstore_reviews_bookstore_created
  ON bookstore_reviews (bookstore_id, created_at DESC);
```

### M-4: posts 테이블 확장

```sql
-- 기존 테스트 포스트 제거 후 NOT NULL로 추가
DELETE FROM posts;
ALTER TABLE posts ADD COLUMN bookstore_id UUID NOT NULL REFERENCES bookstores(id);
ALTER TABLE posts ADD COLUMN sort_order INT;

CREATE INDEX idx_posts_bookstore_id ON posts (bookstore_id);
```

> **주의:** 기존 posts 데이터를 삭제합니다. MVP 전 테스트 데이터만 존재하는 시점에서 실행해야 합니다.

---

## 프론트엔드 라우트 & 컴포넌트

### 라우트 구조 (TanStack Router)

```
apps/client/src/routes/
  _auth/
    bookstore/
      open.tsx                    # /bookstore/open (인증 필수 + 국가 체크)
    $bookstoreId.tsx              # /bookstore/:id 레이아웃
    $bookstoreId/
      index.tsx                   # 서점 메인 (독자용)
      singles.tsx                 # 단편 전체
      series.tsx                  # 시리즈 전체
  _auth/
    my-bookstore.tsx              # /my-bookstore 레이아웃
    my-bookstore/
      index.tsx                   # 서점 관리 메인
      profile.tsx                 # 프로필 편집
      settings.tsx                # 발행 설정
      upload.tsx                  # 작품 업로드
      works.tsx                   # 작품 목록 관리
```

### 핵심 컴포넌트

```
apps/client/src/components/bookstore/
  BookstoreOpenForm.tsx           # 서점 오픈 (필명 + 서점명 + 약관)
  BookstoreProfileForm.tsx        # 프로필 편집
  BookstoreSettingsForm.tsx       # 발행 디폴트 설정

  page/
    BookstoreHeader.tsx           # 서점 헤더 (커버 + 프로필 + 팔로우)
    GenreTagBadge.tsx             # 장르 태그 배지
    LatestPostsSection.tsx        # 최신 발행 (썸네일 그리드)
    PopularPostsSection.tsx       # 인기 글 (썸네일 그리드)
    BookstoreTabNav.tsx           # 단편/시리즈 탭
    ReviewSection.tsx             # 리뷰 섹션
    ReviewForm.tsx                # 리뷰 작성 폼

  manage/
    WorkListItem.tsx              # 작품 아이템
    WorkStatusFilter.tsx          # 상태 필터
    FileUploadZone.tsx            # 파일 드래그앤드롭
    DocumentPreview.tsx           # 파싱 결과 미리보기
```

---

## 최적 구현 순서

### Phase 1: 서점 오픈 (핵심 경로)

```
1. M-1 마이그레이션 (bookstores 테이블)
2. BookstoreEntity + getBookstoreRepository() 함수형 확장 (기존 getPostRepository() 패턴 준수)
3. BookstoreService (open, getMyBookstore, hasBookstore, getById, getByUserId)
4. BookstoreRouter (open, getMyBookstore, hasBookstore, getById)
5. BookstoreController (@MessagePattern)
6. FE: /bookstore/open (서점 오픈 폼)
7. FE: /my-bookstore (서점 관리 메인 - 빈 상태)
```

### Phase 2: 서점 프로필

```
1. BookstoreService.updateProfile
2. BookstoreRouter.updateProfile
3. FE: /my-bookstore/profile (프로필 편집)
4. FE: BookstoreHeader 컴포넌트
```

### Phase 3: 독자용 서점 페이지

```
1. M-4 마이그레이션 (posts에 bookstore_id 추가)
2. PostEntity 변경 (bookstoreId 필드)
3. BookstoreService.getPosts, getPopularPosts
4. BookstoreRouter.getPosts, getPopularPosts
5. FE: /bookstore/:id (서점 메인 페이지)
6. FE: /bookstore/:id/singles, /series (전체 보기)
7. FE: GenreTagBadge, LatestPostsSection, PopularPostsSection
```

### Phase 4: 작품 관리

```
1. BookstoreService.getMyWorks, updatePostOrder
2. BookstoreRouter.getMyWorks, updatePostOrder
3. FE: /my-bookstore/works (작품 목록 관리)
4. FE: WorkListItem, WorkStatusFilter
```

### Phase 5: 리뷰 시스템 (Growth)

```
1. M-3 마이그레이션 (bookstore_reviews 테이블)
2. BookstoreReviewEntity + Repository
3. BookstoreReviewService + Router + Controller
4. FE: ReviewSection, ReviewForm
```

### Phase 6: 발행 디폴트 + 파일 업로드 (Growth)

```
1. M-2 마이그레이션 (publish_defaults 테이블)
2. PublishDefaultEntity + Repository
3. BookstoreService.updateSettings
4. FE: /my-bookstore/settings
5. multer + S3 인프라 구축
6. mammoth 통합 (DOCX 파싱)
7. FE: /my-bookstore/upload (FileUploadZone, DocumentPreview)
```

---

## 기존 모듈 영향 분석

| 모듈                 | 영향도   | 상세                                                          |
| -------------------- | -------- | ------------------------------------------------------------- |
| PostEntity           | **높음** | bookstoreId NOT NULL + sortOrder 추가 (기존 포스트 삭제 필요) |
| PostService          | **중간** | createPost에서 bookstoreId 필수 설정, 서점 미보유 유저 차단   |
| PostRouter           | **없음** | 기존 Procedure 변경 불필요                                    |
| UserEntity           | **없음** | 변경 불필요                                                   |
| FollowEntity         | **없음** | 서점 팔로우 = 유저 팔로우 (재사용)                            |
| RepositoryProvider   | **중간** | 3개 Repository 추가 등록                                      |
| FE Header/Navigation | **낮음** | "내 서점" 메뉴 항목 추가                                      |

---

## 보안 체크리스트

- [ ] bookstore.open: 한국 유저만 (Service 레이어 검증, FE만으로 부족)
- [ ] bookstore.updateProfile: userId === bookstore.userId 검증
- [ ] bookstoreReview.create: 자기 서점 리뷰 불가 검증
- [ ] bookstoreReview.update/delete: reviewerId === ctx.user.sub
- [ ] 소개글/리뷰 content: HTML 태그 스트립 + XSS 이스케이프
- [ ] 이미지 URL: 자체 스토리지만 허용, 외부 URL 차단
- [ ] 파일 업로드: MIME 타입 + 매직바이트 + 크기 제한 (10MB)
- [ ] Rate limiting: 리뷰 UQ(bookstoreId, reviewerId)로 스팸 방지
