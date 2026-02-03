---
name: API-Development
description: 백엔드 API 개발 가이드. tRPC Router, Repository 패턴, DDD.
keywords: [API, tRPC, NestJS, Repository, Entity, DDD, 인증]
estimated_tokens: ~900
---

# API 개발 스킬

## 개요

Readly API는 tRPC와 NestJS를 결합한 **Microservice + tRPC 하이브리드** 아키텍처입니다.

> 상세 아키텍처는 `.claude/context/architecture/backend.md` 참조

## 프로젝트 구조

```
apps/api/src/
├── module/
│   ├── domain/          # Entity 정의 (User, Post)
│   ├── user/            # User 도메인
│   ├── post/            # Post 도메인
│   ├── shared/          # 공유 모듈 (Transaction, Repository)
│   └── trpc/            # tRPC 설정 (BaseTrpcRouter, Cookie)
├── database/            # TypeORM 설정 및 마이그레이션
└── config.ts            # ConfigProvider
```

## tRPC Router 작성

### 기본 구조

```typescript
@Router({ alias: 'post' })
export class PostRouter extends BaseTrpcRouter {
  constructor(
    private readonly microserviceClient: ClientProxy,
    private readonly cookieService: CookieService
  ) {
    super();
  }

  @Mutation({
    input: createPostSchema,
    output: postResponseSchema,
  })
  async create(
    @Input('title') title: string,
    @Input('content') content: string,
    @Ctx() ctx: any
  ) {
    return await this.microserviceClient.send('post.create', {
      title,
      content,
      authorId: ctx.user.id,
    });
  }

  @Query({
    output: z.array(postResponseSchema),
  })
  async getMy(@Ctx() ctx: any) {
    return await this.microserviceClient.send('post.getMy', {
      authorId: ctx.user.id,
    });
  }
}
```

## Repository 패턴 (필수)

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

## Entity 설계 (DDD 패턴)

```typescript
@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  // ✅ Static Factory Method
  static create(input: CreatePostInput): PostEntity {
    const post = new PostEntity();
    post.title = input.title;
    post.content = input.content;
    return post;
  }

  // ✅ 비즈니스 로직 캡슐화
  canAccess(user?: UserEntity): boolean {
    if (this.accessLevel === 'public') return true;
    if (!user) return false;
    return this.authorId === user.id;
  }
}
```

## 에러 처리 패턴

```typescript
// ✅ findOneByOrFail + catch 패턴
const user = await this.repositoryProvider.UserRepository.findOneByOrFail({
  email,
}).catch(() => {
  throw new UnauthorizedException('Invalid email or password');
});
```

## 쿠키 기반 인증

```typescript
// Login - refreshToken을 쿠키에 저장
async login(@Input('email') email: string, @Ctx() ctx: any) {
  const result = await this.service.login(email, password);

  // refreshToken은 쿠키로 설정
  this.cookieService.setRefreshTokenCookie(ctx.res, result.refreshToken);

  // accessToken만 응답으로 반환
  return {
    accessToken: result.accessToken,
    user: result.user,
  };
}
```

## 새 모듈 추가 체크리스트

### 1. Entity 생성 (`module/domain/`)

```typescript
@Entity('posts')
export class PostEntity extends BaseEntity {
  // 컬럼 정의
}

// Repository 확장 함수 정의
export const getPostRepository = (source?) =>
  getEntityManager(source).getRepository(PostEntity).extend({
    // 커스텀 메서드
  });
```

### 2. RepositoryProvider에 추가

```typescript
// module/shared/transaction/repository.provider.ts
get PostRepository() {
  return getPostRepository(this.transaction);
}
```

### 3. Service 생성

```typescript
@Injectable()
export class PostService {
  constructor(private repositoryProvider: RepositoryProvider) {}

  async createPost(authorId: string, input: CreateInput) {
    return this.repositoryProvider.PostRepository.createPost({
      ...input,
      authorId,
    });
  }
}
```

### 4. Router 생성

```typescript
@Router({ alias: 'post' })
export class PostRouter extends BaseTrpcRouter {
  @Mutation({ input: schema, output: schema })
  async create(@Input('title') title: string, @Ctx() ctx: any) {
    return this.microserviceClient.send('post.create', { ... });
  }
}
```

### 5. Controller 생성

```typescript
@Controller()
export class PostController {
  @MessagePattern('post.create')
  async handleCreate(data: CreateInput) {
    return this.postService.createPost(data);
  }
}
```

## 코드 리뷰 체크리스트

- [ ] RepositoryProvider 사용 (@InjectRepository 금지)
- [ ] Entity Factory Method 사용
- [ ] findOrFail + catch 에러 처리 패턴
- [ ] Zod 스키마 정의 (input/output)
- [ ] 트랜잭션 필요 여부 확인
- [ ] 권한 검증 로직 Entity에 구현
