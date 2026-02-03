# API 개발 스킬

## 개요

Readly API는 tRPC와 NestJS를 결합한 하이브리드 아키텍처입니다.

## 프로젝트 구조

```
apps/api/src/
├── module/              # NestJS 모듈
│   ├── auth/
│   ├── user/
│   ├── post/
│   └── trpc/           # tRPC 설정
├── shared/              # 공통 유틸리티
│   ├── config/
│   ├── repository/
│   └── transaction/
└── main.ts
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

## 체크리스트

작성한 API 코드 확인:

- [ ] RepositoryProvider 사용 여부
- [ ] Entity Factory Method 사용 여부
- [ ] 에러 처리 패턴 준수 여부
- [ ] Zod 스키마 정의 여부
- [ ] 트랜잭션 필요 여부 확인
