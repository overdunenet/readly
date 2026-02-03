# 시스템 아키텍처

## 개요

Readly는 모노레포 구조의 풀스택 애플리케이션입니다. tRPC를 통한 타입 안전한 API와 NestJS의 강력한 백엔드 기능을 결합했습니다.

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend Apps                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     Client      │     Editor      │        Backoffice           │
│   (팔로워용)     │   (에디터용)      │        (관리자용)           │
└────────┬────────┴────────┬────────┴────────┬────────────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                          │
                    tRPC Client
                          │
┌─────────────────────────┴─────────────────────────────────────────┐
│                        API Gateway                                 │
│                    (tRPC Server + NestJS)                         │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │    Post     │  │   Payment   │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    User     │  │ Subscription│  │   Admin     │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────┴────────┐              ┌────────┴────────┐
│   PostgreSQL    │              │      Redis      │
│   (Primary DB)  │              │     (Cache)     │
└─────────────────┘              └─────────────────┘
```

## 기술 스택

### Backend

- **Framework**: NestJS + tRPC
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Queue**: Bull

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + tailwind-styled-components
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Router**: TanStack Router

## 디렉토리 구조

```
readly/
├── apps/
│   ├── api/                 # Backend API
│   │   └── src/
│   │       ├── module/      # NestJS 모듈
│   │       └── shared/      # 공통 유틸리티
│   ├── client/              # 팔로워 웹앱
│   ├── editor/              # 에디터 웹앱
│   └── backoffice/          # 관리자 웹앱
├── packages/
│   ├── shared/              # 공통 유틸리티
│   ├── ui/                  # UI 컴포넌트
│   └── api-types/           # API 타입 정의
└── docker/                  # Docker 설정
```

## 데이터 플로우

### 인증 플로우

```
Client → tRPC → Auth Guard → JWT Validation → Protected Resource
```

### 포스트 조회 플로우

```
Client → tRPC → Post Router → Access Check → Post Service → Database
                                    ↓
                              Redis Cache
```

## 보안 아키텍처

- **인증**: JWT (Access Token + Refresh Token in Cookie)
- **인가**: Role-Based Access Control
- **API 보안**: Rate Limiting, CORS
- **암호화**: bcrypt (비밀번호)
