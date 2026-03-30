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

| 서비스     | 포트 |
| ---------- | ---- |
| API        | 3000 |
| Web App    | 5173 |
| Backoffice | 5175 |

## 폴더 구조

```
readly/
├── apps/
│   ├── api/          # tRPC + NestJS API
│   ├── client/       # 팔로워 + 에디터 통합 웹앱 (단일 배포)
│   └── backoffice/   # 관리자용 React 앱
├── packages/
│   ├── shared/       # 공통 유틸리티
│   ├── ui/           # 공통 UI 컴포넌트
│   └── api-types/    # API 타입 정의
├── docs/             # 프로젝트 문서
└── docker/           # Docker 설정
```

## 주요 명령어

```bash
# 개발 서버
yarn dev           # 모든 서비스 개발 서버 시작
yarn dev:api       # API 서버만 시작
yarn dev:client    # Web App(팔로워+에디터) 시작
yarn dev:backoffice # Backoffice 앱만 시작

# 빌드/린트
yarn lint          # ESLint 실행
yarn typecheck     # TypeScript 체크
yarn build         # 프로덕션 빌드

# DB 작업
yarn db:migrate    # 마이그레이션 실행
yarn db:seed       # 시드 데이터 삽입
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
│                                         │
│  Backoffice :5175 (관리자용)            │
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

## BFF 아키텍처 원칙

### 구현 순서: FE → DB → API

FE가 필요로 하는 데이터 구조를 먼저 정의하고, 이에 맞춰 DB 스키마와 API를 설계한다.

### 복잡도 가드레일

DB/API 구현이 FE가 제공하는 가치 대비 과도하게 복잡해지면:

1. FE 설계 변경을 제안하거나
2. Phase를 분리하여 GitHub Issue로 등록한다

### Router의 BFF 역할

tRPC Router는 FE 페이지/컴포넌트에 최적화된 응답을 조합하는 BFF 레이어로 동작한다.

- Router: FE 요구사항에 맞춘 데이터 조합/변환 (클라이언트 종속)
- Service: 도메인 비즈니스 로직 (클라이언트 독립, 재사용 가능)

## 관련 문서

- `business/overview.md`: 서비스 구성 상세
- `codebase/user-entity.md`: UserEntity 구조
- `codebase/post-entity.md`: PostEntity 구조
- `codebase/seo-implementation.md`: SSR 서버 구현
