---
name: developer-tooling
description: 개발 도구 설정 - Git Hooks, lint-staged, Claude 탐색 제외 설정
keywords: [husky, lint-staged, pre-commit, claudeignore, 개발도구]
estimated_tokens: ~250
related_contexts:
  - codebase-architecture-overview
---

# 개발 도구 설정

Git Hooks, 코드 포맷팅, Claude 탐색 범위 설정.

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|-----------|
| .husky/pre-commit | Git pre-commit hook | lint-staged 실행 |
| .lintstagedrc.cjs | lint-staged 설정 | 파일 타입별 eslint + prettier |
| .claudeignore | Claude 탐색 제외 | 불필요한 디렉토리 제외 |
| .claude/hooks/workflow-enforced.sh | 워크플로우 강제 hook | 4-Phase 워크플로우 프로토콜 |

## Git Pre-commit Hook

커밋 시 자동 실행:
1. `.husky/pre-commit` → `npx lint-staged --config .lintstagedrc.cjs`
2. 파일 타입별 처리:

| 파일 타입 | 처리 |
|-----------|------|
| TypeScript/JSX | eslint --fix + prettier |
| Markdown/YAML | prettier |
| JSON (package.json 제외) | prettier |

3. 외부 저장소 빌드 산출물 필터링 (PM-DOCS/workflow/references/ 제외)

## Claude 탐색 제외 (.claudeignore)

| 제외 대상 | 이유 |
|-----------|------|
| node_modules/ | 의존성 (bmad-method, bmad-creative-intelligence-suite는 포함) |
| dist/, coverage/, .tsbuildinfo | 빌드 산출물 |
| IDE, OS, Docker 파일 | 환경 설정 |
| PM-DOCS/workflow/ | 개인 아카이브 (참조 자료) |

## 워크플로우 강제 Hook

`.claude/hooks/workflow-enforced.sh`:
- 일반 코드 작업: 4-Phase 워크플로우 프로토콜 실행 (계획→검증→구현→리뷰)
- `/pm` 커맨드: 워크플로우 스킵 (PM Planner Agent가 자체 프로세스 운영)
- Skill 자동 탐색: .claude/skills/*/SKILL.md frontmatter에서 참조 가능 스킬 목록 자동 생성

## 관련 Business Context

- [개발자 경험](../business/developer-experience.md)

## 관련 문서

- `codebase/architecture-overview.md`: 시스템 아키텍처
