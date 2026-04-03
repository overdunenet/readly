---
name: post-editor
description: BlockNote 기반 포스트 에디터 UI 컴포넌트 (이미지 업로드, 유료/무료 구간 분리)
keywords: [BlockNote, 에디터, 포스트작성, BlockEditor, 이미지업로드, keyPrefix]
---

# 포스트 에디터 (BlockNote)

에디터가 포스트를 작성할 때 사용하는 블록 기반 리치 텍스트 에디터입니다.
BlockNote 라이브러리를 사용하며, S3 Presigned URL을 통한 이미지 업로드를 지원합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/client/src/components/posts/create/editor/BlockEditor.tsx | 블록 에디터 컴포넌트 | BlockEditorInner(), DirectFileReplaceButton(), useDirectFileUpload() |
| apps/client/src/components/posts/create/editor/schema.ts | BlockNote 스키마 정의 | schema, insertDividerItem |
| apps/client/src/lib/upload.ts | 업로드 유틸리티 | uploadFile(), createUploadKey() |
| apps/client/src/routes/_auth/my-bookstore/posts/$postId.edit.tsx | 포스트 편집 라우트 | WritePage() |

## 핵심 흐름

1. WritePage에서 BlockEditor를 렌더링하며 keyPrefix="post/postId" 전달
2. BlockEditorInner에서 keyPrefix를 사용해 _uploadWithKey 함수 설정
3. 이미지 삽입 시 _uploadWithKey -> createUploadKey(keyPrefix, file) -> uploadFile(file, key) 호출
4. S3 presigned URL로 직접 업로드 후 CDN URL을 에디터에 반영
5. freeContent/paidContent 분리로 유료/무료 구간 관리

## BlockEditor Props

| Prop | 타입 | 설명 |
| ---- | ---- | ---- |
| freeContent | string | 무료 공개 콘텐츠 |
| paidContent | string or null | 유료 콘텐츠 |
| onChange | (free, paid) => void | 콘텐츠 변경 콜백 |
| placeholder | string? | 에디터 플레이스홀더 |
| keyPrefix | string | S3 업로드 키 접두사 (예: post/postId) |

## 이미지 업로드 방식

- 모듈 레벨 _uploadWithKey ref를 통해 BlockNote의 uploadFile 핸들러와 커스텀 버튼이 동일한 업로드 로직 공유
- DirectFileReplaceButton: 이미지 블록 선택 시 파일 교체 버튼
- useDirectFileUpload: 빈 이미지 블록 클릭 시 파일 선택 훅

## 관련 Codebase Context

- [upload-module.md](./upload-module.md): S3 업로드 모듈 상세
- [post-entity.md](./post-entity.md): PostEntity 구조 및 API

## 관련 Business Context

- [overview.md](../business/overview.md): 서비스 비전 (에디터의 포스트 작성 흐름)
- [image-upload.md](../business/image-upload.md): 이미지 업로드 정책
