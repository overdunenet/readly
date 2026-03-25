---
feature_name: 서점 시스템
feature_id: F2
milestone: 'M-001'
status: 'decomposed'
label: 'feature:bookstore'
created_at: 2026-03-09
updated_at: 2026-03-25
author: PM
product_brief_ref: PM-DOCS/Context Output/PRODUCT_BRIEF.md
progress:
  phase_a: true
  phase_b: true
  phase_c: true
  phase_d: true
  phase_e: true
  issue_decomposed: true
---

# F2. 서점 시스템 PRD

## §1. 개요

- **Feature명**: 서점 시스템
- **소속 Milestone**: M-001 (MVP 핵심 기능)
- **한 줄 요약**: 모든 유저가 자신의 서점을 오픈하고 관리할 수 있는 작가 공간
- **라벨**: `feature:bookstore`

### 배경 및 목적

Readly의 비전 "1인 창작자의 글로벌 유통 플랫폼"을 실현하기 위한 첫 번째 작가 공간. "작가 전환"이 아닌, 모든 유저에게 "내 서점"(쓰기/판매)을 부여하여 창작 허들을 최소화한다.

### 의존성

- **선행**: F1 인증 & 계정 관리 (approved), F17 마이페이지 (backlog)
- **후행**: F3 글쓰기 & 발행, F4 시리즈 관리

### F1 선행 수정 필요 항목

F2 구현에 착수하기 전 F1에서 반드시 해결해야 할 항목:

| #    | 항목                           | 현재 코드                             | 필요 조치                                                   |
| ---- | ------------------------------ | ------------------------------------- | ----------------------------------------------------------- |
| F1-1 | UserEntity.country 필드 부재   | `user.entity.ts`                      | country 컬럼 추가 + 마이그레이션 (서점 오픈 국가 제한 전제) |
| F1-2 | 로그인 후 redirect 미구현      | `useAuth.ts:43` → 항상 `/`로 이동     | search param의 redirect URL 처리 (비로그인 독자 복귀 경로)  |
| F1-3 | FollowButton 비로그인 미렌더링 | `FollowButton.tsx:17` → `return null` | 비로그인 시 팔로우 버튼 노출 + 로그인 유도 UI               |

### MVP 제약 (CIS 기반)

- 한국 유저만 서점 오픈 가능
- 1인 1서점 (다중 서점 불가)
- 서점 비활성화 불가 (한 번 열면 닫을 수 없음)
- 해외 작가 서점은 Growth 이후
- 포스트 작성은 서점 보유자(에디터)만 가능 (서점 필수화 정책)

## §2. 목표 & 성공 지표

### 비즈니스 목표

작가가 자신의 콘텐츠를 판매할 수 있는 독립적인 공간(서점)을 제공하여, "Write Once, Reach Global" 가치의 첫 번째 진입점을 만든다.

### SMART 성공 지표

| 구분      | 지표                              | 현재 | 목표       | 기한          |
| --------- | --------------------------------- | ---- | ---------- | ------------- |
| Business  | MVP 작가 서점 오픈 수             | 0    | 30개+      | 출시 1개월 내 |
| Business  | 서점 오픈 → 첫 포스트 발행 전환율 | 신규 | 80%+       | 출시 3개월 내 |
| Technical | 서점 페이지 로딩 (P95)            | 신규 | 1초 이내   | 출시 시점     |
| Technical | 서점 관리 API 응답 (P95)          | 신규 | 500ms 이내 | 출시 시점     |

## §3. 유저스토리

| ID   | 역할     | 유저스토리                                          | 가치                                        | 스코프       |
| ---- | -------- | --------------------------------------------------- | ------------------------------------------- | ------------ |
| US-1 | 유저     | 에디터 메뉴에서 서점을 오픈하고 싶다                | 내 작품을 발행·판매할 공간을 갖기 위해      | **MVP**      |
| US-2 | 유저     | 서점 프로필(필명, 소개글, 이미지)을 설정하고 싶다   | 독자에게 나를 알리고 정체성을 표현하기 위해 | **MVP**      |
| US-3 | 독자     | 작가의 서점 페이지를 방문하여 작품 목록을 보고 싶다 | 관심 작가의 작품을 한 곳에서 탐색하기 위해  | **MVP**      |
| US-4 | 유저     | 내 서점에서 작품 목록과 상태를 관리하고 싶다        | 발행된 작품을 효율적으로 관리하기 위해      | **MVP**      |
| US-5 | 작가     | 기존 플랫폼의 작품을 서점에 업로드하고 싶다         | 흩어진 작품을 한 곳에 모으기 위해           | Growth       |
| US-6 | 작가     | 발행 디폴트(유/무료, 가격, 등급)를 설정하고 싶다    | 매번 같은 설정을 반복하지 않기 위해         | Growth       |
| US-7 | ~~독자~~ | ~~서점에서 리뷰/응원의 글을 남기고 싶다~~           | ~~좋아하는 작가에게 피드백을 주기 위해~~    | **Spec Out** |

## §4. 유저 플로우

### 메인 플로우

**Flow 1: 서점 오픈 (US-1) [MVP]**

```
[에디터 메뉴] → [내 서점 페이지 (/editor/my-bookstore)]
  → 서점 미보유 시: 서점 오픈 폼 컴포넌트 분기 표시
  → [한국 유저 확인] → 비한국 유저: "현재 한국 유저만 서점 오픈 가능" 안내 → 종료
  → [서점 오픈 폼: 필명 + 서점명 입력] → [약관 동의] → [서점 생성 완료]
  → [서점 관리 대시보드로 전환]
```

**Flow 2: 프로필 설정 (US-2) [MVP]**

```
[서점 관리] → [프로필 편집]
  → [필명 수정 / 소개글 작성 / 프로필 이미지 업로드]
  → [저장] → [완료]
```

**Flow 3: 작품 업로드 및 마이그레이션 (US-5) [Growth]**

```
[서점 관리] → [작품 업로드]
  → [업로드 방식 선택]
    → Word/HWP 파일 업로드 → [파일 선택 (복수)] → [제목/본문 자동 파싱] → [확인/수정]
    → 직접 입력 → [에디터에서 작성]
  → [단편/시리즈 분류] → [썸네일 설정] → [저장]
```

**Flow 4: 발행 디폴트 설정 (US-6) [Growth]**

```
[서점 관리] → [발행 설정]
  → [단편 기본값: 유료/무료, 구매 가격, 성인/전체 이용가]
  → [저장]
[시리즈 생성/편집 시] → [시리즈별 기본값: 유료/무료, 구매 가격, 성인/전체 이용가]
  → [저장] → 이후 회차 발행 시 자동 적용 (편별 수정 가능)
```

**Flow 5: 서점 페이지 방문 (US-3, 독자 관점) [MVP]**

> 팔로우 대상은 유저 단위 (서점 단위가 아님, 향후 멀티 서점 대비)

```
[홈/검색/포스트 상세] → [작가 프로필 클릭]
  → [서점 페이지]
    ├── 장르 태그 배지 (서점 정체성 즉시 인지)
    ├── 최신 발행 섹션 (썸네일 그리드)
    ├── 인기 글 섹션 (썸네일 그리드)
    └── 탐색 메뉴: [단편 전체보기] / [시리즈 전체보기]
  → [작품 선택] → [포스트 상세 페이지]
```

**Flow 6: 서점 작품 관리 (US-4) [MVP]**

```
[서점 관리] → [작품 목록 탭]
  → [작품 상태별 필터: 전체/발행됨/임시저장/비공개]
  → [작품 선택] → [상태 변경 / 수정 / 삭제]
  → [작품 순서 변경 (드래그앤드롭)]
```

**Flow 7: 서점 리뷰 작성 (US-7, 독자 관점) [Growth]**

```
[서점 페이지] → [리뷰/응원 글 섹션]
  → [로그인 확인] → 비로그인: 로그인 유도
  → [리뷰 작성] → [등록] → [서점 페이지에 공개]
```

### 대안 플로우

- 이미 서점을 보유한 유저가 "내 서점" 접근 → 서점 관리 대시보드가 바로 표시
- 비로그인 독자가 서점 페이지 방문 → 열람 가능, 팔로우/구매/리뷰 시 로그인 유도
- Word/HWP 파일 파싱 실패 → 수동 입력으로 안내

## §5. 화면 정의

> 상세: `screens.yml` 참조

| ID      | 화면명               | Route                                                     | 뷰포트          |
| ------- | -------------------- | --------------------------------------------------------- | --------------- |
| SCR-011 | 서점 오픈 폼         | (별도 라우트 없음, /editor/my-bookstore 내 컴포넌트 분기) | Phone + Desktop |
| SCR-012 | 서점 관리 메인       | /editor/my-bookstore                                      | Phone + Desktop |
| SCR-013 | 서점 프로필 편집     | /editor/my-bookstore/profile                              | Phone + Desktop |
| SCR-014 | 서점 발행 설정       | /editor/my-bookstore/settings                             | Phone + Desktop |
| SCR-015 | 작품 업로드          | /editor/my-bookstore/upload                               | Phone + Desktop |
| SCR-016 | 작품 목록 관리       | /editor/my-bookstore/works                                | Phone + Desktop |
| SCR-017 | 서점 페이지 (독자용) | /bookstore/:id                                            | Phone + Desktop |
| SCR-018 | 서점 단편 전체       | /bookstore/:id/singles                                    | Phone + Desktop |
| SCR-019 | 서점 시리즈 전체     | /bookstore/:id/series                                     | Phone + Desktop |

## §6. 이벤트 정의

> 상세: `events.yml` 참조 (독자향 이벤트만, 작가향은 DB 트래킹)

| 이벤트                  | 카테고리    | 트리거              | 화면            |
| ----------------------- | ----------- | ------------------- | --------------- |
| bookstore_visited       | navigation  | 서점 페이지 진입    | SCR-017         |
| bookstore_post_clicked  | interaction | 서점에서 작품 클릭  | SCR-017/018/019 |
| bookstore_review_posted | interaction | 서점 리뷰 작성 완료 | SCR-017         |
| bookstore_followed      | conversion  | 서점 작가 팔로우    | SCR-017         |
| bookstore_tab_switched  | navigation  | 단편/시리즈 탭 전환 | SCR-017         |

## §7. 수용 기준 (Acceptance Criteria)

### US-1: 서점 오픈

- **AC-1.1**: Given 한국 유저가 로그인 상태이고 서점이 없을 때, When 에디터 메뉴에서 "내 서점"에 접근하면, Then 서점 오픈 폼(필명 + 서점명)이 컴포넌트 분기로 표시된다.
- **AC-1.2**: Given 유효한 필명과 서점명을 입력하고 약관에 동의했을 때, When "서점 오픈" 버튼을 클릭하면, Then 서점이 생성되고 서점 관리 페이지로 이동한다.
- **AC-1.3**: Given 비한국 유저가 서점 오픈을 시도할 때, When 내 서점 페이지에 접근하면, Then "현재 한국 유저만 서점 오픈 가능" 안내가 표시된다.
- **AC-1.4**: Given 이미 서점을 보유한 유저일 때, When 내 서점 페이지에 접근하면, Then 서점 관리 대시보드가 표시된다.

### US-2: 서점 프로필 설정

- **AC-2.1**: Given 서점 보유 유저가 프로필 편집 페이지에 접근할 때, When 필명/소개글/이미지를 수정하고 저장하면, Then 변경 사항이 서점 페이지에 즉시 반영된다.

### US-3: 서점 페이지 방문

- **AC-3.1**: Given 독자가 서점 페이지에 방문할 때, When 페이지가 로드되면, Then 장르 태그 배지, 최신 발행 섹션, 인기 글 섹션, 리뷰 섹션이 표시된다.
- **AC-3.2**: Given 독자가 서점 페이지에서 "단편 전체보기"를 클릭할 때, When 탭이 전환되면, Then 서점 내 모든 단편 작품이 썸네일 그리드로 표시된다.
- **AC-3.3**: Given 비로그인 독자가 서점 페이지를 방문할 때, When 팔로우/리뷰 버튼을 클릭하면, Then 로그인 유도 화면이 표시된다.

### US-4: 작품 관리

- **AC-4.1**: Given 작가가 작품 목록 관리 페이지에 접근할 때, When 상태 필터를 선택하면, Then 해당 상태의 작품만 표시된다.
- **AC-4.2**: Given 작가가 작품 순서를 변경할 때, When 드래그앤드롭으로 순서를 조정하면, Then 변경된 순서가 서점 페이지에 반영된다.

### US-5: 기존 작품 업로드

- **AC-5.1**: Given 작가가 작품 업로드 페이지에서 Word/HWP 파일을 업로드할 때, When 파일이 파싱되면, Then 제목과 본문이 자동 추출되어 확인/수정 화면이 표시된다.
- **AC-5.2**: Given 파일 파싱에 실패했을 때, When 에러가 발생하면, Then "수동 입력으로 전환" 안내가 표시된다.

### US-6: 발행 디폴트 설정

- **AC-6.1**: Given 작가가 발행 설정 페이지에서 단편 기본값(유/무료, 가격, 등급)을 설정할 때, When 새 단편을 발행하면, Then 디폴트 값이 자동 적용되고 편별 수정이 가능하다.
- **AC-6.2**: Given 작가가 시리즈 생성 시 기본값을 설정할 때, When 해당 시리즈의 새 회차를 발행하면, Then 시리즈 디폴트 값이 자동 적용된다.

### US-7: 서점 리뷰 -- **Spec Out**

- ~~**AC-7.1**: Given 로그인한 독자가 서점 페이지에서 리뷰를 작성할 때, When "등록" 버튼을 클릭하면, Then 리뷰가 서점 페이지 리뷰 섹션에 공개된다.~~

## §8. 기술 요건

> 상세: `IMPLEMENTATION_GUIDE.md` 참조

### 새 Entity

| Entity                | 테이블            | 설명                                                                                                                                                                                              |
| --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BookstoreEntity       | bookstores        | 서점 정보 (userId, penName, storeName, bio, profileImage, genreTags:jsonb, country:enum, termsAgreedAt). 발행 디폴트(defaultAccessLevel, defaultPrice, defaultAgeRating)는 임베디드 컬럼으로 포함 |
| BookstoreReviewEntity | bookstore_reviews | 서점 리뷰 (bookstoreId, reviewerId, content)                                                                                                                                                      |

### 기존 Entity 변경

| Entity     | 변경 내용                                                                       |
| ---------- | ------------------------------------------------------------------------------- |
| PostEntity | `bookstoreId` (NOT NULL, 기존 포스트 삭제 후), `sortOrder` (nullable) 컬럼 추가 |

### 새 tRPC Router

| Router          | 주요 Procedure                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------- |
| bookstore       | open, getMyBookstore, updateProfile, updateSettings, getById, getPosts, getMyWorks, updatePostOrder |
| bookstoreReview | create, update, delete, getByBookstore                                                              |
| upload          | image, document (Word/HWP 파싱)                                                                     |

### DB 마이그레이션 (순서 중요)

1. `bookstores` 테이블 생성 (FK: user_id → users, UQ: user_id, 발행 디폴트 컬럼 포함)
2. `bookstore_reviews` 테이블 생성 (FK: bookstore_id, reviewer_id)
3. `posts` 테이블에 `bookstore_id`, `sort_order` 컬럼 추가

### 외부 의존성

| 라이브러리               | 용도                         |
| ------------------------ | ---------------------------- |
| mammoth                  | Word(.docx) → HTML 파싱      |
| hwp.js                   | HWP 파일 파싱 (MVP: 베타)    |
| multer                   | Express 파일 업로드 미들웨어 |
| @aws-sdk/client-s3       | 파일 스토리지 (이미지, 문서) |
| @dnd-kit/core + sortable | 작품 순서 드래그앤드롭 (FE)  |

### 파일 업로드 인프라 (신규 구축)

현재 파일 업로드 인프라가 없으므로 완전 신규 구축 필요:

- 이미지 업로드: 프로필, 커버, 썸네일
- 문서 업로드: Word/HWP 파일 파싱 후 텍스트 추출

## §9. 엣지 케이스 & 에러 처리

### 서점 오픈

| ID   | 엣지 케이스                     | 처리                                     |
| ---- | ------------------------------- | ---------------------------------------- |
| E-01 | 동일 유저 서점 오픈 중복 요청   | DB Unique Constraint + ConflictException |
| E-02 | 비한국 유저 API 직접 호출       | Service 레이어에서 country 검증          |
| E-03 | 부적절한 필명/서점명            | Zod 정규식 + 금칙어 필터                 |
| E-04 | 이미 서점 보유 유저 재오픈 시도 | 기존 서점 체크 + ConflictException       |
| E-05 | 필명 중복                       | 허용 (서점 ID로 구분)                    |

### 파일 업로드

| ID   | 엣지 케이스             | 처리                                    |
| ---- | ----------------------- | --------------------------------------- |
| E-07 | 대용량 파일 (>10MB)     | 파일 크기 제한                          |
| E-08 | 악성 파일 (위장 확장자) | MIME 타입 + 매직바이트 검증             |
| E-09 | 파싱 실패 (손상/암호화) | "수동 입력으로 전환" 안내               |
| E-10 | 파싱 결과 내 이미지     | MVP: 텍스트만 추출, Growth: 이미지 포함 |

### 보안

| ID   | 엣지 케이스                  | 처리                                                  |
| ---- | ---------------------------- | ----------------------------------------------------- |
| E-16 | 타인 서점 프로필 수정 시도   | bookstore.userId === ctx.user.sub 검증                |
| E-17 | 타인 리뷰 삭제 시도          | review.reviewerId === ctx.user.sub 검증               |
| E-18 | XSS (소개글/리뷰에 스크립트) | HTML 태그 스트립 + 이스케이프                         |
| E-21 | 리뷰 스팸                    | 유저당 서점별 1개 제한 (UQ: bookstoreId + reviewerId) |

## §10. 우선순위 & 스코프

### MVP (이번 Feature)

서점 오픈 + 프로필 + 독자용 서점 페이지 + 작품 관리

| 항목        | 범위                                           |
| ----------- | ---------------------------------------------- |
| Entity      | BookstoreEntity, PostEntity에 bookstoreId 추가 |
| 서점 오픈   | open, hasBookstore, 한국 유저 제한             |
| 프로필      | updateProfile, getMyBookstore, getById         |
| 독자 페이지 | 서점 페이지 (프로필 + 최신 포스트 목록)        |
| 작품 관리   | getMyWorks (상태 필터)                         |

### Growth (다음 이터레이션)

| 항목           | 범위                                  |
| -------------- | ------------------------------------- |
| 리뷰 시스템    | BookstoreReviewEntity + CRUD          |
| 발행 디폴트    | PublishDefaultEntity + 설정 UI        |
| 파일 업로드    | DOCX 파싱 (mammoth), 이미지 S3 업로드 |
| 인기 글 섹션   | 조회수 기반 인기 포스트 정렬          |
| 장르 태그      | 서점 페이지 배지 표시                 |
| 작품 순서 변경 | 드래그앤드롭 UI                       |
| 해외 작가      | country 제한 해제                     |

### Vision (장기)

| 항목                       | 범위                         |
| -------------------------- | ---------------------------- |
| HWP 파싱                   | hwp.js 서버사이드 변환       |
| 브라우저 확장 마이그레이션 | 포스타입 + 투비컨티뉴드      |
| 서점 커스터마이징          | 테마, 레이아웃 선택          |
| 서점 통계 대시보드         | 방문자, 매출, 인기 작품 분석 |
| 문장 하이라이트 코멘트     | 전자책 뷰어 내 실시간 코멘트 |

## §11. 참조 문서

- **Product Brief**: PM-DOCS/Context Output/PRODUCT_BRIEF.md
- **CIS 산출물 (Brainstorming)**: PM-DOCS/Context Output/brainstorming_2026-03-03_mvp-feature-decomposition.md
- **CIS 산출물 (Design Thinking)**: PM-DOCS/Context Output/design-thinking_2026-03-21_bookstore-system.md
- **구현 가이드**: PM-DOCS/Planning/Feature_PRD/feature#2_bookstore/IMPLEMENTATION_GUIDE.md
- **F1 인증 PRD**: PM-DOCS/Planning/Feature_PRD/feature#1_auth/PRD.md

## 변경 이력

### [2026-03-25] 코드 리뷰 반영 문서 업데이트

- **라우터 경로 변경**: `/my-bookstore/*` → `/editor/my-bookstore/*` (에디터 영역 그룹화)
- **서점 오픈 페이지 삭제**: `/bookstore/open` 별도 라우트 제거 → `/editor/my-bookstore` 내 컴포넌트 분기
- **PublishDefault 임베디드 전환**: 별도 테이블(`publish_defaults`) → BookstoreEntity 내 임베디드 컬럼
- **서점 필수화 정책 명시**: 포스트 작성은 서점 보유자(에디터)만 가능
- **팔로우 대상 명시**: 유저 단위 팔로우 (서점 단위 아님, 멀티 서점 대비)
- **영향**: §1 MVP 제약, §4 유저 플로우, §5 화면 정의, §7 수용 기준, §8 기술 요건 업데이트

### [2026-03-25] US-7 서점 리뷰 Spec Out

- **결정**: 서점 자체 리뷰 기능 제거 (US-7, #121)
- **사유**: 서점 자체에 리뷰를 다는 UX가 어색함. 향후 작품(Post) 리뷰를 서점 메인 화면에 인기 리뷰로 노출하는 별도 feature로 기획 예정.
- **영향**: BookstoreReviewEntity 삭제, bookstoreReview Router 삭제, 관련 FE 컴포넌트(ReviewSection/Form/Item) 삭제
- **관련 이슈**: #121 → closed (spec out)
