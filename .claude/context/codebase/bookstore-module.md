---
name: bookstore-module
description: Bookstore 모듈 - 서점 오픈/프로필/설정/작품 관리 (BE + FE)
keywords:
  [Bookstore, 서점, BookstoreEntity, PublishDefault, BookstoreForm, 에디터]
estimated_tokens: ~500
related_contexts:
  - business-access-control
  - codebase-post-entity
  - codebase-follow-module
---

# Bookstore 모듈

에디터의 서점(Bookstore)을 관리하는 모듈입니다. 서점 오픈, 프로필 편집, 발행 기본값 설정, 작품 목록 조회를 제공합니다. 서점은 에디터가 포스트를 발행하기 위한 필수 조건입니다.

## 파일 구조

### Backend

| 파일                                                 | 역할                          | 핵심 함수/클래스                                                                                                                                                                                              |
| ---------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/api/src/module/domain/bookstore.entity.ts       | Entity + Repository           | BookstoreEntity, getBookstoreRepository()                                                                                                                                                                     |
| apps/api/src/module/domain/publish-default.entity.ts | Embedded Entity (발행 기본값) | PublishDefaultEntity (defaultAccessLevel, defaultPrice, defaultAgeRating)                                                                                                                                     |
| apps/api/src/module/bookstore/bookstore.service.ts   | 비즈니스 로직                 | BookstoreService.open(), hasBookstore(), getMyBookstore(), updateProfile(), getById(), getPosts(), getMyWorks(), getSettings(), updateSettings(), getPopularPosts()                                           |
| apps/api/src/module/bookstore/bookstore.router.ts    | tRPC API 라우터               | open(mutation), hasBookstore(query), getMyBookstore(query), updateProfile(mutation), getById(query), getPosts(query), getMyWorks(query), getSettings(query), updateSettings(mutation), getPopularPosts(query) |
| apps/api/src/module/bookstore/bookstore.schema.ts    | Zod 입출력 스키마 분리        | openBookstoreInputSchema, bookstoreResponseSchema, updateProfileInputSchema, postResponseSchema, postFeedItemSchema, publishDefaultResponseSchema, updateSettingsInputSchema                                  |

### Frontend

| 파일                                                              | 역할                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------- |
| apps/client/src/components/bookstore/BookstoreForm.tsx            | 서점 오픈 + 프로필 편집 통합 폼 (mode: create/edit)  |
| apps/client/src/components/bookstore/BookstoreHeader.tsx          | 서점 헤더 (필명, 서점 이름 등)                       |
| apps/client/src/components/bookstore/BookstoreNavMenu.tsx         | 서점 관리 네비게이션 메뉴                            |
| apps/client/src/components/bookstore/BookstoreProfile.tsx         | 서점 프로필 표시                                     |
| apps/client/src/components/bookstore/BookstoreOpenForm.tsx        | 서점 오픈 전용 폼 (레거시, BookstoreForm으로 통합됨) |
| apps/client/src/components/bookstore/CountryRestrictionNotice.tsx | 비한국 유저 제한 안내                                |
| apps/client/src/components/bookstore/LatestPostsSection.tsx       | 최신 포스트 섹션                                     |
| apps/client/src/components/bookstore/PopularPostsSection.tsx      | 인기 포스트 섹션                                     |
| apps/client/src/components/bookstore/StatusFilter.tsx             | 작품 상태 필터                                       |
| apps/client/src/components/bookstore/WorkListItem.tsx             | 작품 목록 아이템                                     |

## BookstoreEntity 구조

```typescript
@Entity('bookstores')
export class BookstoreEntity extends BaseEntity {
  userId: string; // UUID, unique, 서점 소유자
  penName: string; // varchar(30), 필명
  storeName: string; // varchar(50), 서점 이름
  bio: string | null; // text, 서점 소개
  profileImage: string | null;
  coverImage: string | null;
  genreTags: string[]; // jsonb, 장르 태그
  country: string; // varchar(10), default 'KR'
  isActive: boolean; // default true
  termsAgreedAt: Date | null;
  openedAt: Date | null;

  // Embedded Entity (별도 테이블 없이 bookstores 테이블에 컬럼으로 포함)
  @Column(() => PublishDefaultEntity, { prefix: 'publish_default' })
  publishDefault: PublishDefaultEntity;

  // Relations
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}
```

### PublishDefaultEntity (Embedded)

별도 테이블 없이 `bookstores` 테이블에 `publish_default_*` 접두사 컬럼으로 저장됩니다.

| 필드               | 타입               | 기본값   | 설명           |
| ------------------ | ------------------ | -------- | -------------- |
| defaultAccessLevel | PublishAccessLevel | 'public' | 기본 접근 레벨 |
| defaultPrice       | number             | 0        | 기본 가격      |
| defaultAgeRating   | AgeRating          | 'all'    | 기본 연령 등급 |

## FE 라우터 구조

경로: `/my-bookstore/*` (인증 필요)

| 라우트                   | 파일                                    | 설명                                            |
| ------------------------ | --------------------------------------- | ----------------------------------------------- |
| `/my-bookstore/`         | routes/\_auth/my-bookstore/index.tsx    | 서점 메인 (미보유 시 오픈 폼, 보유 시 대시보드) |
| `/my-bookstore/settings` | routes/\_auth/my-bookstore/settings.tsx | 서점 프로필 편집 (BookstoreForm mode="edit")     |

> 개인 프로필 편집은 `/my/profile`로 분리됨 → [user-profile-ui.md](./user-profile-ui.md)

### 서점 오픈 분기 로직

별도 오픈 페이지 없이, `/editor/my-bookstore/` 내에서 컴포넌트 분기:

- 서점 미보유 → `BookstoreForm mode="create"` 표시
- 서점 보유 → `BookstoreHeader` + `BookstoreNavMenu` 표시

## BookstoreForm 설계

`mode` prop으로 서점 오픈(create)과 프로필 편집(edit)을 통합합니다.

| mode   | 스키마       | 필드                                  | 동작                             |
| ------ | ------------ | ------------------------------------- | -------------------------------- |
| create | createSchema | penName, storeName, agreedToTerms     | bookstore.open mutation          |
| edit   | editSchema   | penName, storeName, bio, profileImage | bookstore.updateProfile mutation |

## API 엔드포인트

### Mutations (인증 필요)

| 엔드포인트                 | 설명                                          |
| -------------------------- | --------------------------------------------- |
| `bookstore.open`           | 서점 오픈 (1인 1서점, 한국 유저만)            |
| `bookstore.updateProfile`  | 프로필 수정 (필명, 서점 이름, 소개, 이미지)   |
| `bookstore.updateSettings` | 발행 기본값 수정 (접근 레벨, 가격, 연령 등급) |

### Queries

| 엔드포인트                  | 설명                            | 인증   |
| --------------------------- | ------------------------------- | ------ |
| `bookstore.hasBookstore`    | 서점 보유 여부 확인             | 필요   |
| `bookstore.getMyBookstore`  | 내 서점 조회                    | 필요   |
| `bookstore.getMyWorks`      | 내 작품 목록 (status 필터)      | 필요   |
| `bookstore.getSettings`     | 발행 기본값 조회                | 필요   |
| `bookstore.getById`         | 서점 단일 조회 (독자용)         | 불필요 |
| `bookstore.getPosts`        | 서점 포스트 목록 (페이지네이션) | 불필요 |
| `bookstore.getPopularPosts` | 인기 글 목록                    | 불필요 |

## 주요 설계 결정

- **1인 1서점**: userId에 UNIQUE 제약, 멀티 서점은 향후 확장 대비
- **Embedded Entity**: PublishDefault는 별도 테이블 없이 bookstores 테이블에 임베딩 (TypeORM `@Column(() => Entity)`)
- **한국 유저 제한**: user.country === 'KR' 확인 후 오픈 허용 (ForbiddenException)
- **스키마 분리**: bookstore.schema.ts에 Zod 스키마 집중 (라우터에서 import)
- **bio XSS 방지**: stripHtml() 유틸로 HTML 태그 제거 후 저장

## 관련 문서

- [access-control.md](../business/access-control.md): 서점 필수화 정책
- [post-entity.md](./post-entity.md): PostEntity의 bookstoreId 관계
- [follow-module.md](./follow-module.md): 유저 팔로우 (서점 아닌 유저 대상)
