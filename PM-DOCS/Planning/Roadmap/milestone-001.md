---
milestone_id: 'M-001'
goal: 'MVP 핵심 기능 구현'
period:
  start: '2026-03-04'
  end: '2026-06-30'
status: 'backlog'
created_at: '2026-03-04'
updated_at: '2026-03-22'
---

# M-001: MVP 핵심 기능 구현

## 연결된 Feature 목록

| Feature명               | 라벨                 | Tier            | 상태    | 의존성               |
| ----------------------- | -------------------- | --------------- | ------- | -------------------- |
| F1. 인증 & 계정 관리    | feature:auth         | 1. Foundation   | backlog | (없음 - 최상위 기반) |
| F2. 서점 시스템         | feature:bookstore    | 1. Foundation   | backlog | F1, F17              |
| F3. 글쓰기 & 발행       | feature:writing      | 2. Content      | backlog | F1, F2               |
| F4. 시리즈 관리         | feature:series       | 2. Content      | backlog | F3                   |
| F5. 홈 & 탐색           | feature:home         | 3. Discovery    | backlog | F1                   |
| F6. 작품 상세 & 발견    | feature:detail       | 3. Discovery    | backlog | F5                   |
| F7. 포인트 시스템       | feature:point        | 4. Monetization | backlog | F1                   |
| F8. 구매 & 내 서재      | feature:purchase     | 4. Monetization | backlog | F7, F17              |
| F9. 전자책 뷰어         | feature:viewer       | 5. Reading      | backlog | F4, F8, F14          |
| F10. 소셜 인터랙션      | feature:social       | 6. Engagement   | backlog | F1                   |
| F11. 알림 시스템        | feature:notification | 6. Engagement   | backlog | F10                  |
| F12. 작가 통계 대시보드 | feature:dashboard    | 7. Analytics    | backlog | F1                   |
| F13. 정산 & 출금        | feature:settlement   | 7. Analytics    | backlog | F12                  |
| F14. 번역 인프라        | feature:translation  | 4. Monetization | backlog | F1                   |
| F15. 플랫폼 기반        | feature:platform     | 1. Foundation   | backlog | F1                   |
| F16. 검색 시스템        | feature:search       | 3. Discovery    | backlog | F5                   |
| F17. 마이페이지         | feature:mypage       | 1. Foundation   | backlog | F1                   |

## 목표 상세

서비스 출시에 필요한 최소 기능 세트(MVP)를 구현한다. 에디터의 포스트 작성/관리, 팔로워의 콘텐츠 소비, 결제 시스템 등 핵심 사용자 경험을 완성한다.

## 의존성 다이어그램

```
F1 인증 ────────────────────────────────────── 모든 Feature의 기반
  │
  ├── F17 마이페이지 ──┬── F2 서점 시스템 ── F3 글쓰기 ── F4 시리즈
  │                    │                                     │
  ├── F15 플랫폼 기반 (i18n, 약관)                           │
  │                    │                                     │
  ├── F7 포인트 시스템 ┴── F8 구매&내서재 ── F9 전자책 뷰어
  │                                              │
  ├── F5 홈&탐색 ──── F6 작품 상세               │
  │       │                                      │
  │       └── F16 검색 시스템                    │
  │                                              │
  ├── F14 번역 인프라 ──────────────────────────┘
  │
  ├── F10 소셜 ── F11 알림
  │
  └── F12 통계 ── F13 정산&출금
```

**의존성 요약**: F9(전자책 뷰어)는 F4(시리즈), F8(구매&내서재), F14(번역 인프라) 3개의 선행 Feature가 모두 완료되어야 착수 가능한 병목 노드이다. F1(인증)은 모든 Feature의 최상위 기반으로, 가장 먼저 완료되어야 한다. F17(마이페이지)은 F2(서점)와 F8(구매&내서재)의 선행 조건으로, 내 서점/내 서재 진입점을 제공한다.

## 개발 우선순위 (Tier)

| Tier | 이름         | Feature                                      | 목적                   |
| ---- | ------------ | -------------------------------------------- | ---------------------- |
| 1    | Foundation   | F1 인증, F2 서점, F15 플랫폼, F17 마이페이지 | 모든 기능의 기반       |
| 2    | Content      | F3 글쓰기, F4 시리즈                         | 콘텐츠 생산 파이프라인 |
| 3    | Discovery    | F5 홈&탐색, F6 작품 상세, F16 검색           | 콘텐츠 발견 및 탐색    |
| 4    | Monetization | F7 포인트, F8 구매&내서재, F14 번역          | 수익화 인프라          |
| 5    | Reading      | F9 전자책 뷰어                               | 핵심 읽기 경험         |
| 6    | Engagement   | F10 소셜, F11 알림                           | 재방문 및 충성도       |
| 7    | Analytics    | F12 통계, F13 정산&출금                      | 작가 운영 도구         |

**Tier 전략**: 하위 Tier는 상위 Tier 완료를 전제로 한다. 단, 같은 Tier 내 Feature는 의존성이 없으면 병렬 개발 가능하다. 예를 들어 Tier 1의 F2(서점)와 F15(플랫폼)는 F1(인증) 완료 후 동시 착수 가능하며, Tier 3의 F5(홈&탐색)와 Tier 4의 F7(포인트)도 각각의 선행 조건만 충족되면 병렬 진행 가능하다.
