---
name: prompt-structuring
description: Claude Code 프롬프트의 XML 태그 구조화, 긍정 표현, 출력 최적화 Skill 구조
keywords: [프롬프트, XML태그, 긍정표현, 출력최적화, 토큰절약]
---

# Prompt Structuring

프롬프트 형식과 표현 방식을 최적화하여 LLM 출력 품질과 토큰 효율을 높이는 Skill.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| .claude/skills/PromptStructuring/SKILL.md | 핵심 원칙 및 인덱스 | 3대 원칙 (XML, 긍정표현, 출력최적화) |
| .claude/skills/PromptStructuring/xml-tags.md | XML 태그 표준 목록 | 태그 카탈로그, 파일 유형별 권장 조합 |
| .claude/skills/PromptStructuring/positive-phrasing.md | 긍정 표현 전환 패턴 | 부정→긍정 변환 규칙, 예시 테이블 |
| .claude/skills/PromptStructuring/output-optimization.md | 출력 토큰 최적화 기법 | Hook 출력 예산, 축약 기법, 삭제 대상 |

## 핵심 흐름

1. XML 태그로 프롬프트의 의미 영역 구분 (role, instructions, rules 등)
2. 부정 표현("금지")을 긍정 표현("한다")으로 전환하여 행동 유도
3. 출력 예산(Hook 50줄, 전체 120줄) 내에서 테이블/인라인 우선으로 압축

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
