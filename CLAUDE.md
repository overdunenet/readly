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
- **Cache**: Redis

## 서비스 구성

- **Client**: 팔로워용 React 앱 (콘텐츠 소비자)
- **Editor**: 에디터용 React 앱 (콘텐츠 생산자)
- **Backoffice**: 관리자용 React 앱 (플랫폼 운영자)

## 폴더 구조

```
readly/
├── apps/
│   ├── api/          # tRPC + NestJS API
│   ├── client/       # 팔로워용 React 앱
│   ├── editor/       # 에디터용 React 앱
│   └── backoffice/   # 관리자용 React 앱
├── packages/
│   ├── shared/       # 공통 유틸리티
│   ├── ui/           # 공통 UI 컴포넌트
│   └── api-types/    # API 타입 정의
├── docs/             # 프로젝트 문서
└── docker/           # Docker 설정
```

## 주요 명령어

```bash
yarn dev           # 모든 서비스 개발 서버 시작
yarn dev:api       # API 서버만 시작
yarn dev:client    # Client 앱만 시작
yarn dev:editor    # Editor 앱만 시작
yarn dev:backoffice # Backoffice 앱만 시작
yarn lint          # 코드 린팅
yarn typecheck     # 타입 체크
yarn db:migrate    # 데이터베이스 마이그레이션
```

## 문서 구조

상세 문서는 다음 위치를 참조하세요:

| 문서            | 위치                            | 설명                     |
| --------------- | ------------------------------- | ------------------------ |
| 아키텍처        | `.claude/context/architecture/` | 시스템 설계 및 기술 스택 |
| 기능 명세       | `.claude/context/domain/`       | 서비스 기능 상세         |
| API 개발        | `.claude/skills/api/`           | tRPC + NestJS API 개발   |
| 프론트엔드 개발 | `.claude/skills/frontend/`      | React 애플리케이션 개발  |
