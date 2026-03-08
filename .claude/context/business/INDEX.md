---
name: business-context-index
description: Business Context 인덱스 - Readly 서비스 기획 및 비즈니스 정책
keywords: [비즈니스, 기획, 정책, 접근권한, 결제, SEO]
estimated_tokens: ~150
---

# Business Context 인덱스

이 폴더는 Readly 서비스의 **비즈니스 기획과 정책**을 담고 있습니다.
"왜 이렇게 만들었는가", "어떤 규칙을 따르는가"에 대한 답입니다.

## 문서 목록

| 문서                                                                | 설명                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Product Brief](../../../PM-DOCS/Context%20Output/PRODUCT_BRIEF.md) | 제품 전략 기초 문서 (비전, 타겟 유저, 시장, 비즈니스 모델) |
| [access-control.md](./access-control.md)                            | 접근 권한 시스템 (무료/유료 구간 구분)                     |
| [payment.md](./payment.md)                                          | 결제 수단, 유형, 환불 정책                                 |
| [seo-strategy.md](./seo-strategy.md)                                | SEO 전략 목적 및 빌드 타임 프리렌더링 채택 배경            |
| [developer-experience.md](./developer-experience.md)                | Claude Code 사용 경험 최적화                               |
| [user-follow.md](./user-follow.md)                                  | 사용자 팔로우 기능 (에디터-팔로워 관계)                    |
| [authentication.md](./authentication.md)                            | 인증 & 계정 관리 정책 (Passwordless, 성인인증, 탈퇴)      |

## 빠른 참조

> **Product Brief**: 서비스의 비전, 타겟 유저, 시장 전략, 비즈니스 모델 등 제품 전략 기초는
> `PM-DOCS/Context Output/PRODUCT_BRIEF.md` 를 참조하세요.

### 핵심 개념

- **유료 블로그 플랫폼**: 에디터가 Post를 작성하고, 팔로워가 결제하여 열람
- **무료/유료 구간**: `freeContent`(미리보기) + `paidContent`(본문)
- **접근 레벨**: public, subscriber, purchaser, private
- **결제 유형**: 포스트 단건 구매, 월간 구독

### 관련 Codebase Context

- `codebase/post-entity.md`: Post 구조 및 권한 검증 구현
- `codebase/user-entity.md`: User 인증 구현
- `codebase/seo-implementation.md`: SEO 구현 상세
- `codebase/follow-module.md`: Follow 모듈 구현
- `codebase/post-manage-ui.md`: 포스트 관리 UI 구현
