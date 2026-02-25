---
name: codebase-context-index
description: Codebase Context 인덱스 - Readly 구현 아키텍처 및 Entity 구조
keywords: [코드베이스, 구현, 아키텍처, Entity, tRPC, 프리렌더링]
estimated_tokens: ~150
---

# Codebase Context 인덱스

이 폴더는 Readly 서비스의 **구현 방법과 코드 구조**를 담고 있습니다.
"어떻게 구현되어 있는가", "어떤 기술을 사용하는가"에 대한 답입니다.

## 문서 목록

| 문서                                                   | 설명                                |
| ------------------------------------------------------ | ----------------------------------- |
| [architecture-overview.md](./architecture-overview.md) | 시스템 구성, 포트, 기술 스택        |
| [user-entity.md](./user-entity.md)                     | UserEntity 구조, JWT 인증, 프론트엔드 User 타입 및 인증 스토어 |
| [post-entity.md](./post-entity.md)                     | PostEntity 구조, 권한 검증 로직, PostService |
| [seo-implementation.md](./seo-implementation.md)       | 빌드 타임 프리렌더링 구현 (Vite Plugin, Helmet) |
| [test-infrastructure.md](./test-infrastructure.md) | 통합 테스트 인프라 (트랜잭션 rollback 격리, CI 워크플로우) |
| [context-handoff.md](./context-handoff.md)         | Context Handoff Skill 구조            |
| [prompt-structuring.md](./prompt-structuring.md)   | Prompt Structuring Skill 구조         |
| [follow-module.md](./follow-module.md)             | Follow 모듈 (팔로우/언팔로우, BE+FE)   |
| [post-editor.md](./post-editor.md)                | CKEditor 5 포스트 에디터 UI 및 스타일링 |
| [post-manage-ui.md](./post-manage-ui.md)          | 에디터 포스트 목록 관리 UI (필터, 검색, 액션) |

## 빠른 참조

### 핵심 기술

- **Backend**: tRPC + NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS
- **인증**: JWT (Access 15분, Refresh 7일)
- **SEO**: 빌드 타임 프리렌더링 (Vite Plugin + Puppeteer + react-helmet-async)

### Entity 요약

**UserEntity**: email, password(bcrypt), nickname, profileImage
**PostEntity**: freeContent, paidContent, accessLevel, status, price
**FollowEntity**: followerId, followeeId (Unique Constraint)

### 포트

- API: 3000
- Web App: 5173
- Backoffice: 5175

### 관련 Business Context

- `business/overview.md`: 서비스 비전 및 Flow
- `business/access-control.md`: 접근 권한 정책
- `business/seo-strategy.md`: SEO 전략 배경
