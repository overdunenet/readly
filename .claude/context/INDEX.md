---
name: Context-Index
description: Context 문서 전체 인덱스. 아키텍처, 도메인 문서 참조.
keywords: [인덱스, context, 아키텍처, 도메인, 참조]
estimated_tokens: ~200
---

# Context 문서 인덱스

## 기획 (`planning/`)

| 문서                     | 설명                                               |
| ------------------------ | -------------------------------------------------- |
| [planning/](./planning/) | PM 기획 문서 요약 (Roadmap, PRD) - **최우선 참조** |

## 아키텍처 (`architecture/`)

| 문서                                      | 설명                                                |
| ----------------------------------------- | --------------------------------------------------- |
| [INDEX.md](./architecture/INDEX.md)       | 시스템 아키텍처 개요                                |
| [backend.md](./architecture/backend.md)   | 백엔드 상세 (Microservice + tRPC, Transaction 패턴) |
| [frontend.md](./architecture/frontend.md) | 프론트엔드 상세 (TanStack Router, 인증 흐름)        |

## 도메인 (`domain/`)

| 문서                                | 설명                                             |
| ----------------------------------- | ------------------------------------------------ |
| [overview.md](./domain/overview.md) | 프로젝트 기획서 (비전, 사용자 유형, 서비스 구성) |
| [features.md](./domain/features.md) | 기능 명세 (접근 권한, 유료/무료 섹션, 결제)      |
| [user.md](./domain/user.md)         | User 도메인 (Entity, Service, Router)            |
| [post.md](./domain/post.md)         | Post 도메인 (Entity, 유료/무료 섹션, 접근 권한)  |
| [seo.md](./domain/seo.md)           | SEO 전략 (Partial SSR, 메타태그 서버 주입)       |

## 빠른 참조

### 백엔드 개발 시

1. **새 Entity 추가**: `context/architecture/backend.md` → 모듈 추가 체크리스트
2. **Repository 패턴**: `context/architecture/backend.md` → Repository 패턴
3. **인증 미들웨어**: `context/domain/user.md` → UserRouter

### 프론트엔드 개발 시

1. **라우팅 추가**: `context/architecture/frontend.md` → TanStack Router 구조
2. **인증 흐름**: `context/architecture/frontend.md` → 인증 흐름
3. **API 호출**: `context/architecture/frontend.md` → tRPC 클라이언트

### 비즈니스 로직

1. **프로젝트 기획**: `context/domain/overview.md` → 비전, 주요 Flow
2. **유료/무료 섹션**: `context/domain/post.md` → 유료/무료 섹션 구분
3. **접근 권한**: `context/domain/post.md` → 접근 권한 시스템
4. **JWT 인증**: `context/domain/user.md` → JWT 설정
5. **SEO 전략**: `context/domain/seo.md` → Partial SSR, 메타태그 서버 주입
