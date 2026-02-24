---
name: post-editor
description: CKEditor 5 기반 포스트 에디터 UI 컴포넌트 및 스타일링
keywords: [CKEditor, 에디터, 포스트작성, FormEditorSection, 스타일링]
estimated_tokens: ~400
related_contexts:
  - codebase-post-entity
  - business-overview
---

# 포스트 에디터 (CKEditor 5)

에디터가 포스트를 작성할 때 사용하는 리치 텍스트 에디터입니다.
CKEditor 5 ClassicEditor를 React에서 통합하여 사용하며, Readly 디자인 시스템에 맞게 커스텀 스타일링되어 있습니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/client/src/components/posts/create/FormEditorSection.tsx | 에디터 섹션 컴포넌트 | FormEditorSection(), editorConfig |
| apps/client/src/index.css | CKEditor 커스텀 스타일 (Tailwind Preflight 리셋 포함) | - |
| apps/client/src/main.tsx | 앱 진입점 (index.css import) | - |

## 핵심 흐름

1. `FormEditorSection` 컴포넌트가 react-hook-form `Controller`로 제목 input과 CKEditor를 렌더링
2. CKEditor의 `onChange` 이벤트가 `editor.getData()`를 통해 폼 상태에 HTML 콘텐츠를 전달
3. `editorConfig`에서 플러그인, 툴바 구성, 라이선스(GPL) 설정

## CKEditor 플러그인 구성

| 플러그인 | 용도 |
| -------- | ---- |
| Heading | 제목 (h1-h6) |
| Bold, Italic, Underline, Strikethrough | 텍스트 서식 |
| List (numbered, bulleted) | 목록 |
| BlockQuote, CodeBlock | 인용, 코드 블록 |
| Link | 하이퍼링크 |
| Image, ImageInsert, Base64UploadAdapter | 이미지 삽입 (Base64 인코딩) |
| RemoveFormat | 서식 제거 |

## 스타일링 구조

CKEditor CSS는 `index.css`에서 관리합니다:

| 영역 | 설명 |
| ---- | ---- |
| Tailwind Preflight 리셋 | `.ck` 내부 SVG, button, list, heading 요소에 `revert` 적용 |
| 에디터 영역 | min-height 300px, border/shadow 제거 |
| 툴바 | 하단 구분선만 유지, Readly 색상 호버/액티브 상태 |
| 드롭다운 | rounded-lg, shadow-lg 카드 스타일 |
| 포커스 | EditorWrapper에서 focus-within:ring-2 blue-500 처리 |

CKEditor 공식 CSS는 `index.css`에서 `@import "ckeditor5/ckeditor5.css"`로 가져옵니다.

## 관련 문서

- [post-entity.md](./post-entity.md): PostEntity 구조 및 API
- `business/overview.md`: 서비스 비전 (에디터의 포스트 작성 흐름)
