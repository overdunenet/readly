---
name: client-deploy-workflow
description: Client S3 + CloudFront 배포 워크플로우 (빌드, 환경변수 주입, dev/prod 배포)
keywords: [배포, deploy, S3, CloudFront, GitHub Actions, AWS, Secrets Manager]
estimated_tokens: ~300
---

# Client 배포 워크플로우

Client(apps/client) 앱을 S3 + CloudFront로 배포하는 GitHub Actions 워크플로우입니다.

## 파일 구조

| 파일                                  | 역할                        | 핵심 구성                                      |
| ------------------------------------- | --------------------------- | ---------------------------------------------- |
| .github/workflows/deploy-client.yml  | Client 배포 워크플로우       | build-and-deploy-dev, deploy-production 두 job |

## 트리거

- **자동 (push to main)**: `apps/client/**` 또는 `packages/**` 변경 시 dev 배포
- **수동 (workflow_dispatch)**: `deploy-production` 액션 선택 시 prod 배포

## 핵심 흐름

### Dev 배포 (build-and-deploy-dev)

1. checkout → Node 22 설정 → yarn install
2. AWS 자격 증명 설정 (IAM Access Key)
3. AWS Secrets Manager(`readly/prod`)에서 환경변수 조회 → `apps/client/.env` 파일 생성
4. `yarn workspace @readly/client build` 실행
5. 빌드 결과를 S3(`s3://readly-client-s3-bucket/build/{commit-hash}/`)에 업로드
6. LATEST 마커 업데이트 → develop 폴더에 복사 → CloudFront 캐시 무효화

### Prod 배포 (deploy-production)

1. AWS 자격 증명 설정
2. 빌드 해시 결정 (수동 입력 또는 LATEST 마커)
3. S3에서 해당 빌드 존재 확인
4. production 폴더에 복사 → CloudFront 캐시 무효화

## 환경변수 관리

- AWS Secrets Manager의 `readly/prod` 시크릿에서 key=value 쌍을 가져옴
- `jq`로 JSON → .env 형식 변환 후 `apps/client/.env`에 저장
- 빌드 전에 .env 파일이 생성되어 Vite 빌드 시 환경변수가 번들에 포함됨

## 인프라 구성

- **S3 버킷**: `readly-client-s3-bucket`
- **AWS 리전**: `ap-northeast-2`
- **CloudFront Distribution**: dev(`CF_DISTRIBUTION_DEV`), prod(`CF_DISTRIBUTION_PROD`) - GitHub vars로 관리

## 관련 Business Context

- [developer-experience.md](../business/developer-experience.md)
