---
name: ci-build-client
description: 클라이언트 빌드 검증 CI 워크플로우 - yarn 캐시, 빌드 체크
keywords: [CI, build, client, workflow, yarn, cache, GitHub Actions]
estimated_tokens: ~200
related_contexts:
  - codebase-architecture-overview
  - codebase-seo-implementation
---

# 클라이언트 빌드 CI

클라이언트(React + Vite) 빌드가 PR 단계에서 정상 동작하는지 검증하는 GitHub Actions 워크플로우입니다.

## 파일 구조

| 파일 | 역할 | 핵심 단계 |
| ---- | ---- | --------- |
| .github/workflows/build-client.yml | 클라이언트 빌드 검증 | yarn cache → install → build |

## 핵심 흐름

1. PR 이벤트 발생 (대상 경로: `apps/client/**`, `packages/**`)
2. Node.js 22 설정 + corepack enable (Yarn Berry 지원)
3. yarn 캐시 복원 (`actions/cache@v4`, `yarn.lock` 해시 기반 키)
4. yarn install → `yarn workspace @readly/client build` 실행

## 캐시 전략

| 캐시 대상 | 키 패턴 | 설명 |
| --------- | ------- | ---- |
| yarn cache folder | `yarn-{OS}-{yarn.lock hash}` | Yarn Berry 패키지 캐시 |
| node_modules, apps/*/node_modules, packages/*/node_modules | 동일 | 설치된 의존성 캐시 |

### 캐시 동작

- **캐시 히트**: yarn.lock이 변경되지 않으면 이전 캐시를 복원하여 install 시간 단축
- **캐시 미스**: `yarn-{OS}-` 접두사로 부분 매칭하여 가장 최근 캐시 복원

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md): CI 성능 최적화
