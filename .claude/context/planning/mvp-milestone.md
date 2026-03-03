---
name: mvp-milestone
description: M-001 MVP 핵심 기능 구현 마일스톤 요약 - 16개 Feature 및 의존성/Tier 구조
keywords: [MVP, 마일스톤, M-001, Feature, 의존성, Tier, 로드맵]
estimated_tokens: ~300
---

# M-001: MVP 핵심 기능 구현

> 원본: `PM-DOCS/Planning/Roadmap/milestone-001.md`

## 개요

서비스 출시에 필요한 최소 기능 세트(MVP)를 구현한다. 에디터의 포스트 작성/관리, 팔로워의 콘텐츠 소비, 결제 시스템 등 핵심 사용자 경험을 완성한다.

- **기간**: 2026-03-04 ~ 2026-03-31
- **상태**: backlog
- **Feature 수**: 16개 (7개 Tier)

## Feature 목록 및 의존성

| Feature | 라벨 | Tier | 의존성 |
| ------- | ---- | ---- | ------ |
| F1. 인증 & 계정 관리 | feature:auth | 1. Foundation | (없음 - 최상위 기반) |
| F2. 서점 시스템 | feature:bookstore | 1. Foundation | F1 |
| F3. 글쓰기 & 발행 | feature:writing | 2. Content | F1, F2 |
| F4. 시리즈 관리 | feature:series | 2. Content | F3 |
| F5. 홈 & 탐색 | feature:home | 3. Discovery | F1 |
| F6. 작품 상세 & 발견 | feature:detail | 3. Discovery | F5 |
| F7. 포인트 시스템 | feature:point | 4. Monetization | F1 |
| F8. 구매 & 내 서재 | feature:purchase | 4. Monetization | F7 |
| F9. 전자책 뷰어 | feature:viewer | 5. Reading | F4, F8, F14 |
| F10. 소셜 인터랙션 | feature:social | 6. Engagement | F1 |
| F11. 알림 시스템 | feature:notification | 6. Engagement | F10 |
| F12. 작가 통계 대시보드 | feature:dashboard | 7. Analytics | F1 |
| F13. 정산 & 출금 | feature:settlement | 7. Analytics | F12 |
| F14. 번역 인프라 | feature:translation | 4. Monetization | F1 |
| F15. 플랫폼 기반 | feature:platform | 1. Foundation | F1 |
| F16. 검색 시스템 | feature:search | 3. Discovery | F5 |

## 개발 우선순위 (Tier)

| Tier | 이름 | Feature | 목적 |
| ---- | ---- | ------- | ---- |
| 1 | Foundation | F1 인증, F2 서점, F15 플랫폼 | 모든 기능의 기반 |
| 2 | Content | F3 글쓰기, F4 시리즈 | 콘텐츠 생산 파이프라인 |
| 3 | Discovery | F5 홈&탐색, F6 작품 상세, F16 검색 | 콘텐츠 발견 및 탐색 |
| 4 | Monetization | F7 포인트, F8 구매&내서재, F14 번역 | 수익화 인프라 |
| 5 | Reading | F9 전자책 뷰어 | 핵심 읽기 경험 |
| 6 | Engagement | F10 소셜, F11 알림 | 재방문 및 충성도 |
| 7 | Analytics | F12 통계, F13 정산&출금 | 작가 운영 도구 |

## 핵심 의존성

- **F1(인증)**: 모든 Feature의 최상위 기반 → 가장 먼저 완료 필수
- **F9(전자책 뷰어)**: F4 + F8 + F14 세 Feature 완료 필요 → 병목 노드
- 같은 Tier 내 Feature는 선행 조건 충족 시 병렬 개발 가능

## 관련 Context

- [planning/INDEX.md](./INDEX.md): Planning Context 인덱스
- [business/access-control.md](../business/access-control.md): 현재 접근 권한 정책
- [business/payment.md](../business/payment.md): 현재 결제 정책
