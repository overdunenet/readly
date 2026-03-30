---
name: Backend
description: NestJS 백엔드 개발 시 사용. 레이어 객체 변환 규칙, BDD 테스트 작성 규칙 제공.
keywords:
  [
    Backend,
    백엔드,
    레이어,
    DTO,
    Entity,
    Service,
    Controller,
    test,
    BDD,
    테스트,
    Jest,
  ]
user-invocable: false
---

# 백엔드 개발 원칙

<rules>

## 레이어 간 객체 변환 규칙

> **객체 변환은 필요한 시점에 해당 레이어에서 수행한다.**

### 핵심 원칙

| 레이어         | 입력              | 출력                  | 변환 책임                   |
| -------------- | ----------------- | --------------------- | --------------------------- |
| **Controller** | Request DTO       | Response DTO/Schema   | Entity -> Response 변환     |
| **Service**    | DTO (그대로 사용) | Entity 또는 일반 객체 | DTO -> Entity 변환 (필요시) |
| **Repository** | Entity            | Entity                | 없음                        |

</rules>

### Controller -> Service 호출

<examples>
<example type="bad">
```typescript
// ❌ Controller에서 미리 Entity로 변환
@Post()
async create(@Body() dto: CreateUserDto) {
  const entity = new User();
  entity.name = dto.name;
  entity.email = dto.email;
  return this.userService.create(entity);  // Entity 전달
}
```
</example>
<example type="good">
```typescript
// ✅ DTO 그대로 전달
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);  // DTO 전달
}
```
</example>
</examples>

### Service 내부 처리

```typescript
// ✅ Service에서 DTO로 사용하다가 필요한 시점에 Entity로 변환
async create(dto: CreateUserDto) {
  // DTO로 비즈니스 로직 처리
  const isValid = this.validateEmail(dto.email);

  // Entity가 필요한 시점에 변환
  const user = new User();
  user.name = dto.name;
  user.email = dto.email;

  return this.userRepository.save(user);
}
```

### Enum 패턴

- DB 컬럼: `type: 'varchar'` (DB에 CREATE TYPE enum 사용하지 않음)
- 코드: TypeScript enum 정의 후 Entity에서 타입으로 사용
- default 값: enum 멤버로 지정 (e.g., `PaymentStatus.PENDING`)
- 이유: DB enum은 변경 시 ALTER TYPE 필요하여 유연성 떨어짐

### Service -> Controller 반환

```typescript
// ✅ Service: Entity 또는 일반 객체 반환
async findById(id: number): Promise<User> {
  return this.userRepository.findOneBy({ id });
}

async findWithStats(id: number): Promise<{ user: User; orderCount: number }> {
  const user = await this.userRepository.findOneBy({ id });
  const orderCount = await this.orderRepository.countBy({ userId: id });
  return { user, orderCount };
}

// ✅ Controller: Response DTO/Schema로 변환
@Get(':id')
async findOne(@Param('id') id: number) {
  const user = await this.userService.findById(id);
  return UserResponseDto.from(user);  // Controller에서 변환
}
```

---

<checklist>

## 체크리스트

- [ ] Controller에서 DTO를 그대로 Service에 전달하는가? (Entity 변환은 Service에서)
- [ ] Service에서 Entity가 필요한 시점에 변환하는가?
- [ ] Service의 return은 Entity 또는 일반 객체인가?
- [ ] Controller에서 Response DTO/Schema로 변환하는가?

</checklist>

<reference>

## 관련 문서

| 주제              | 위치               | 설명                                      |
| ----------------- | ------------------ | ----------------------------------------- |
| TypeORM 사용 규칙 | `TypeORM/SKILL.md` | find vs queryBuilder 선택 기준            |
| BDD 테스트        | `bdd-testing.md`   | NestJS + Jest BDD 스타일 테스트 작성 규칙 |

</reference>

<rules>

### Router(BFF)와 Service 역할 구분

> 이 프로젝트는 tRPC 기반이므로 REST Controller 대신 **Router**가 클라이언트 대면 레이어 역할을 한다.

| 레이어      | 역할                                           | 클라이언트 종속성 |
| ----------- | ---------------------------------------------- | ----------------- |
| **Router**  | FE 요구사항에 맞춘 데이터 조합/변환 (BFF 역할) | 종속 (FE 전용)    |
| **Service** | 도메인 비즈니스 로직, 오케스트레이션           | 독립 (재사용)     |

- Router는 여러 Service를 호출하여 FE 페이지에 맞는 응답을 조합한다
- Service는 특정 FE 화면을 모르며, 순수 도메인 로직만 수행한다
- FE에서 API 응답을 대폭 변환해야 한다면 Router 설계를 재검토한다

### @Transactional 패턴

- mutation query는 Controller에서 `@Transactional` 데코레이터 사용
- Service에서 `transactionService.runInTransaction()` 직접 호출 금지
- @Transactional 순서: `@MessagePattern` 아래에 배치
- Controller에 `transactionService: TransactionService` DI 필수
- Service는 RepositoryProvider만 사용 — 트랜잭션 컨텍스트 자동 전파
- Cron 등 배치도 Controller MessagePattern 경유하여 트랜잭션 보장

### 의존성 추가 시 Jest 호환성

- 새 npm 패키지 추가 후 `yarn workspace @readly/api test` 실행하여 호환성 확인
- `"type": "module"` (ESM-only) 패키지는 Jest에서 파싱 불가 → `moduleNameMapper`로 mock 필요
- `transformIgnorePatterns`만으로는 해결 안 됨: ts-jest는 ESM `.js` 파일 transform 불가

### 도메인 전제조건 변경 시 테스트 영향

- Service 메서드에 새 guard/validation 추가 시, 해당 메서드를 호출하는 테스트를 grep으로 검색
- 테스트 fixture에 새 전제조건 셋업 추가 (예: bookstore 필수 → `createTestBookstore()` 추가)
- `app.module.ts`를 전체 로드하는 통합 테스트는 모든 모듈 의존성 영향을 받음에 유의

</rules>
