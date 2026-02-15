---
name: business-seo-strategy
description: Readly SEO 전략 - 빌드 타임 프리렌더링 채택 배경
keywords: [SEO, Prerender, 메타태그, OG, 크롤러, 정적 호스팅]
estimated_tokens: ~200
related_contexts:
  - business-overview
  - codebase-seo-implementation
---

# SEO 전략 목적

## 채택 배경

Readly는 **콘텐츠 검색 유입**이 핵심이므로 SEO 최적화가 필수입니다.

## 목표

| 목표                         | 달성 방법                              |
| ---------------------------- | -------------------------------------- |
| OG 미리보기 (카카오톡, 슬랙) | 빌드 타임 프리렌더링으로 메타태그 포함 |
| Google SEO                   | 메타태그 + JS 렌더링 콘텐츠            |
| 서버 부하 최소화             | 빌드 타임 처리, 런타임 서버 불필요     |
| 기존 인프라 유지             | Amplify 정적 호스팅 그대로 사용        |

## 빌드 타임 프리렌더링 선택 이유

기존 Partial SSR 계획에서 빌드 타임 프리렌더링으로 변경:

| 항목   | 기존 (Partial SSR) | 현재 (Prerender)      |
| ------ | ------------------ | --------------------- |
| 서버   | Express 필요       | 불필요                |
| 렌더링 | 요청 시 (런타임)   | 빌드 시               |
| 동적   | DB 조회 가능       | 빌드 시 알려진 라우트 |
| 배포   | Node.js 호스팅     | 정적 호스팅 유지      |
| 복잡도 | 높음               | 낮음                  |

## 한계 및 대응

| 한계                   | 대응 방안                                   |
| ---------------------- | ------------------------------------------- |
| 동적 라우트 SEO 미지원 | 향후 필요 시 Partial SSR 또는 ISR 도입 검토 |
| 네이버/다음 JS 미실행  | 프리렌더링된 HTML로 메타태그 노출 가능      |

## 관련 문서

- `codebase/seo-implementation.md`: 구현 상세 (프리렌더 플러그인, Helmet)
- `business/overview.md`: Web App 서비스 구성
