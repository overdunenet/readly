# API 개발 가이드

## 개요

Readly API는 tRPC와 NestJS를 결합한 하이브리드 아키텍처로 구축되었습니다. 이 가이드는 API 엔드포인트를 개발하고 관리하는 방법을 설명합니다.

## tRPC + NestJS 아키텍처

### 왜 tRPC + NestJS인가?

- **타입 안전성**: 클라이언트-서버 간 완벽한 타입 공유
- **개발 생산성**: 자동 완성과 컴파일 타임 에러 감지
- **엔터프라이즈 기능**: NestJS의 DI, 데코레이터, 모듈 시스템
- **유연성**: REST API와 tRPC를 동시에 지원

### 기본 구조

```
apps/api/
├── src/
│   ├── server/
│   │   ├── routers/          # tRPC 라우터
│   │   ├── context.ts        # tRPC 컨텍스트
│   │   └── trpc.ts           # tRPC 인스턴스
│   ├── modules/              # NestJS 모듈
│   │   ├── auth/
│   │   ├── users/
│   │   ├── posts/
│   │   └── payments/
│   ├── common/               # 공통 유틸리티
│   ├── config/               # 설정 파일
│   └── main.ts               # 애플리케이션 진입점
```

## tRPC 라우터 개발

### 1. 기본 라우터 생성

```typescript
// src/server/routers/posts.router.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postsRouter = router({
  // 공개 엔드포인트
  list: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      category: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, category } = input;
      
      return ctx.postService.findAll({
        page,
        limit,
        category,
      });
    }),

  // 보호된 엔드포인트
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      category: z.string(),
      accessType: z.enum(['public', 'subscriber', 'paid', 'private']),
      price: z.number().min(0).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.postService.create({
        ...input,
        authorId: ctx.user.id,
      });
    }),
});
```

### 2. 입력 검증

```typescript
// 재사용 가능한 스키마 정의
const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

// 스키마 확장
const createPostSchema = postSchema.extend({
  accessType: z.enum(['public', 'subscriber', 'paid', 'private']),
  price: z.number().min(0).optional(),
});

// 스키마 부분 적용
const updatePostSchema = postSchema.partial();
```

### 3. 에러 처리

```typescript
import { TRPCError } from '@trpc/server';

export const postRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.postService.findById(input.id);
      
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '포스트를 찾을 수 없습니다.',
        });
      }
      
      // 접근 권한 확인
      if (!post.canAccess(ctx.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '이 포스트에 접근할 권한이 없습니다.',
        });
      }
      
      return post;
    }),
});
```

### 4. 미들웨어 사용

```typescript
// src/server/middleware/rateLimit.ts
export const rateLimitMiddleware = middleware(async ({ ctx, next }) => {
  const identifier = ctx.user?.id || ctx.ip;
  
  if (await isRateLimited(identifier)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    });
  }
  
  return next();
});

// 라우터에 적용
export const apiRouter = router({
  posts: postsRouter,
}).middleware(rateLimitMiddleware);
```

## NestJS 서비스 개발

### 1. 서비스 클래스

```typescript
// src/modules/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(options: FindPostsOptions) {
    const qb = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.accessType = :accessType', { accessType: 'public' });

    if (options.category) {
      qb.andWhere('post.category = :category', { 
        category: options.category 
      });
    }

    const [posts, total] = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return {
      posts,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async create(data: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create(data);
    return this.postsRepository.save(post);
  }
}
```

### 2. 엔티티 정의

```typescript
// src/modules/posts/entities/post.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  content: string;

  @Column({ 
    type: 'enum', 
    enum: ['public', 'subscriber', 'paid', 'private'],
    default: 'public'
  })
  accessType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  // 커스텀 메서드
  canAccess(user?: User): boolean {
    if (this.accessType === 'public') return true;
    if (!user) return false;
    
    if (this.author.id === user.id) return true;
    
    switch (this.accessType) {
      case 'subscriber':
        return user.isSubscribedTo(this.author.id);
      case 'paid':
        return user.hasPurchased(this.id);
      default:
        return false;
    }
  }
}
```

### 3. DTO (Data Transfer Object)

```typescript
// src/modules/posts/dto/create-post.dto.ts
import { IsString, IsEnum, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsEnum(['public', 'subscriber', 'paid', 'private'])
  accessType: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsString()
  authorId: string;
}
```

## 인증 및 권한 관리

### 1. JWT 인증 설정

```typescript
// src/modules/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { 
      id: payload.sub, 
      email: payload.email,
      role: payload.role,
    };
  }
}
```

### 2. tRPC 컨텍스트에서 인증

```typescript
// src/server/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyJwt } from '../modules/auth/jwt.utils';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;

  if (token) {
    try {
      user = await verifyJwt(token);
    } catch (error) {
      // 유효하지 않은 토큰은 무시
    }
  }

  return {
    req,
    res,
    user,
    // 서비스 인스턴스 주입
    postService: req.app.get('postService'),
    userService: req.app.get('userService'),
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

### 3. 보호된 프로시저

```typescript
// src/server/trpc.ts
const isAuthed = middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = procedure.use(isAuthed);
```

## 데이터베이스 작업

### 1. 트랜잭션 처리

```typescript
// src/modules/payments/payments.service.ts
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(private dataSource: DataSource) {}

  async processPurchase(userId: string, postId: string, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 결제 기록 생성
      const payment = await queryRunner.manager.save(Payment, {
        userId,
        postId,
        amount,
        status: 'pending',
      });

      // 2. 사용자 포인트 차감
      await queryRunner.manager.decrement(
        User, 
        { id: userId }, 
        'points', 
        amount
      );

      // 3. 구매 권한 부여
      await queryRunner.manager.save(Purchase, {
        userId,
        postId,
        paymentId: payment.id,
      });

      // 4. 결제 상태 업데이트
      payment.status = 'completed';
      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

### 2. 복잡한 쿼리

```typescript
// 구독자 통계 조회
async getSubscriberStats(editorId: string) {
  const stats = await this.subscriptionRepository
    .createQueryBuilder('sub')
    .select('DATE(sub.createdAt)', 'date')
    .addSelect('COUNT(*)', 'count')
    .addSelect('SUM(sub.amount)', 'revenue')
    .where('sub.editorId = :editorId', { editorId })
    .andWhere('sub.status = :status', { status: 'active' })
    .groupBy('DATE(sub.createdAt)')
    .orderBy('date', 'DESC')
    .limit(30)
    .getRawMany();

  return stats;
}
```

## 파일 업로드

### 1. Multer 설정

```typescript
// src/config/multer.config.ts
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const filename = `${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
  },
};
```

### 2. 업로드 엔드포인트

```typescript
// tRPC에서 파일 업로드 처리
export const uploadRouter = router({
  image: protectedProcedure
    .input(z.object({ 
      base64: z.string(),
      filename: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64, 'base64');
      const path = await ctx.fileService.saveImage(buffer, input.filename);
      
      return { url: path };
    }),
});
```

## 실시간 기능

### 1. WebSocket 설정

```typescript
// src/modules/realtime/realtime.gateway.ts
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe:post')
  handleSubscribePost(client: Socket, postId: string) {
    client.join(`post:${postId}`);
    return { event: 'subscribed', data: { postId } };
  }

  // 새 댓글 알림
  notifyNewComment(postId: string, comment: Comment) {
    this.server.to(`post:${postId}`).emit('new:comment', comment);
  }
}
```

### 2. tRPC Subscription (실험적)

```typescript
export const commentsRouter = router({
  onNewComment: subscription({
    input: z.object({ postId: z.string() }),
    resolve: async function* ({ input }) {
      // EventEmitter 또는 Redis Pub/Sub 사용
      for await (const comment of commentStream(input.postId)) {
        yield comment;
      }
    },
  }),
});
```

## 테스트

### 1. 유닛 테스트

```typescript
// src/modules/posts/posts.service.spec.ts
describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should create a post', async () => {
    const createDto = {
      title: 'Test Post',
      content: 'Test Content',
      authorId: 'user-id',
    };

    const mockPost = { id: 'post-id', ...createDto };
    jest.spyOn(repository, 'create').mockReturnValue(mockPost as any);
    jest.spyOn(repository, 'save').mockResolvedValue(mockPost as any);

    const result = await service.create(createDto);
    expect(result).toEqual(mockPost);
  });
});
```

### 2. E2E 테스트

```typescript
// test/posts.e2e-spec.ts
describe('Posts API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/trpc/posts.list (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/trpc/posts.list')
      .expect(200)
      .expect((res) => {
        expect(res.body.result.data).toBeDefined();
        expect(Array.isArray(res.body.result.data.posts)).toBe(true);
      });
  });
});
```

## 성능 최적화

### 1. 쿼리 최적화

```typescript
// N+1 문제 해결
const posts = await this.postsRepository.find({
  relations: ['author', 'tags'], // Eager loading
  take: 20,
});

// 또는 QueryBuilder 사용
const posts = await this.postsRepository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')
  .leftJoinAndSelect('post.tags', 'tags')
  .take(20)
  .getMany();
```

### 2. 캐싱

```typescript
// Redis 캐싱
@Injectable()
export class PostsService {
  constructor(
    private cacheManager: Cache,
  ) {}

  async findById(id: string): Promise<Post> {
    const cacheKey = `post:${id}`;
    
    // 캐시 확인
    const cached = await this.cacheManager.get<Post>(cacheKey);
    if (cached) return cached;
    
    // DB 조회
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    
    // 캐시 저장 (TTL: 1시간)
    if (post) {
      await this.cacheManager.set(cacheKey, post, 3600);
    }
    
    return post;
  }
}
```

## 모범 사례

### 1. 에러 처리

```typescript
// 전역 에러 필터
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = '서버 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 2. 로깅

```typescript
// Winston 로거 설정
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
  ],
});
```

### 3. 환경 변수 관리

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
```

## API 문서화

### OpenAPI 스펙 생성

```typescript
// tRPC에서 OpenAPI 생성
import { generateOpenApiDocument } from 'trpc-openapi';

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Readly API',
  version: '1.0.0',
  baseUrl: 'https://api.readly.com',
});
```

이 가이드를 통해 Readly API를 효과적으로 개발하고 관리할 수 있습니다.