---
name: ci-workflows
description: GitHub Actions CI/CD 워크플로우 구성 (코드 리뷰, Context 생성, 테스트, 배포)
keywords: [CI, CD, GitHub Actions, 워크플로우, 코드리뷰, 테스트]
---

# CI Workflows

GitHub Actions를 활용한 CI/CD 파이프라인 구성.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|-----------|
| .github/workflows/claude-code-review.yml | Claude Code 기반 PR 코드 리뷰 | anthropics/claude-code-action@v1, plugin: code-review |
| .github/workflows/context-gen.yml | PR diff 기반 Context 문서 자동 생성 | anthropics/claude-code-action@v1, context-generator agent |
| .github/workflows/test-api.yml | API 통합 테스트 (PostgreSQL) | postgres:16-alpine, yarn test |
| .github/workflows/build-client.yml | 클라이언트 빌드 | - |
| .github/workflows/deploy-api.yml | API 배포 | - |
| .github/workflows/claude.yml | Claude Code 일반 실행 | - |
| .github/workflows/labeler.yml | PR 라벨링 | - |

## 핵심 흐름

1. PR 생성/업데이트 → `claude-code-review.yml` 트리거 → Claude Code plugin 기반 코드 리뷰
2. PR 생성/업데이트 → `context-gen.yml` 트리거 → Context 문서 자동 생성 → 별도 브랜치에 push → Context PR 생성
3. PR에 `apps/api/**` 변경 포함 → `test-api.yml` 트리거 → PostgreSQL 서비스 컨테이너에서 통합 테스트

## 무한 루프 방지

`claude-code-review.yml`과 `context-gen.yml` 모두 `paths-ignore: .claude/context/**`를 설정하여, Context 문서 변경이 워크플로우를 재트리거하지 않도록 방지.

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
