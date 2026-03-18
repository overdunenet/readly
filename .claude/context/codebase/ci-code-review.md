---
name: ci-code-review
description: Claude Code Review GitHub Action - PR 자동 코드리뷰 워크플로우 (plugin 기반)
keywords: [CI, code-review, GitHub Action, claude-code-action, plugin, PR리뷰]
estimated_tokens: ~200
related_contexts:
  - codebase-test-infrastructure
  - business-developer-experience
---

# CI Code Review

PR이 생성/업데이트되면 Claude Code를 사용하여 자동 코드리뷰를 수행하는 GitHub Action 워크플로우입니다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
| ---- | ---- | --------- |
| .github/workflows/claude-code-review.yml | PR 자동 코드리뷰 | anthropics/claude-code-action@v1, code-review plugin |

## 핵심 흐름

1. PR 이벤트 트리거 (opened, synchronize, ready_for_review, reopened)
2. draft PR은 제외 (`github.event.pull_request.draft == false`)
3. `anthropics/claude-code-action@v1`로 Claude Code 실행
4. `code-review@claude-code-plugins` plugin을 사용하여 코드리뷰 수행
5. PR에 리뷰 코멘트 작성

## 워크플로우 설정

| 설정 | 값 | 설명 |
| ---- | -- | ---- |
| fetch-depth | 1 | 얕은 클론 (plugin이 자체적으로 diff 처리) |
| plugin_marketplaces | anthropics/claude-code.git | 공식 plugin 마켓플레이스 |
| plugins | code-review@claude-code-plugins | 코드리뷰 전용 plugin |
| 인증 | CLAUDE_CODE_OAUTH_TOKEN | OAuth 토큰 기반 인증 |

## 권한

| 권한 | 레벨 | 용도 |
| ---- | ---- | ---- |
| contents | read | 소스 코드 읽기 |
| pull-requests | write | PR 코멘트 작성 |
| issues | read | 이슈 참조 |
| id-token | write | OIDC 토큰 |

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md): 개발자 경험 최적화
