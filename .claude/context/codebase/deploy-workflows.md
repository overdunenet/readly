---
name: deploy-workflows
description: API 배포 CI/CD 워크플로우 - ECR + Elastic Beanstalk 배포 파이프라인
keywords: [배포, deploy, CI/CD, GitHub Actions, ECR, Elastic Beanstalk, AWS]
estimated_tokens: ~200
related_contexts:
  - codebase-architecture-overview
  - codebase-test-infrastructure
---

# 배포 워크플로우

GitHub Actions 기반 API 배포 파이프라인을 정의합니다.

## 파일 구조

| 파일 | 역할 | 핵심 단계 |
| ---- | ---- | --------- |
| .github/workflows/deploy-api.yml | API 배포 워크플로우 | build → Docker push → EB deploy |

## 핵심 흐름

### API 배포 (deploy-api.yml)

1. `main` 브랜치 push 트리거 (paths-ignore: `apps/client/**`, `.claude/**`)
2. **build job**: yarn install → API 빌드 → Docker 이미지 빌드 및 ECR push → S3에 Dockerrun.aws.json 업로드 → EB 앱 버전 생성
3. **deploy job**: EB 환경에 새 버전 배포

### 트리거 조건

| 워크플로우 | 트리거 | paths-ignore |
| ---------- | ------ | ------------ |
| deploy-api.yml | push to main | `apps/client/**`, `.claude/**` |

### 인프라 구성

| 리소스 | 값 |
| ------ | --- |
| AWS Region | ap-northeast-2 |
| ECR Repository | readly-api |
| EB Application | Readly2-Api |
| EB Environment | Readly2-Api-Prod |

## 관련 Codebase Context

- [architecture-overview.md](./architecture-overview.md): 시스템 아키텍처
- [test-infrastructure.md](./test-infrastructure.md): CI 테스트 워크플로우
