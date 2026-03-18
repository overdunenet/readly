---
name: error-handling
description: API 서버 에러 처리 - MicroserviceExceptionFilter 글로벌 예외 필터 및 로깅 전략
keywords: [에러처리, ExceptionFilter, 로깅, Logger, NestJS, tRPC]
---

# 에러 처리

API 서버의 글로벌 예외 처리 및 로깅 구조를 설명합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/filters/microservice-exception.filter.ts | tRPC 마이크로서비스 글로벌 예외 필터 | MicroserviceExceptionFilter |
| apps/api/src/filters/microservice-exception.filter.spec.ts | 예외 필터 단위 테스트 | - |
| apps/api/src/main.ts | 필터 등록 (useGlobalFilters) | bootstrap() |

## 핵심 흐름

1. `main.ts`에서 `MicroserviceExceptionFilter`를 글로벌 필터로 등록
2. tRPC 요청 처리 중 예외 발생 시 필터가 자동으로 catch
3. 예외 유형별 로깅 분기:
   - `HttpException` 5xx → `logger.error` (message + stack)
   - `HttpException` 4xx → `logger.warn` (status + message)
   - 일반 `Error` → `logger.error` (message + stack)
   - 알 수 없는 에러 → `logger.error` ("Unknown error: ...")
4. 모든 경우 `throwError()`로 원래 예외를 재전파

## 로깅 전략

- NestJS 내장 `Logger` 사용 (클래스명 기반 컨텍스트: `MicroserviceExceptionFilter`)
- 5xx 서버 에러와 일반 Error는 `error` 레벨로 스택 트레이스 포함
- 4xx 클라이언트 에러는 `warn` 레벨로 상태코드와 메시지만 기록

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
