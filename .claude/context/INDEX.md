---
name: Context-Index
description: Context 문서 전체 인덱스. 하위 폴더별 INDEX.md로 안내.
keywords: [인덱스, context, 아키텍처, 비즈니스, 코드베이스, 기획]
estimated_tokens: ~200
---

# Context 문서 인덱스

각 하위 폴더의 `INDEX.md`에 상세 목록이 있습니다.

| 폴더            | 설명                                               | 상세                                |
| --------------- | -------------------------------------------------- | ----------------------------------- |
| `planning/`     | PM 기획 문서 요약 (Roadmap, PRD) - **최우선 참조** | [INDEX.md](./planning/INDEX.md)     |
| `architecture/` | 시스템 아키텍처 (백엔드, 프론트엔드 설계)          | [INDEX.md](./architecture/INDEX.md) |
| `business/`     | 비즈니스 도메인 (기획, 접근 권한, 결제, SEO)       | [INDEX.md](./business/INDEX.md)     |
| `codebase/`     | 코드베이스 상세 (Entity, 모듈, 구현 가이드)        | [INDEX.md](./codebase/INDEX.md)     |

## 빠른 참조

### 백엔드 개발 시

1. **새 Entity 추가**: `architecture/backend.md` → 모듈 추가 체크리스트
2. **Repository 패턴**: `architecture/backend.md` → Repository 패턴
3. **User Entity**: `codebase/user-entity.md` → User 도메인 구현
4. **Post Entity**: `codebase/post-entity.md` → Post 도메인 구현
5. **Follow 모듈**: `codebase/follow-module.md` → 팔로우 기능 구현

### 프론트엔드 개발 시

1. **라우팅 추가**: `architecture/frontend.md` → TanStack Router 구조
2. **인증 흐름**: `architecture/frontend.md` → 인증 흐름
3. **API 호출**: `architecture/frontend.md` → tRPC 클라이언트
4. **SEO 구현**: `codebase/seo-implementation.md` → SEO 구현 상세

### 비즈니스 로직

1. **프로젝트 기획**: `business/overview.md` → 비전, 주요 Flow
2. **접근 권한**: `business/access-control.md` → 접근 권한 시스템
3. **결제**: `business/payment.md` → 유료/무료 섹션, 결제 흐름
4. **SEO 전략**: `business/seo-strategy.md` → Partial SSR, 메타태그 서버 주입
5. **팔로우**: `business/user-follow.md` → 사용자 팔로우 기능
