---
name: business-access-control
description: Readly 접근 권한 시스템 - 무료/유료 구간 구분, 접근 레벨별 정책
keywords:
  [접근권한, freeContent, paidContent, public, subscriber, purchaser, private]
estimated_tokens: ~350
related_contexts:
  - business-overview
  - business-payment
  - codebase-post-entity
---

# 접근 권한 시스템

## 무료/유료 구간 구분

Post는 **freeContent**(무료 공개 구간)와 **paidContent**(유료 구간) 두 개 필드로 구성됩니다.

| 구분      | 필드          | 용도                                    |
| --------- | ------------- | --------------------------------------- |
| 무료 구간 | `freeContent` | 미리보기 역할. 항상 노출 (private 제외) |
| 유료 구간 | `paidContent` | 본문 콘텐츠. 결제/구독 후 노출          |

### 에디터 작성 시

- 에디터가 Post 작성 시 무료 구간과 유료 구간을 **별도로 작성**
- `freeContent`만 작성 시: 전체 무료 Post (유료 구간 없음)
- `paidContent`까지 작성 시: 부분 유료 Post

### 팔로워 열람 시

- 무료 구간(`freeContent`) 먼저 표시
- 유료 구간이 존재하면 잠금 표시 + 결제/구독 유도
- 결제/구독 완료 후 전체 콘텐츠 열람

## 접근 레벨

| 권한         | 설명        | freeContent 접근            | paidContent 접근            |
| ------------ | ----------- | --------------------------- | --------------------------- |
| `public`     | 전체공개    | 모든 사용자 (비로그인 포함) | 모든 사용자 (비로그인 포함) |
| `subscriber` | 구독자 전용 | 모든 사용자 (비로그인 포함) | 해당 에디터 구독자만        |
| `purchaser`  | 구매자 전용 | 모든 사용자 (비로그인 포함) | 개별 구매자만               |
| `private`    | 비공개      | 에디터 본인만               | 에디터 본인만               |

> `freeContent`는 `private`를 제외한 모든 접근 권한에서 공개됩니다.
> `paidContent`는 접근 권한에 따라 결제/구독 여부를 확인한 후 노출됩니다.

## 설계 배경

### 필드 분리 방식 선택 이유

- **보안**: 서버에서 유료 콘텐츠 자체를 미전송 (마커 방식은 프론트에서 숨기는 것에 불과)
- **단순성**: 프론트엔드에서 조건부 렌더링 로직이 간단
- **확장성**: 향후 유료 구간별 가격 차등 등 확장 용이

## 관련 문서

- `business/payment.md`: 결제 시스템 상세
- `codebase/post-entity.md`: PostEntity 권한 검증 로직
