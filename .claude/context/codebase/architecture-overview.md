---
name: codebase-architecture-overview
description: Readly 시스템 구성 - 포트, 기술 스택, 폴더 구조, 주요 명령어
keywords: [아키텍처, tRPC, NestJS, React, Vite, PostgreSQL, TypeORM, 포트]
estimated_tokens: ~400
related_contexts:
  - business-overview
  - codebase-seo-implementation
---

# 시스템 아키텍처

## 기술 스택

- **Backend**: tRPC + NestJS
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL + TypeORM

## 개발 환경

- **Node.js**: v22 (`.nvmrc` 참조)
- **Package Manager**: Yarn (v4.x)
- **Language**: TypeScript (strict mode)

## 개발 서버 포트

| 서비스  | 포트 |
| ------- | ---- |
| API     | 3000 |
| Web App | 5173 |

## 폴더 구조

```
readly/
├── apps/
│   ├── api/          # tRPC + NestJS API
│   └── client/       # 팔로워 + 에디터 통합 웹앱 (단일 배포)
├── packages/
│   └── api-types/    # API 타입 정의
├── PM-DOCS/          # PM 기획 문서
└── docker/           # Docker 설정
```

## 주요 명령어

```bash
# 루트
yarn lint          # 코드 린팅
yarn lint:fix      # 린트 자동 수정

# API (apps/api)
yarn workspace api dev           # API 서버 시작
yarn workspace api migration:run # 데이터베이스 마이그레이션

# Client (apps/client)
yarn workspace client dev        # Web App 시작
```

## 환경 변수

```bash
# API
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Frontend
VITE_API_URL=http://localhost:3000
```

## 서비스 구성 다이어그램

```
┌─────────────────────────────────────────┐
│           Frontend                      │
├─────────────────────────────────────────┤
│  Web App :5173                          │
│  ├─ Express SSR Server (메타태그 주입)   │
│  └─ React SPA (팔로워 + 에디터 통합)     │
└────────────┬────────────────────────────┘
             │
             ├─ tRPC Client
             │
┌────────────▼────────────────────────────┐
│  API Server :3000                       │
│  ├─ tRPC + NestJS                       │
│  └─ JWT 인증, 결제 처리                  │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  PostgreSQL (TypeORM)                   │
│  ├─ UserEntity                          │
│  └─ PostEntity                          │
└─────────────────────────────────────────┘
```

## 관련 문서

- `business/overview.md`: 서비스 구성 상세
- `codebase/user-entity.md`: UserEntity 구조
- `codebase/post-entity.md`: PostEntity 구조
- `codebase/seo-implementation.md`: SSR 서버 구현
