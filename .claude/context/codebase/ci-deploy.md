---
name: ci-deploy
description: API CI/CD 파이프라인 - GitHub Actions 빌드, Docker 이미지 빌드, ECR 푸시, EB 배포
keywords: [CI, CD, GitHub Actions, Docker, ECR, Elastic Beanstalk, 배포, 캐시]
estimated_tokens: ~300
related_contexts:
  - codebase-architecture-overview
  - codebase-test-infrastructure
---

# CI/CD 배포 파이프라인

API 서비스의 빌드, 컨테이너 이미지 생성, 배포를 자동화하는 파이프라인입니다.

## 파일 구조

| 파일 | 역할 | 핵심 단계 |
| ---- | ---- | --------- |
| .github/workflows/deploy-api.yml | API 배포 워크플로우 | yarn cache → build → Docker buildx → ECR push → EB deploy |
| apps/api/Dockerfile | API Docker 이미지 정의 | node:22.16-alpine, yarn install --immutable, Asia/Seoul TZ |
| Dockerrun.aws.json | EB 배포 설정 | ECR 이미지 참조, 포트 3000 매핑 |

## 핵심 흐름

### 배포 파이프라인 (main 브랜치 push 트리거)

1. `actions/checkout@v4` → 코드 체크아웃
2. `actions/setup-node@v4` (Node 22) + corepack enable
3. `actions/cache@v4` → yarn 캐시 디렉토리 + node_modules 복원 (`yarn-{OS}-{yarn.lock hash}`)
4. `yarn install` → `yarn workspace @readly/api build` → API 빌드
5. `docker/setup-buildx-action@v3` → Docker Buildx 설정
6. `docker buildx build --push` → GHA 레이어 캐시(`type=gha,mode=max`) 활용, ECR에 직접 push
7. `Dockerrun.aws.json` → S3 업로드 → EB application version 생성
8. EB 환경 업데이트 (deploy job)

### Docker 이미지 구성

1. `node:22.16-alpine` 베이스
2. `package.json` + `yarn.lock` 복사 → `yarn install --immutable`
3. 사전 빌드된 `apps/api/dist` 복사 (호스트에서 빌드 완료)
4. Asia/Seoul 타임존 설정 → 포트 3000 노출
5. `generateEnv.js` 실행 후 `main.js` 시작

### 캐시 전략

| 캐시 대상 | 방식 | 키 |
| --------- | ---- | --- |
| yarn 의존성 | actions/cache@v4 | `yarn-{OS}-{yarn.lock hash}` |
| Docker 레이어 | BuildKit GHA cache | `type=gha,mode=max` |

### 배포 인프라

| 구성요소 | 서비스 | 리전 |
| -------- | ------ | ---- |
| 컨테이너 레지스트리 | Amazon ECR (`readly-api`) | ap-northeast-2 |
| 애플리케이션 플랫폼 | AWS Elastic Beanstalk (`Readly2-Api-Prod`) | ap-northeast-2 |
| 아티팩트 저장소 | Amazon S3 | ap-northeast-2 |

## 이미지 태그 규칙

- 태그 push: Git 태그명 사용 (예: `v1.0.0`)
- 브랜치 push: 커밋 SHA 앞 7자리 (예: `b477622`)
- 항상 `latest` 태그도 함께 push

## 관련 Business Context

- [deployment-efficiency.md](../business/deployment-efficiency.md): 빌드 캐시 최적화 전략
