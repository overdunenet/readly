---
name: test-infrastructure
description: API 통합 테스트 인프라 - 트랜잭션 rollback 격리, TestingModule 구성
keywords: [테스트, jest, 통합테스트, 트랜잭션, rollback, TestingModule]
estimated_tokens: ~300
related_contexts:
  - codebase-user-entity
  - codebase-architecture-overview
---

# 테스트 인프라

API 서비스의 통합 테스트를 위한 유틸리티와 패턴을 정의합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/상수 |
| ---- | ---- | -------------- |
| apps/api/test/jest-util.ts | 테스트 유틸리티 | getTestingModule(), getTestingEntityManager(), mockJestRepository(), testingRepositoryProvider |
| apps/api/tsconfig.json | Path alias 정의 | @src/* -> ./src/*, @test/* -> ./test/* |

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

## 관련 Business Context

- [overview.md](../business/overview.md): 서비스 비전 및 주요 Flow
