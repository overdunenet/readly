---
name: codebase-seo-implementation
description: 빌드 타임 프리렌더링 + react-helmet-async 기반 SEO 구현
keywords:
  [Prerender, Puppeteer, react-helmet-async, Helmet, 메타태그, OG, vite-plugin]
estimated_tokens: ~400
related_contexts:
  - business-seo-strategy
  - codebase-architecture-overview
---

# 빌드 타임 프리렌더링 SEO 구현

## 핵심 컨셉

**Build-time Prerendering**: 빌드 시점에 Puppeteer로 정적 라우트를 렌더링하여 메타태그가 포함된 HTML을 생성. 별도 서버 불필요, Amplify 정적 호스팅 유지.

| 구분           | 방식                                 |
| -------------- | ------------------------------------ |
| 렌더링 시점    | 빌드 타임 (Puppeteer)                |
| 메타태그 관리  | react-helmet-async (Helmet 컴포넌트) |
| 서버 필요 여부 | 불필요 (정적 호스팅)                 |
| 대상 라우트    | 빌드 시점에 알려진 정적 라우트       |

## 아키텍처 플로우

```
vite build
→ SPA 빌드 (dist/)
→ prerender 플러그인 실행
  → Vite Preview 서버 기동
  → Puppeteer로 각 라우트 렌더링
  → react-helmet-async가 <head> 메타태그 생성
  → 렌더링된 HTML을 dist/{route}/index.html에 저장
→ Amplify 정적 호스팅에 배포
```

## 주요 파일

| 파일                       | 역할                                 |
| -------------------------- | ------------------------------------ |
| `vite-plugin-prerender.ts` | 커스텀 Vite 프리렌더 플러그인        |
| `vite.config.ts`           | 프리렌더 플러그인 설정 (라우트 목록) |
| `src/main.tsx`             | HelmetProvider 래핑                  |
| `src/routes/__root.tsx`    | 기본 Helmet 설정 (fallback title 등) |
| `src/routes/about.tsx`     | 라우트별 Helmet 메타태그 예시        |
| `index.html`               | 기본 메타태그 (fallback)             |

## Helmet 사용 패턴

```typescript
// __root.tsx: 기본값 설정
<Helmet defaultTitle="Readly" titleTemplate="%s | Readly">
  <meta name="description" content="..." />
</Helmet>

// 개별 라우트: 오버라이드
<Helmet>
  <title>페이지 제목</title>
  <meta property="og:title" content="..." />
</Helmet>
```

## 프리렌더링 대상 라우트

| 라우트      | 프리렌더링 | 비고                   |
| ----------- | ---------- | ---------------------- |
| `/about`    | O          | 서비스 소개 페이지     |
| `/`         | X          | 추후 확장 가능         |
| `/_auth/**` | X          | 인증 필요 (SEO 불필요) |

## 관련 문서

- `business/seo-strategy.md`: SEO 전략 목적
- `codebase/architecture-overview.md`: 프론트엔드 아키텍처
