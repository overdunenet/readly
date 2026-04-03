---
name: upload-module
description: S3 Presigned URL 기반 이미지 업로드 모듈 (API + Client)
keywords: [S3, upload, presigned URL, 이미지, CDN, UploadService]
---

# Upload 모듈

S3 Presigned URL을 통한 이미지 업로드 기능입니다. API에서 presigned URL을 발급하고, Client에서 S3에 직접 업로드합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/upload/upload.module.ts | Upload NestJS 모듈 (@Global) | UploadModule |
| apps/api/src/module/upload/upload.service.ts | Presigned URL 생성 및 키 검증 | UploadService, getPresignedUploadUrl(), validateKey() |
| apps/client/src/lib/upload.ts | 클라이언트 업로드 유틸리티 | uploadFile(), createUploadKey() |

## 핵심 흐름

1. Client가 createUploadKey(prefix, file)로 S3 키 생성 (형식: prefix/baseName-uuid.ext)
2. Client가 tRPC upload.getPresignedUrl mutation으로 presigned URL + CDN URL 요청
3. API의 UploadService.getPresignedUploadUrl()이 키 검증 후 S3 PutObject presigned URL 발급
4. Client가 presigned URL로 S3에 직접 PUT 요청하여 파일 업로드
5. 업로드 완료 후 CDN URL 반환

## API 보안

| 검증 | 설명 |
| ---- | ---- |
| Path Traversal 방지 | 키에 .. 포함 시 거부 |
| Prefix 허용 목록 | ALLOWED_PREFIXES에 포함된 경로만 허용 |
| 파일 크기 제한 | Client에서 50MB 제한 |
| 파일 타입 제한 | Client에서 image/* 만 허용 |

## Client 업로드 구조

- vanillaTrpcClient (React hooks 외부 사용 가능한 standalone tRPC client) 사용
- uploadFile(file, key): 검증 -> presigned URL 요청 -> S3 PUT -> CDN URL 반환
- createUploadKey(prefix, file): prefix/baseName-uuid.ext 형식 키 생성

## 관련 Business Context

- [image-upload.md](../business/image-upload.md)

## 관련 Codebase Context

- [post-editor.md](./post-editor.md): 에디터에서 이미지 업로드 사용
