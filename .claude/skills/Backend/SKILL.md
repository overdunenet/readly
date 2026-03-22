---
name: Backend
description: NestJS/TypeORM 백엔드 개발 시 사용. 레이어 객체 변환, find vs queryBuilder 선택 기준, Migration 생성 규칙(반드시 migration:create 사용), BDD 테스트 작성 규칙 제공.
keywords:
  [
    Backend,
    백엔드,
    레이어,
    DTO,
    Entity,
    Service,
    Controller,
    TypeORM,
    find,
    queryBuilder,
    migration,
    마이그레이션,
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

<rules>

## TypeORM 사용 규칙

> **find 메서드를 기본으로 사용하고, QueryBuilder는 필요한 경우에만 사용한다.**

### TypeORM 쿼리 우선순위

우선순위: find > queryBuilder > raw query

- **find**: 기본 CRUD, 조건 조회, 페이지네이션
- **queryBuilder**: groupBy, SUM 등 집계, 복잡한 JOIN (find 불가 시에만)
- **raw query**: queryBuilder로도 불가능한 경우에만 (최후 수단)

### find 메서드 우선 사용

```typescript
// ✅ 기본 조회
const user = await this.userRepository.findOneBy({ id });
const users = await this.userRepository.find({
  where: { status: 'active' },
  relations: ['orders'],
  order: { createdAt: 'DESC' },
  take: 10,
});

// ✅ 조건 조합
const users = await this.userRepository.find({
  where: [
    { status: 'active', role: 'admin' },
    { status: 'active', role: 'manager' },
  ],
});
```

### QueryBuilder 허용 케이스

**다음 경우에만 QueryBuilder 사용:**

| 케이스                   | 예시             |
| ------------------------ | ---------------- |
| **groupBy**              | 집계 쿼리        |
| **getRawMany/getRawOne** | 원시 데이터 필요 |
| **복잡한 서브쿼리**      | 중첩 쿼리        |
| **복잡한 JOIN 조건**     | ON 절 커스텀     |

</rules>

<examples>
<example type="good">
```typescript
// ✅ QueryBuilder 허용: groupBy + getRawMany
const stats = await this.orderRepository
  .createQueryBuilder('order')
  .select('order.status', 'status')
  .addSelect('COUNT(*)', 'count')
  .addSelect('SUM(order.amount)', 'total')
  .groupBy('order.status')
  .getRawMany();
```
</example>
<example type="bad">
```typescript
// ❌ 불필요한 QueryBuilder 사용
const user = await this.userRepository
  .createQueryBuilder('user')
  .where('user.id = :id', { id })
  .getOne();
```
</example>
<example type="good">
```typescript
// ✅ find로 대체
const user = await this.userRepository.findOneBy({ id });
```
</example>
</examples>

---

<checklist>

## 체크리스트

- [ ] Controller에서 DTO를 그대로 Service에 전달하는가? (Entity 변환은 Service에서)
- [ ] Service에서 Entity가 필요한 시점에 변환하는가?
- [ ] Service의 return은 Entity 또는 일반 객체인가?
- [ ] Controller에서 Response DTO/Schema로 변환하는가?
- [ ] TypeORM find 메서드를 우선 사용하는가?
- [ ] QueryBuilder는 groupBy, getRawMany 등 필요한 경우에만 사용하는가?

</checklist>

<rules>

## Migration 작성 규칙

> **Migration 파일은 반드시 CLI 명령어로 생성한다. 수동으로 타임스탬프를 지정하여 파일을 만들지 않는다.**

### 파일 생성 (필수)

```bash
# apps/api 디렉토리에서 실행 (yarn 3.x에서 함수 문법 이슈로 npx 직접 사용)
cd apps/api && npx typeorm migration:create src/database/migration/<MigrationName>
```

- **절대 수동으로 타임스탬프 파일명을 만들지 않는다** (예: `1774100000000-xxx.ts` 직접 생성 금지)
- TypeORM CLI가 자동 생성한 타임스탬프 + 클래스명을 그대로 사용한다
- `migration:create`가 생성한 빈 `up()`/`down()` 메서드에 SQL을 채운다
- MigrationName은 PascalCase로 작성한다 (예: `AddUserStatus`, `CreatePostsTable`)

### 작성 패턴

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1773926438602 implements MigrationInterface {
  name = 'AddUserStatus1773926438602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // CREATE TYPE → CREATE TABLE → ALTER TABLE → CREATE INDEX 순서
    await queryRunner.query(`CREATE TYPE "user_status" AS ENUM (...)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN ...`);
    await queryRunner.query(`CREATE INDEX ...`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // up의 역순: DROP INDEX → ALTER TABLE DROP → DROP TYPE
    await queryRunner.query(`DROP INDEX ...`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN ...`);
    await queryRunner.query(`DROP TYPE ...`);
  }
}
```

### 규칙

- `name` 프로퍼티를 클래스명과 동일하게 설정한다
- raw SQL로 작성한다 (QueryBuilder 사용하지 않음)
- `up`에서 CREATE TYPE → CREATE TABLE → ALTER TABLE → CREATE INDEX 순서
- `down`에서 DROP INDEX → ALTER TABLE → DROP TABLE → DROP TYPE 역순
- 각 SQL문은 별도 `queryRunner.query()` 호출로 분리한다
- 기존 데이터 마이그레이션(UPDATE)은 DDL 뒤에 배치한다
- 실행: `yarn workspace @readly/api migration:run`
- 롤백: `yarn workspace @readly/api migration:revert`

</rules>

<reference>

## 관련 문서

| 주제       | 위치             | 설명                                      |
| ---------- | ---------------- | ----------------------------------------- |
| BDD 테스트 | `bdd-testing.md` | NestJS + Jest BDD 스타일 테스트 작성 규칙 |

</reference>
