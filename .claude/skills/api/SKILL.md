---
name: API-Development
description: 백엔드 API 개발 가이드. tRPC Router, Repository, DDD, 트랜잭션.
keywords: [API, tRPC, NestJS, Repository, Entity, DDD, Transaction]
estimated_tokens: ~500
---

# API 개발 스킬

## 개요

Readly API는 tRPC와 NestJS를 결합한 **Microservice + tRPC 하이브리드** 아키텍처입니다.

> 상세 아키텍처는 `.claude/context/architecture/backend.md` 참조

## 상세 문서

| 문서                               | 설명                               |
| ---------------------------------- | ---------------------------------- |
| [repository.md](./repository.md)   | Repository 패턴, 쿼리 작성 가이드  |
| [transaction.md](./transaction.md) | 트랜잭션 관리, @Transactional      |
| [ddd.md](./ddd.md)                 | DDD 패턴, Entity/Service 책임 분리 |

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

  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: createPostSchema,
    output: postResponseSchema,
  })
  async create(
    @Input('title') title: string,
    @Input('content') content: string,
    @Ctx() ctx: UserAuthorizedContext
  ) {
    return await this.microserviceClient.send('post.create', {
      title,
      content,
      authorId: ctx.user.id,
    });
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: z.array(postResponseSchema),
  })
  async getMy(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('post.getMy', {
      authorId: ctx.user.id,
    });
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
    const post = PostEntity.create({ ...input, authorId });
    return this.repositoryProvider.PostRepository.save(post);
  }
}
```

### 4. Router 생성

```typescript
@Router({ alias: 'post' })
export class PostRouter extends BaseTrpcRouter {
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({ input: schema, output: schema })
  async create(@Input('title') title: string, @Ctx() ctx: UserAuthorizedContext) {
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

### Repository & 트랜잭션

- [ ] RepositoryProvider 사용 (@InjectRepository 금지)
- [ ] **인증 필요 메서드에 @UseMiddlewares(UserAuthMiddleware) 적용**
- [ ] find/findBy/findOrFail 사용 (queryBuilder 지양)
- [ ] findOrFail + catch 에러 처리 패턴

> 상세: [repository.md](./repository.md), [transaction.md](./transaction.md)

### DDD 패턴

- [ ] Entity Factory Method로 생성
- [ ] 상태 변경 로직은 Entity 메서드로 구현
- [ ] 권한 검증 로직은 Entity에 구현
- [ ] Service는 오케스트레이션만 담당

> 상세: [ddd.md](./ddd.md)

### 기타

- [ ] Zod 스키마 정의 (input/output)
- [ ] 적절한 에러 메시지 제공
