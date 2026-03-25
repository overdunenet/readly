import { z } from 'zod';
import {
  Input,
  Query,
  Router,
  Mutation,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
  OptionalUserAuthMiddleware,
  OptionalUserContext,
} from '../user/user.auth.middleware';
import {
  openBookstoreInputSchema,
  bookstoreResponseSchema,
  updateProfileInputSchema,
  postResponseSchema,
  postFeedItemSchema,
  publishDefaultResponseSchema,
  updateSettingsInputSchema,
} from './bookstore.schema';

@Router({ alias: 'bookstore' })
export class BookstoreRouter extends BaseTrpcRouter {
  /**
   * 서점 오픈
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: openBookstoreInputSchema,
    output: bookstoreResponseSchema,
  })
  async open(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof openBookstoreInputSchema>
  ) {
    return await this.microserviceClient.send('bookstore.open', {
      userId: ctx.user.sub,
      input: {
        penName: input.penName,
        storeName: input.storeName,
        termsAgreedAt: input.termsAgreed ? new Date() : undefined,
      },
    });
  }

  /**
   * 서점 보유 여부 확인
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: z.boolean(),
  })
  async hasBookstore(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('bookstore.hasBookstore', {
      userId: ctx.user.sub,
    });
  }

  /**
   * 내 서점 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: bookstoreResponseSchema,
  })
  async getMyBookstore(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('bookstore.getMyBookstore', {
      userId: ctx.user.sub,
    });
  }

  /**
   * 서점 프로필 수정
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: updateProfileInputSchema,
    output: bookstoreResponseSchema,
  })
  async updateProfile(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof updateProfileInputSchema>
  ) {
    return await this.microserviceClient.send('bookstore.updateProfile', {
      userId: ctx.user.sub,
      input,
    });
  }

  /**
   * 서점 단일 조회 (독자용, 비로그인 허용)
   */
  @UseMiddlewares(OptionalUserAuthMiddleware)
  @Query({
    input: z.object({
      bookstoreId: z.string().uuid(),
    }),
    output: bookstoreResponseSchema,
  })
  async getById(
    @Ctx() _ctx: OptionalUserContext,
    @Input('bookstoreId') bookstoreId: string
  ) {
    return await this.microserviceClient.send('bookstore.getById', {
      bookstoreId,
    });
  }

  /**
   * 서점 포스트 목록 조회 (독자용, 비로그인 허용)
   */
  @UseMiddlewares(OptionalUserAuthMiddleware)
  @Query({
    input: z.object({
      bookstoreId: z.string().uuid(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(50).default(20),
    }),
    output: z.object({
      posts: z.array(postFeedItemSchema),
      total: z.number(),
    }),
  })
  async getPosts(
    @Ctx() _ctx: OptionalUserContext,
    @Input('bookstoreId') bookstoreId: string,
    @Input('page') page: number,
    @Input('limit') limit: number
  ) {
    return await this.microserviceClient.send('bookstore.getPosts', {
      bookstoreId,
      options: { page, limit },
    });
  }

  /**
   * 내 작품 목록 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({
      status: z.enum(['draft', 'published', 'scheduled']).optional(),
    }),
    output: z.array(postResponseSchema),
  })
  async getMyWorks(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('status') status?: string
  ) {
    return await this.microserviceClient.send('bookstore.getMyWorks', {
      userId: ctx.user.sub,
      status,
    });
  }

  /**
   * 발행 디폴트 설정 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: publishDefaultResponseSchema,
  })
  async getSettings(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('bookstore.getSettings', {
      userId: ctx.user.sub,
    });
  }

  /**
   * 발행 디폴트 설정 수정
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: updateSettingsInputSchema,
    output: publishDefaultResponseSchema,
  })
  async updateSettings(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof updateSettingsInputSchema>
  ) {
    return await this.microserviceClient.send('bookstore.updateSettings', {
      userId: ctx.user.sub,
      input,
    });
  }

  /**
   * 인기 글 목록 조회 (독자용, 비로그인 허용)
   */
  @UseMiddlewares(OptionalUserAuthMiddleware)
  @Query({
    input: z.object({
      bookstoreId: z.string().uuid(),
      limit: z.number().int().positive().max(10).default(5),
    }),
    output: z.array(postFeedItemSchema),
  })
  async getPopularPosts(
    @Ctx() _ctx: OptionalUserContext,
    @Input('bookstoreId') bookstoreId: string,
    @Input('limit') limit: number
  ) {
    return await this.microserviceClient.send('bookstore.getPopularPosts', {
      bookstoreId,
      limit,
    });
  }
}
