---
name: business-seo-strategy
description: Readly SEO 전략 목적 - Partial SSR 채택 배경
keywords: [SEO, SSR, 메타태그, OG, 크롤러, 성능]
estimated_tokens: ~200
related_contexts:
  - business-overview
  - codebase-seo-implementation
---

# SEO 전략 목적

## 채택 배경

Readly는 **콘텐츠 검색 유입**이 핵심이므로 SEO 최적화가 필수입니다.

## 목표

| 목표                         | 달성 방법                          |
| ---------------------------- | ---------------------------------- |
| OG 미리보기 (카카오톡, 슬랙) | 메타태그 서버 주입                 |
| Google SEO                   | 메타태그 + JS 렌더링 콘텐츠        |
| 서버 부하 최소화             | React SSR 미사용 (Partial)         |
| 빠른 초기 로딩               | 본문 CSR로 hydration 오버헤드 제거 |

## Partial SSR 선택 이유

- **성능**: React SSR(renderToString) 미사용으로 서버 부하 최소
- **단순성**: Hydration mismatch 걱정 없음, 기존 SPA 코드 거의 그대로 유지
- **효과**: 크롤러가 `<head>` 메타태그를 정상적으로 수집

## 한계 및 대응

| 타겟                         | 지원 수준                                |
| ---------------------------- | ---------------------------------------- |
| OG 미리보기 (카카오톡, 슬랙) | 완전 지원 (메타태그 기반)                |
| Google SEO                   | 지원 (JS 실행으로 본문도 인덱싱)         |
| 네이버/다음                  | 제한적 (JS 렌더링 미지원 시 본문 미노출) |

> 네이버/다음 대응이 필요하면 본문 SSR 확장을 별도 검토합니다.

## 관련 문서

- `codebase/seo-implementation.md`: 구현 상세 (Express, SeoHead 컴포넌트)
- `business/overview.md`: Web App 서비스 구성
