---
name: deployment-infrastructure
description: Docker + AWS Elastic Beanstalk 배포 인프라 구성
keywords: [Docker, Dockerfile, AWS, ECR, Elastic Beanstalk, CI/CD, GitHub Actions, 배포]
estimated_tokens: ~300
related_contexts:
  - codebase-architecture-overview
  - codebase-test-infrastructure
---

# 배포 인프라

## 배포 아키텍처

API 서버는 Docker 컨테이너로 빌드되어 AWS Elastic Beanstalk에 배포됩니다.

```
GitHub (main push) → GitHub Actions → ECR (Docker Image) → EB (배포)
```

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
| --- | --- | --- |
| apps/api/Dockerfile | API Docker 이미지 빌드 | node:22-alpine, EXPOSE 3000 |
| Dockerrun.aws.json | EB Docker 실행 설정 | ContainerPort 3000 → HostPort 80 |
| .github/workflows/deploy-api.yml | CI/CD 파이프라인 | build → push ECR → deploy EB |

## 핵심 흐름

1. `main` 브랜치 push 시 `deploy-api.yml` 워크플로우 트리거
2. API 빌드 → Docker 이미지 빌드 및 ECR push
3. `Dockerrun.aws.json`에 이미지 태그 주입 후 S3 업로드
4. EB Application Version 생성 → Environment 업데이트

## Docker 설정

- **베이스 이미지**: `node:22.16-alpine`
- **타임존**: `Asia/Seoul`
- **포트**: 컨테이너 내부 3000 → EB nginx가 80으로 프록시
- **시작 명령**: `generateEnv.js`로 환경변수 생성 후 `main.js` 실행

## AWS 리소스

| 리소스 | 이름 | 리전 |
| --- | --- | --- |
| ECR Repository | readly-api | ap-northeast-2 |
| EB Application | Readly2-Api | ap-northeast-2 |
| EB Environment | Readly2-Api-Prod | ap-northeast-2 |

## 관련 문서

- [architecture-overview.md](./architecture-overview.md): 시스템 전체 구성
- [test-infrastructure.md](./test-infrastructure.md): CI 테스트 워크플로우
