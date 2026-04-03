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

const postAccessLevelSchema = z.enum([
  'public',
  'subscriber',
  'purchaser',
  'private',
]);

const ageRatingSchema = z.enum(['all', 'adult']);

const editPostInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  freeContent: z.string().optional(),
  paidContent: z.string().nullable().optional(),
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  accessLevel: postAccessLevelSchema.optional(),
  price: z.number().int().min(0).optional(),
});

const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  freeContent: z.string(),
  paidContent: z.string().nullable(),
  excerpt: z.string().nullish(),
  thumbnail: z.string().nullish(),
  accessLevel: postAccessLevelSchema,
  status: z.enum(['draft', 'published', 'scheduled']),
  price: z.number(),
  ageRating: ageRatingSchema,
  bookstoreId: z.string().uuid().nullable(),
  publishedAt: z.date().nullish(),
  scheduledAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const postFeedItemSchema = postResponseSchema.extend({
  author: z.object({
    id: z.string(),
    nickname: z.string(),
    profileImage: z.string().nullish(),
  }),
});

const saveDraftDataSchema = z.object({
  title: z.string().optional(),
  freeContent: z.string().optional(),
  paidContent: z.string().nullable().optional(),
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().optional(),
});

// Editor 페이지에서 포스트 관리를 위한 Router
@Router({ alias: 'post' })
export class PostRouter extends BaseTrpcRouter {
  /**
   * 포스트 작성
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: editPostInputSchema,
    output: postResponseSchema,
  })
  async create(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof editPostInputSchema>
  ) {
    const result = await this.microserviceClient.send('post.create', {
      authorId: ctx.user.sub,
      input,
    });
    return result;
  }

  /**
   * 포스트 임시저장 (자동/수동)
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string().uuid(),
      data: saveDraftDataSchema,
      saveType: z.enum(['auto', 'manual']),
    }),
    output: postResponseSchema,
  })
  async saveDraft(
    @Input('postId') postId: string,
    @Input('data') data: z.infer<typeof saveDraftDataSchema>,
    @Input('saveType') saveType: string,
    @Ctx() ctx: UserAuthorizedContext
  ) {
    return this.microserviceClient.send('post.saveDraft', {
      postId,
      authorId: ctx.user.sub,
      input: data,
      saveType,
    });
  }

  /**
   * 포스트 수정
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
      data: editPostInputSchema,
    }),
    output: postResponseSchema,
  })
  async update(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
    @Input('data') data: z.infer<typeof editPostInputSchema>
  ) {
    return await this.microserviceClient.send('post.update', {
      postId,
      authorId: ctx.user.sub,
      input: data,
    });
  }

  /**
   * 포스트 발행
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
      accessLevel: postAccessLevelSchema.exclude(['private']).optional(),
      price: z.number().int().min(0).max(100000).optional(),
      ageRating: ageRatingSchema.optional(),
    }),
    output: postResponseSchema,
  })
  async publish(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
    @Input('accessLevel') accessLevel?: string,
    @Input('price') price?: number,
    @Input('ageRating') ageRating?: string
  ) {
    return await this.microserviceClient.send('post.publish', {
      postId,
      authorId: ctx.user.sub,
      accessLevel,
      price,
      ageRating,
    });
  }

  /**
   * 포스트 임시저장으로 변경
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
    }),
    output: postResponseSchema,
  })
  async unpublish(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string
  ) {
    return await this.microserviceClient.send('post.unpublish', {
      postId,
      authorId: ctx.user.sub,
    });
  }

  /**
   * 포스트 삭제
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
    }),
    output: z.boolean(),
  })
  async delete(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string
  ) {
    await this.microserviceClient.send('post.delete', {
      postId,
      authorId: ctx.user.sub,
    });
    return true;
  }

  /**
   * 포스트 단일 조회
   */
  @UseMiddlewares(OptionalUserAuthMiddleware)
  @Query({
    input: z.object({
      postId: z.string(),
    }),
    output: postResponseSchema,
  })
  async getOne(
    @Ctx() ctx: OptionalUserContext,
    @Input('postId') postId: string
  ) {
    const userId = ctx.user?.sub;
    return await this.microserviceClient.send('post.getOne', {
      postId,
      userId,
    });
  }

  /**
   * 내 포스트 목록 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: z.array(postResponseSchema),
  })
  async getMy(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('post.getMy', {
      authorId: ctx.user.sub,
    });
  }

  /**
   * 접근 가능한 포스트 목록 조회
   */
  @Query({
    output: z.array(postFeedItemSchema),
  })
  async getAccessible() {
    return await this.microserviceClient.send('post.getAccessible', {});
  }
}
