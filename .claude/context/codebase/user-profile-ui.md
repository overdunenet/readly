---
name: user-profile-ui
description: 개인 프로필 편집 UI (/my/profile) - 닉네임, 아바타, 이메일 표시
keywords: [프로필, 닉네임, 아바타, 설정, my, profile, useAuthStore]
estimated_tokens: ~300
related_contexts:
  - codebase-user-entity
  - codebase-bookstore-module
---

# 개인 프로필 편집 UI

사용자의 개인 프로필(닉네임, 아바타, 이메일)을 편집하는 페이지입니다. 서점 프로필 편집(`/my-bookstore/settings`)과 분리되어 독립적으로 운영됩니다.

## 파일 구조

| 파일                                                | 역할                                         | 핵심 함수/클래스                  |
| --------------------------------------------------- | -------------------------------------------- | --------------------------------- |
| apps/client/src/routes/_auth/my/profile.tsx         | 개인 프로필 편집 페이지                      | SettingsPage(), profileFormSchema |
| apps/client/src/components/editor/EditorLeftMenu.tsx | 에디터 좌측 네비게이션 (내 프로필 링크 포함) | menuItems[]                       |

## 라우트

| 라우트        | 설명                                      |
| ------------- | ----------------------------------------- |
| `/my/profile` | 개인 프로필 편집 (닉네임, 아바타, 이메일) |

## 핵심 흐름

1. 사용자가 에디터 좌측 메뉴에서 "내 프로필" 클릭 → `/my/profile` 이동
2. `useAuthStore`에서 현재 사용자 정보 로드
3. 닉네임 편집 → `trpc.user.updateProfile` mutation 호출
4. 성공 시 `setUser()`로 로컬 상태 업데이트

## 프로필 편집 구분

| 프로필 유형 | 경로                     | 편집 대상                            | API                       |
| ----------- | ------------------------ | ------------------------------------ | ------------------------- |
| 개인 프로필 | `/my/profile`            | 닉네임, 아바타                       | `user.updateProfile`      |
| 서점 프로필 | `/my-bookstore/settings` | 필명, 서점 이름, 소개, 프로필 이미지 | `bookstore.updateProfile` |

## 관련 문서

- [user-entity.md](./user-entity.md): UserEntity 구조 및 인증
- [bookstore-module.md](./bookstore-module.md): 서점 프로필 편집
