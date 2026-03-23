---
name: business-payment
description: Readly 결제 시스템 - 결제 수단, 유형, 환불 정책
keywords: [결제, 구독, 환불, 포스트구매, 월간구독, 토스페이, 카카오페이, 캐시충전]
estimated_tokens: ~200
related_contexts:
  - business-overview
  - business-access-control
---

# 결제 시스템

## 결제 수단

- 신용/체크카드
- 간편결제 (토스페이, 카카오페이)

## 결제 유형

### 1. 포스트 구매

- **대상**: 개별 포스트의 유료 구간(paidContent) 열람권
- **방식**: 1회 결제
- **접근 권한**: `purchaser` 레벨 Post 대상

### 2. 구독 결제

- **대상**: 에디터의 구독자 전용 Post 전체
- **방식**: 월간 자동 갱신
- **접근 권한**: `subscriber` 레벨 Post 대상

### 3. 캐시 충전

- **대상**: 플랫폼 내 가상 화폐(캐시) 잔액
- **방식**: 1회 충전 (1,000원 ~ 1,000,000원)
- **용도**: 포스트 구매 시 캐시로 결제
- **잔액 관리**: CashBalance 테이블에 스냅샷 캐싱, 배치 정합성 검증

## 환불 정책

### 포스트 구매 환불

- **조건**: 열람 전 7일 이내
- **환불액**: 전액

### 구독 환불

- **조건**: 언제든지 취소 가능
- **환불액**: 남은 기간 일할 계산

## 관련 문서

- `business/access-control.md`: 접근 권한과 결제 연관성
- `business/overview.md`: 결제 Flow 다이어그램
- `codebase/cash-module.md`: Cash 모듈 구현 상세
