---
name: test-infrastructure
description: API 통합 테스트 인프라 - 트랜잭션 rollback 격리, TestingModule 구성, CI 워크플로우
keywords: [테스트, jest, 통합테스트, 트랜잭션, rollback, TestingModule, CI, workflow, corepack]
estimated_tokens: ~400
related_contexts:
  - codebase-user-entity
  - codebase-architecture-overview
---

# 테스트 인프라

API 서비스의 통합 테스트를 위한 유틸리티와 패턴을 정의합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/상수 |
| ---- | ---- | -------------- |
| apps/api/config/test.js | 테스트 환경 설정 | database (PostgreSQL, ssl: false), auth (JWT secrets), cors |
| apps/api/test/jest-util.ts | 테스트 유틸리티 | getTestingModule(), getTestingEntityManager(), mockJestRepository(), testingRepositoryProvider |
| apps/api/tsconfig.json | Path alias 정의 | @src/* -> ./src/*, @test/* -> ./test/* |
| .github/workflows/test-api.yml | CI 워크플로우 | PostgreSQL 16 서비스, corepack enable, yarn test |

## 핵심 흐름

### 트랜잭션 rollback 격리

1. `getTestingModule()` → NestJS TestingModule 생성, TransactionService/RepositoryProvider를 테스트용으로 override
2. `getTestingEntityManager()` → QueryRunner 생성 → 트랜잭션 시작 → EntityManager를 TransactionService에 등록 → Repository mock 적용
3. 테스트 실행 → Service 메서드가 트랜잭션 내 DB 조작
4. afterEach → `queryRunner.rollbackTransaction()` → DB 변경 전부 취소

### TestingModule 구성

1. `AppModule` 전체를 import하여 실제 DI 컨테이너 사용
2. `TransactionService`를 테스트 전용 인스턴스로 override
3. `RepositoryProvider`를 테스트 전용 인스턴스로 override
4. `mockJestRepository()`로 UserRepository/PostRepository getter를 트랜잭션 내 EntityManager로 교체

## 의존 관계

```
jest-util.ts
├── @src/app.module (AppModule)
├── @src/database/datasources (DataSources)
├── @src/module/domain/user.entity (getUserRepository)
├── @src/module/domain/post.entity (getPostRepository)
├── @src/module/shared/transaction/repository.provider (RepositoryProvider)
└── @src/module/shared/transaction/transaction.service (TransactionService)
```

## 테스트 생명주기 패턴

| 단계 | 함수 | 설명 |
| ---- | ---- | ---- |
| beforeAll | DataSources.readly.initialize() | DB 연결 초기화 |
| beforeAll | getTestingModule() | NestJS TestingModule 생성 |
| beforeEach | getTestingEntityManager() | 트랜잭션 시작 + Repository mock |
| afterEach | queryRunner.rollbackTransaction() | DB 변경 롤백 |
| afterAll | DataSources.readly.destroy() | DB 연결 해제 |

## 테스트 환경 설정 (apps/api/config/test.js)

| 항목 | 값 | 설명 |
| ---- | -- | ---- |
| database.host | 127.0.0.1:55432 | 로컬 PostgreSQL |
| database.ssl | false | CI/로컬 환경에서 SSL 비활성화 |
| auth.jwt | TEST_* secrets | 테스트 전용 JWT 시크릿 |

## CI 워크플로우

| 파일 | 트리거 | 대상 경로 |
| ---- | ------ | --------- |
| .github/workflows/test-api.yml | pull_request | apps/api/**, packages/** |

### 실행 단계

1. PostgreSQL 16 서비스 컨테이너 시작 (포트 55432)
2. Node.js 20 설정 + corepack enable (Yarn Berry 지원)
3. yarn install → apps/api에서 yarn test --verbose 실행

## 관련 Business Context

- [overview.md](../business/overview.md): 서비스 비전 및 주요 Flow
