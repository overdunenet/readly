---
name: GPM Configuration
description: GPM(GitHub Project Manager) 설정 및 태스크 관리 도구 구성
keywords: [GPM, GitHub Project, 태스크, 프로젝트관리, gpmrc]
---

# GPM Configuration

GPM(GitHub Project Manager)은 GitHub Project V2를 통해 태스크를 관리하는 도구입니다. `.gpmrc` 설정 파일과 Claude Code Skill/Agent를 통해 AI 기반 태스크 관리 워크플로우를 제공합니다.

## 파일 구조

| 파일 | 역할 | 핵심 설정/함수 |
|------|------|----------------|
| .gpmrc | GitHub Project 연결 정보 | owner, repo, projectNumber, projectUrl |
| .claude/skills/gpm/SKILL.md | GPM 슬래시 커맨드 정의 | /gpm next, /gpm done, /gpm status, /gpm plan |
| .claude/agents/gpm-pm.md | AI PM Agent 정의 | GPM 기반 프로젝트 관리 자동화 |

## 핵심 흐름

1. `.gpmrc`에서 GitHub Project 연결 정보(organization, repo, projectNumber) 로드
2. `gh` CLI를 통해 GitHub Project V2 API와 통신
3. Claude Code Skill(`/gpm`)을 통해 사용자가 태스크 조회/관리 명령 실행
4. AI PM Agent가 마일스톤 기한 + 최근 작업 맥락 기반으로 다음 작업 추천

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
