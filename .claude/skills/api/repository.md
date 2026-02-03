---
name: Repository-Pattern
description: Repository 패턴과 쿼리 작성 가이드. find/findOrFail 우선, queryBuilder 지양.
keywords:
  [
    Repository,
    RepositoryProvider,
    find,
    findBy,
    findOrFail,
    queryBuilder,
    TypeORM,
  ]
estimated_tokens: ~600
---

# Repository 패턴

## RepositoryProvider 사용 (필수)

**모든 DB 접근은 RepositoryProvider를 통해야 합니다.**

### 올바른 사용법

```typescript
// ✅ RepositoryProvider 사용
constructor(
  private readonly repositoryProvider: RepositoryProvider
) {}

const user = await this.repositoryProvider.UserRepository.findOneBy({ id });
```

### 잘못된 사용법

```typescript
// ❌ @InjectRepository 직접 사용 금지
constructor(
  @InjectRepository(Entity)
  private repository: Repository<Entity>
) {}
```

### Repository 추가 방법

```typescript
// 1. Repository 함수 생성
export const getPostRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PostEntity)
    .extend({
      async findPublished() {
        return this.find({ where: { status: 'published' } });
      },
    });

// 2. RepositoryProvider에 추가
export class RepositoryProvider {
  get PostRepository() {
    return getPostRepository(this.transaction);
  }
}
```

## 쿼리 패턴

**코드 가독성을 위해 `find`/`findOrFail` 패턴을 적극 사용하고, `queryBuilder`는 최대한 지양합니다.**

### 기본 조회 패턴

```typescript
// ✅ find / findBy 사용 (권장)
const users = await repository.find({
  where: { status: 'active' },
  relations: ['posts'],
  order: { createdAt: 'DESC' },
});

// ✅ 단순 조건은 findBy 사용
const activeUsers = await repository.findBy({ status: 'active' });

// ✅ 단일 조회
const user = await repository.findOne({
  where: { id },
  relations: ['profile'],
});

// ✅ 단순 조건 단일 조회
const user = await repository.findOneBy({ email });
```

### findOrFail 패턴 (필수)

```typescript
// ✅ 존재하지 않으면 예외 - catch로 커스텀 에러 처리
const user = await repository.findOneByOrFail({ id }).catch(() => {
  throw new NotFoundException('사용자를 찾을 수 없습니다');
});

// ✅ 복잡한 조건의 findOrFail
const post = await repository
  .findOneOrFail({
    where: { id, authorId },
    relations: ['author'],
  })
  .catch(() => {
    throw new ForbiddenException('접근 권한이 없습니다');
  });
```

### QueryBuilder 사용 지양

```typescript
// ❌ 단순 조회에 QueryBuilder 사용 금지
const users = await repository
  .createQueryBuilder('user')
  .where('user.status = :status', { status: 'active' })
  .getMany();

// ✅ find로 대체
const users = await repository.findBy({ status: 'active' });

// ❌ 복잡해 보이는 QueryBuilder
const posts = await repository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')
  .where('post.status = :status', { status: 'published' })
  .orderBy('post.createdAt', 'DESC')
  .getMany();

// ✅ find 옵션으로 대체
const posts = await repository.find({
  where: { status: 'published' },
  relations: ['author'],
  order: { createdAt: 'DESC' },
});
```

### QueryBuilder 허용 케이스

```typescript
// ✅ 복잡한 집계/통계 쿼리
const stats = await repository
  .createQueryBuilder('post')
  .select('post.authorId')
  .addSelect('COUNT(*)', 'postCount')
  .groupBy('post.authorId')
  .getRawMany();

// ✅ 서브쿼리가 필요한 경우
const result = await repository
  .createQueryBuilder('post')
  .where('post.viewCount > :avg', {
    avg: subQuery.select('AVG(viewCount)'),
  })
  .getMany();
```

### Repository 확장 메서드

```typescript
// ✅ 자주 사용하는 복잡한 조회는 Repository 확장 메서드로 캡슐화
export const getPostRepository = (source?) =>
  getEntityManager(source)
    .getRepository(PostEntity)
    .extend({
      // 도메인 특화 메서드
      async findPublishedByAuthor(authorId: string) {
        return this.find({
          where: { authorId, status: 'published' },
          order: { publishedAt: 'DESC' },
        });
      },

      async findWithAccessCheck(id: string, userId?: string) {
        const post = await this.findOneOrFail({
          where: { id },
          relations: ['author'],
        }).catch(() => {
          throw new NotFoundException('포스트를 찾을 수 없습니다');
        });

        if (!post.canAccess(userId)) {
          throw new ForbiddenException('접근 권한이 없습니다');
        }

        return post;
      },
    });
```

## 체크리스트

- [ ] RepositoryProvider 사용 (@InjectRepository 금지)
- [ ] find/findBy/findOrFail 사용 (queryBuilder 지양)
- [ ] findOrFail + catch 에러 처리 패턴
- [ ] 복잡한 조회는 Repository 확장 메서드로 캡슐화
