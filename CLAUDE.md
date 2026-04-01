# CLAUDE.md

## 프로젝트 개요

**Readly**는 에디터와 팔로워를 연결하는 유료 블로그 플랫폼입니다.

## 핵심 기능

- **에디터**: 블로그 포스트 작성 및 관리
- **팔로워**: 포스트 구매/구독을 통한 콘텐츠 접근
- **접근 권한**: 전체공개, 구독자 전용, 구매자 전용, 비공개

## 기술 스택

- **Backend**: tRPC + NestJS
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL + TypeORM

## 아키텍처 원칙 (BFF)

- **FE-first 설계**: FE가 원하는 데이터 구조에 맞춰 DB/API를 설계 (FE → DB → API 순서)
- **Router = BFF 레이어**: tRPC Router는 FE 페이지에 최적화된 응답을 조합하여 제공
- **복잡도 가드레일**: DB/API 복잡도가 FE 가치 대비 과도하면 FE 변경 제안 또는 Phase 분리

## 서비스 구성

- **Web App**: 팔로워 + 에디터 통합 React 앱 (콘텐츠 소비/생산)

## 폴더 구조

```
readly/
├── apps/
│   ├── api/          # tRPC + NestJS API
│   └── client/       # 팔로워 + 에디터 통합 웹앱 (단일 배포)
├── packages/
│   └── api-types/    # API 타입 정의
├── PM-DOCS/          # PM 기획 문서
└── docker/           # Docker 설정
```

## 주요 명령어

```bash
# 루트
yarn lint          # 코드 린팅
yarn lint:fix      # 린트 자동 수정

# API (apps/api)
yarn workspace api dev           # API 서버 시작
yarn workspace api migration:run # 데이터베이스 마이그레이션

# Client (apps/client)
yarn workspace client dev        # Web App 시작
```

## 문서 구조

상세 문서는 다음 위치를 참조하세요:

| 문서            | 위치                            | 설명                         |
| --------------- | ------------------------------- | ---------------------------- |
| 기획/Planning   | `.claude/context/planning/`     | PM 기획 문서 (PRD, Roadmap)  |
| 아키텍처        | `.claude/context/architecture/` | 시스템 설계 및 기술 스택     |
| 비즈니스 정책   | `.claude/context/business/`     | 서비스 기획 및 비즈니스 정책 |
| 코드베이스      | `.claude/context/codebase/`     | 구현 아키텍처 및 Entity 구조 |
| API 개발        | `.claude/skills/api/`           | tRPC + NestJS API 개발       |
| 프론트엔드 개발 | `.claude/skills/frontend/`      | React 애플리케이션 개발      |

## GPM 태스크 관리

이 프로젝트는 [GPM](https://www.npmjs.com/package/github-project-manager)으로 GitHub Project V2 태스크를 관리합니다.

### 설정 파일

- `.gpmrc` — GitHub Project 연결 정보
- `.claude/skills/gpm/SKILL.md` — /gpm 슬래시 커맨드
- `.claude/agents/gpm-pm.md` — AI PM Agent

### 사용 방법

- `/gpm next` — 다음 작업 추천 (마일스톤 기한 + 최근 작업 맥락 기반)
- `/gpm done` — 현재 작업 완료 처리
- `/gpm status` — 프로젝트 현황 브리핑
- `/gpm plan` — 작업 계획 수립

### 태스크 관리 규칙

- 새 기능 작업 시작 전 `/gpm next`로 GitHub Project 태스크를 확인한다
- 작업 완료 후 `/gpm done`으로 태스크 상태를 업데이트한다
- 새 태스크가 필요하면 `/gpm create`로 GitHub Project에 직접 생성한다
