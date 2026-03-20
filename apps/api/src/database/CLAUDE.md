# Database Migration 규칙

## Migration 생성

Migration 파일은 반드시 `migration:create` 명령으로 생성한다.

```bash
# apps/api/ 디렉토리에서 실행
npx typeorm migration:create src/database/migration/<MigrationName>
```

- 수동으로 파일을 생성하지 않는다 (타임스탬프 정확성 보장)
- `migration:generate`는 Entity 변경 기반 자동 생성 시에만 사용한다

## SnakeNamingStrategy

이 프로젝트는 `SnakeNamingStrategy`를 사용한다. Migration SQL 작성 시 컬럼명은 snake_case를 사용해야 한다.

| Entity 속성    | DB 컬럼명       |
| -------------- | --------------- |
| `deletedAt`    | `deleted_at`    |
| `createdAt`    | `created_at`    |
| `updatedAt`    | `updated_at`    |
| `profileImage` | `profile_image` |
