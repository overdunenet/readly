---
name: cash-module
description: Cash 모듈 - 캐시 충전, 잔액 관리, 이력 조회, 잔액 정합성 배치 검증
keywords: [캐시, 충전, 잔액, 이력, Payment, CashBalance, UPSERT, 마이크로서비스]
---

# Cash 모듈

캐시(가상 화폐) 충전, 잔액 관리, 이력 조회를 담당하는 모듈이다. 4개의 Entity(Cash, CashBalance, CashHistory, Payment)로 구성되며, 충전 시 Cash 레코드 생성, 잔액 동기화, 이력 기록의 3단계 흐름을 따른다. NestJS MessagePattern 기반 마이크로서비스 패턴으로 노출된다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
| ---- | ---- | ---------------- |
| apps/api/src/module/cash/cash.module.ts | NestJS 모듈 정의, CashService를 외부 export | CashModule |
| apps/api/src/module/cash/cash.controller.ts | MessagePattern 기반 컨트롤러 (3개 엔드포인트) | getBalance(), getHistory(), syncBalances() |
| apps/api/src/module/cash/cash.service.ts | 핵심 비즈니스 로직 | charge(), syncBalance(), getBalance(), getHistory() |
| apps/api/src/module/cash/cash-balance-sync.service.ts | 전체 사용자 잔액 정합성 배치 검증 | syncBalances() |
| apps/api/src/module/domain/cash.entity.ts | 캐시 충전 단위 Entity | CashEntity.create(), CHECK 제약조건 |
| apps/api/src/module/domain/cash-balance.entity.ts | 사용자별 잔액 스냅샷 (userId가 PK) | CashBalanceEntity.create() |
| apps/api/src/module/domain/cash-history.entity.ts | 캐시 변동 이력 (CHARGE/PURCHASE/REFUND) | CashHistoryEntity.create(), CashHistoryType enum |
| apps/api/src/module/domain/payment.entity.ts | PG 결제 정보 (cashId FK, nullable) | PaymentEntity.create(), PaymentStatus enum |

## Entity 관계

```
UserEntity (users)
  1:N -> CashEntity (cash)
           1:N -> CashHistoryEntity (cash_history)
           1:1 <- PaymentEntity (payments) [cashId FK, nullable]
  1:1 -> CashBalanceEntity (cash_balances) [userId가 PK이자 FK]
```

- **Cash**: initialAmount(최초 금액), currentAmount(잔여 금액) 분리 관리
- **CashBalance**: 모든 Cash의 currentAmount 합계를 캐싱 (UPSERT로 관리)
- **Payment**: cashId FK nullable. PG 연동 전 수동 충전 시 Payment 없이 Cash 생성 가능

## 핵심 흐름

### 충전 (CashService.charge)

1. 금액 검증 (1,000원 ~ 1,000,000원)
2. CashEntity.create(userId, amount) -> save
3. syncBalance(userId) -> cash 테이블 SUM -> cash_balances UPSERT
4. CashHistoryEntity.create({type: CHARGE}) -> save

### 잔액 동기화 (CashService.syncBalance)

- SELECT SUM(current_amount) FROM cash -> INSERT ON CONFLICT UPDATE cash_balances

### 전체 정합성 검증 (CashBalanceSyncService.syncBalances)

- Table lock (SHARE + EXCLUSIVE) -> 전체 사용자 UPSERT -> 불일치 건수 반환

### 이력 조회 (CashService.getHistory)

- cursor 기반 페이지네이션 (createdAt DESC, id DESC), limit+1 방식

## 마이크로서비스 패턴

tRPC가 아닌 NestJS @MessagePattern 사용:
- cash.getBalance: 잔액 조회
- cash.getHistory: 이력 조회
- cash.syncBalances: 전체 정합성 검증

## 마이그레이션

| 파일 | 내용 |
| ---- | ---- |
| 1773999555749-CreateCashTables.ts | 4개 테이블 초기 생성 |
| 1774194457975-ReverseCashPaymentRelation.ts | Cash-Payment 관계 역전 |

## 관련 Business Context

- [payment.md](../business/payment.md)
