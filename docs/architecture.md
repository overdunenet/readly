# 시스템 아키텍처

## 개요

Readly는 마이크로서비스 아키텍처를 기반으로 한 모던 웹 애플리케이션입니다. tRPC를 통한 타입 안전한 API와 NestJS의 강력한 백엔드 기능을 결합하여 확장 가능하고 유지보수가 용이한 시스템을 구축했습니다.

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend Apps                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     Client      │     Editor      │        Backoffice           │
│   (팔로워용)     │   (에디터용)      │        (관리자용)           │
└────────┬────────┴────────┬────────┴────────┬────────────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                          │
                    tRPC Client
                          │
┌─────────────────────────┴─────────────────────────────────────────┐
│                        API Gateway                                 │
│                    (tRPC Server + NestJS)                         │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │    Post     │  │   Payment   │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    User     │  │ Subscription│  │   Admin     │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────┴────────┐              ┌────────┴────────┐
│   PostgreSQL    │              │      Redis      │
│   (Primary DB)  │              │     (Cache)     │
└─────────────────┘              └─────────────────┘
```

## 기술 스택 상세

### Backend

#### tRPC + NestJS
- **tRPC**: 타입 안전한 API 레이어
  - 자동 타입 추론
  - 클라이언트-서버 간 타입 공유
  - 실시간 에러 감지
  
- **NestJS**: 엔터프라이즈급 Node.js 프레임워크
  - 모듈식 아키텍처
  - 의존성 주입
  - 데코레이터 기반 프로그래밍

#### 데이터베이스
- **PostgreSQL**: 메인 데이터 저장소
  - 트랜잭션 지원
  - JSON 데이터 타입 활용
  - 전문 검색 기능
  
- **Redis**: 캐싱 및 세션 저장소
  - 세션 데이터 관리
  - 자주 조회되는 데이터 캐싱
  - 실시간 기능을 위한 Pub/Sub

#### ORM & 마이그레이션
- **TypeORM**: 타입스크립트 ORM
  - 엔티티 기반 모델링
  - 마이그레이션 자동화
  - 쿼리 빌더

### Frontend

#### 공통 기술
- **React 18**: UI 프레임워크
  - Concurrent Features 활용
  - Suspense & Error Boundaries
  - Server Components 준비

- **Vite**: 빌드 도구
  - 빠른 HMR
  - ESM 기반 개발
  - 최적화된 프로덕션 빌드

- **Tailwind CSS**: 유틸리티 우선 CSS
  - 일관된 디자인 시스템
  - 반응형 디자인
  - 다크 모드 지원

#### 상태 관리
- **Zustand**: 경량 상태 관리
  - 간단한 API
  - TypeScript 지원
  - DevTools 통합

#### 라우팅
- **React Router v6**: SPA 라우팅
  - 중첩 라우팅
  - 데이터 로더
  - 보호된 라우트

## 모듈 구조

### API 모듈

각 모듈은 다음 구조를 따릅니다:

```
module/
├── module.router.ts      # tRPC 라우터 정의
├── module.service.ts     # 비즈니스 로직
├── module.controller.ts  # HTTP/WebSocket 핸들러
├── module.module.ts      # NestJS 모듈 정의
├── dto/                  # 데이터 전송 객체
├── entities/             # 데이터베이스 엔티티
└── tests/                # 유닛/통합 테스트
```

### 주요 모듈

#### 1. Auth Module
- JWT 기반 인증
- OAuth 소셜 로그인
- 권한 기반 접근 제어 (RBAC)
- 세션 관리

#### 2. User Module
- 사용자 프로필 관리
- 팔로워/팔로잉 시스템
- 사용자 설정

#### 3. Post Module
- 포스트 CRUD
- 버전 관리
- 미디어 업로드
- 태그 및 카테고리

#### 4. Payment Module
- 결제 처리 (Stripe/토스페이먼츠)
- 구독 관리
- 포스트 구매
- 수익 정산

#### 5. Subscription Module
- 구독 플랜 관리
- 자동 갱신
- 구독자 혜택

#### 6. Admin Module
- 대시보드
- 사용자 관리
- 콘텐츠 모더레이션
- 시스템 설정

## 데이터 플로우

### 1. 인증 플로우
```
Client → tRPC → Auth Guard → JWT Validation → Protected Resource
```

### 2. 포스트 조회 플로우
```
Client → tRPC → Post Router → Access Check → Post Service → Database
                                    ↓
                              Redis Cache
```

### 3. 결제 플로우
```
Client → tRPC → Payment Router → Payment Service → Payment Gateway
                                        ↓
                                  Database Update
                                        ↓
                                  Webhook Handler
```

## 보안 아키텍처

### 인증 & 인가
- **JWT 토큰**: Access Token + Refresh Token
- **권한 시스템**: Role-Based Access Control
- **API 보안**: Rate Limiting, CORS 설정

### 데이터 보호
- **암호화**: bcrypt (비밀번호), AES-256 (민감 데이터)
- **SQL Injection 방지**: 파라미터화된 쿼리
- **XSS 방지**: 입력 검증 및 이스케이핑

### 결제 보안
- **PCI DSS 준수**: 카드 정보 미저장
- **Webhook 검증**: 서명 기반 검증
- **이중 확인**: Idempotency Key 사용

## 성능 최적화

### Backend
- **쿼리 최적화**: N+1 문제 해결, 인덱싱
- **캐싱 전략**: Redis 캐싱, HTTP 캐싱
- **비동기 처리**: Queue (Bull) 활용

### Frontend
- **코드 스플리팅**: 라우트 기반 분할
- **이미지 최적화**: WebP 변환, Lazy Loading
- **번들 최적화**: Tree Shaking, 압축

## 배포 아키텍처

### 컨테이너화
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# Build stage

FROM node:18-alpine
# Production stage
```

### 환경별 구성
- **Development**: 로컬 Docker Compose
- **Staging**: Kubernetes 클러스터
- **Production**: Auto-scaling 활성화

## 모니터링 & 로깅

### 애플리케이션 모니터링
- **Sentry**: 에러 트래킹
- **Prometheus**: 메트릭 수집
- **Grafana**: 시각화 대시보드

### 로깅
- **Winston**: 구조화된 로깅
- **ELK Stack**: 로그 수집 및 분석
- **로그 레벨**: error, warn, info, debug

## 확장성 고려사항

### 수평적 확장
- Stateless 서버 설계
- 로드 밸런서 구성
- 데이터베이스 읽기 복제본

### 수직적 확장
- 리소스 모니터링
- 성능 병목 지점 분석
- 최적화 우선순위 결정

## 개발 워크플로우

### CI/CD 파이프라인
```yaml
1. Code Push → GitHub
2. GitHub Actions 트리거
3. 테스트 실행 (Unit, Integration, E2E)
4. Docker 이미지 빌드
5. 스테이징 배포
6. 프로덕션 배포 (수동 승인)
```

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `hotfix/*`: 긴급 수정

## 미래 계획

### 단기 (3개월)
- GraphQL 지원 추가
- 실시간 기능 강화 (WebSocket)
- 모바일 앱 개발

### 장기 (1년)
- 마이크로서비스 분리
- 국제화 (i18n) 지원
- AI 기반 추천 시스템