---
name: System-Architecture
description: Readly 시스템 아키텍처 개요. 기술 스택, 디렉토리 구조.
keywords: [아키텍처, tRPC, NestJS, React, PostgreSQL, 모노레포]
estimated_tokens: ~500
---

# 시스템 아키텍처

## 개요

Readly는 모노레포 구조의 풀스택 애플리케이션입니다. tRPC를 통한 타입 안전한 API와 NestJS의 강력한 백엔드 기능을 결합했습니다.

## 아키텍처 다이어그램

```mermaid
flowchart TB
    subgraph Frontend["Frontend Apps"]
        subgraph WebApp["Web App"]
            SSR["Express SSR Server<br/>(메타태그 주입)"]
            SPA["React SPA<br/>(팔로워 + 에디터 통합)"]
        end
    end

    subgraph API["API Gateway (tRPC + NestJS)"]
        Auth["Auth Module"]
        User["User Module"]
        Post["Post Module"]
        Payment["Payment Module"]
        Subscription["Subscription Module"]
        Admin["Admin Module"]
    end

    subgraph Storage["Storage"]
        PostgreSQL[(PostgreSQL)]
    end

    SSR -->|SEO 데이터 조회| API
    SPA -->|tRPC Client| API
    API --> PostgreSQL
```

## 기술 스택

### Backend

- **Framework**: NestJS + tRPC
- **Database**: PostgreSQL
- **ORM**: TypeORM

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **SSR**: Partial SSR (Express + 메타태그 문자열 치환, React SSR 미사용)
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
│   └── client/              # 팔로워 + 에디터 통합 웹앱 (단일 배포)
├── packages/
│   └── api-types/           # API 타입 정의
├── PM-DOCS/                 # PM 기획 문서
└── docker/                  # Docker 설정
```

> `apps/client`가 팔로워와 에디터 기능을 통합하여 단일 Web App으로 배포됩니다.

## 데이터 플로우

### 인증 플로우

```mermaid
flowchart LR
    A["Client"] --> B["tRPC"]
    B --> C["Auth Guard"]
    C --> D["JWT Validation"]
    D --> E["Protected Resource"]
```

### 포스트 조회 플로우

```mermaid
flowchart LR
    A["Client"] --> B["tRPC"]
    B --> C["Post Router"]
    C --> D["Access Check"]
    D --> E["Post Service"]
    E --> F["Database"]
```

## 보안 아키텍처

- **인증**: JWT (Access Token + Refresh Token in Cookie)
- **인가**: Role-Based Access Control
- **API 보안**: Rate Limiting, CORS
- **암호화**: bcrypt (비밀번호)
