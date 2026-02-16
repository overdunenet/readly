---
name: follow-module
description: Follow 모듈 - 사용자 간 팔로우/언팔로우 기능 구현 (BE + FE)
keywords: [Follow, 팔로우, 언팔로우, 팔로워, FollowEntity, useFollow]
estimated_tokens: ~400
---

# Follow 모듈

사용자 간 팔로우/언팔로우 관계를 관리하는 모듈입니다. 백엔드에서 Entity-Service-Router 구조로 CRUD를 제공하고, 프론트엔드에서 Optimistic Update 기반의 팔로우 버튼을 구현합니다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| --- | --- | --- |
| apps/api/src/module/domain/follow.entity.ts | Entity + Repository 정의 | FollowEntity, FollowRepository.follow(), unfollow(), countFollowers(), countFollowings() |
| apps/api/src/module/follow/follow.service.ts | 비즈니스 로직 | FollowService.follow(), unfollow(), isFollowing(), getFollowerCount(), getFollowingCount() |
| apps/api/src/module/follow/follow.router.ts | tRPC API 라우터 | follow(mutation), unfollow(mutation), isFollowing(query), getFollowerCount(query), getFollowingCount(query) |
| apps/api/src/module/follow/follow.schema.ts | Zod 입출력 스키마 | followInputSchema, userIdInputSchema, followOutputSchema |
| apps/client/src/components/follow/useFollow.ts | React 커스텀 훅 | useFollow() - Optimistic Update, race condition 방지 |
| apps/client/src/components/follow/FollowButton.tsx | UI 컴포넌트 | FollowButton - 팔로우/언팔로우 토글 버튼 |

## 핵심 흐름

1. **팔로우**: FollowButton 클릭 → useFollow.toggleFollow() → trpc.follow.follow mutation → FollowRouter → FollowService.follow() → FollowRepository.follow() → DB INSERT (Unique Constraint로 중복 방지)
2. **언팔로우**: FollowButton 클릭 → useFollow.toggleFollow() → trpc.follow.unfollow mutation → FollowRouter → FollowService.unfollow() → FollowRepository.unfollow() → DB DELETE
3. **팔로우 상태 조회**: 페이지 로드 시 trpc.follow.isFollowing query → FollowService.isFollowing() → DB 조회
4. **카운트 조회**: trpc.follow.getFollowerCount / getFollowingCount query → 공개 API (인증 불필요)

## 주요 설계 결정

- **Unique Constraint**: (followerId, followeeId) 조합으로 중복 팔로우 방지
- **CASCADE DELETE**: UserEntity 삭제 시 관련 Follow 레코드 자동 삭제
- **자기 자신 팔로우 방지**: FollowService에서 followerId === followeeId 검증 (BadRequestException)
- **Optimistic Update**: useFollow 훅에서 mutation 전 UI 즉시 반영, 실패 시 롤백
- **Race Condition 방지**: isMutating ref로 동시 mutation 차단
- **인증**: follow/unfollow/isFollowing은 JWT 인증 필요, 카운트 조회는 공개

## 에러 처리

| 에러 | 발생 조건 | 위치 |
| --- | --- | --- |
| ConflictException | 이미 팔로우 중일 때 다시 팔로우 | FollowRepository.follow() |
| NotFoundException | 팔로우 관계가 없을 때 언팔로우 | FollowRepository.unfollow() |
| BadRequestException | 자기 자신을 팔로우 시도 | FollowService.follow() |

## 관련 Business Context

- [user-follow.md](../business/user-follow.md)
