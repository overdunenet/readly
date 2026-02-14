---
name: context-handoff
description: 컨텍스트 압축을 위한 HANDOFF.md 작성 Skill 구조
keywords: [HANDOFF, 컨텍스트, 토큰절약, 세션관리]
---

# Context Handoff

긴 세션에서 토큰 한계 접근 시 컨텍스트를 HANDOFF.md로 압축하여 새 세션에 전달하는 Skill 구조.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| .claude/skills/ContextHandoff/SKILL.md | HANDOFF.md 작성 가이드 | 트리거 조건, 작성 포맷, 핵심 규칙 |

## 핵심 흐름

1. 토큰 50k+ 또는 응답 품질 저하 감지 → HANDOFF.md 작성 트리거
2. 목표/완료/실패/현재문제/다음단계 포맷으로 500자 이내 작성
3. 새 세션에서 HANDOFF.md 읽고 작업 재개 → 완료 후 삭제

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
