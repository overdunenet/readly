# Readly 프로젝트 문서

Readly 프로젝트의 종합 문서입니다. 이 문서는 개발자가 프로젝트를 이해하고 효율적으로 개발할 수 있도록 돕습니다.

## 📚 문서 목록

### 핵심 문서
- **[아키텍처](./architecture.md)** - 시스템 설계 및 기술 스택
- **[기능 명세](./features.md)** - 서비스 기능 상세 설명
- **[API 가이드](./api-guide.md)** - tRPC + NestJS API 개발
- **[프론트엔드 가이드](./frontend-guide.md)** - React 애플리케이션 개발

### 개발 문서
- **[개발 환경 설정](./setup.md)** - 로컬 환경 구성
- **[코딩 컨벤션](./conventions.md)** - 코드 스타일 가이드
- **[테스트 가이드](./testing.md)** - 테스트 작성 및 실행
- **[배포 가이드](./deployment.md)** - 프로덕션 배포

### 도메인 문서
- **[사용자 시스템](./users.md)** - 인증 및 권한 관리
- **[포스트 시스템](./posts.md)** - 블로그 포스트 관리
- **[결제 시스템](./payments.md)** - 구독 및 구매 처리
- **[관리자 시스템](./admin.md)** - 백오피스 기능

## 🚀 빠른 시작

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-org/readly.git
cd readly
```

### 2. 의존성 설치
```bash
yarn install
```

### 3. 환경 설정
```bash
cp .env.example .env
# .env 파일 수정
```

### 4. 개발 서버 실행
```bash
yarn dev
```

## 📖 프로젝트 개요

**Readly**는 크리에이터 이코노미를 위한 유료 콘텐츠 플랫폼입니다.

### 주요 특징
- 💰 **수익화**: 포스트 개별 판매 및 구독 모델
- 🔐 **접근 제어**: 세분화된 콘텐츠 접근 권한
- 📱 **멀티 플랫폼**: 반응형 웹 및 모바일 지원
- 📊 **분석**: 상세한 수익 및 독자 분석

### 사용자 유형
1. **팔로워**: 콘텐츠 소비자
2. **에디터**: 콘텐츠 생산자
3. **관리자**: 플랫폼 운영자

## 🏗️ 기술 스택

### Backend
- **Framework**: NestJS + tRPC
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Queue**: Bull

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form

### Infrastructure
- **Container**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Mixpanel

## 📂 프로젝트 구조

```
readly/
├── apps/
│   ├── api/          # Backend API
│   ├── client/       # 팔로워 웹앱
│   ├── editor/       # 에디터 웹앱
│   └── backoffice/   # 관리자 웹앱
├── packages/
│   ├── shared/       # 공통 유틸리티
│   ├── ui/           # UI 컴포넌트
│   └── types/        # TypeScript 타입
├── docs/             # 프로젝트 문서
├── docker/           # Docker 설정
└── scripts/          # 유틸리티 스크립트
```

## 🤝 기여 가이드

1. 이슈 생성 또는 할당
2. 피처 브랜치 생성: `feature/issue-number-description`
3. 커밋 메시지: `type(scope): message`
4. PR 생성 및 리뷰 요청
5. 승인 후 머지

## 📞 문의

- **이슈 트래커**: GitHub Issues
- **이메일**: dev@readly.com
- **Slack**: #readly-dev

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.