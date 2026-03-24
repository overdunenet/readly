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

const createReviewInputSchema = z.object({
  bookstoreId: z.string().uuid(),
  content: z.string().min(1, '내용을 입력해주세요').max(500),
});

const updateReviewInputSchema = z.object({
  reviewId: z.string().uuid(),
  content: z.string().min(1, '내용을 입력해주세요').max(500),
});

const deleteReviewInputSchema = z.object({
  reviewId: z.string().uuid(),
});

const getByBookstoreInputSchema = z.object({
  bookstoreId: z.string().uuid(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

const reviewerSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  profileImage: z.string().nullish(),
});

const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  bookstoreId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  content: z.string(),
  reviewer: reviewerSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

@Router({ alias: 'bookstoreReview' })
export class BookstoreReviewRouter extends BaseTrpcRouter {
  /**
   * 리뷰 작성
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: createReviewInputSchema,
    output: reviewResponseSchema,
  })
  async create(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('bookstoreId') bookstoreId: string,
    @Input('content') content: string
  ) {
    return await this.microserviceClient.send('bookstoreReview.create', {
      reviewerId: ctx.user.sub,
      bookstoreId,
      content,
    });
  }

  /**
   * 리뷰 수정
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: updateReviewInputSchema,
    output: reviewResponseSchema,
  })
  async update(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('reviewId') reviewId: string,
    @Input('content') content: string
  ) {
    return await this.microserviceClient.send('bookstoreReview.update', {
      reviewerId: ctx.user.sub,
      reviewId,
      content,
    });
  }

  /**
   * 리뷰 삭제
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: deleteReviewInputSchema,
    output: z.object({ success: z.boolean() }),
  })
  async delete(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('reviewId') reviewId: string
  ) {
    return await this.microserviceClient.send('bookstoreReview.delete', {
      reviewerId: ctx.user.sub,
      reviewId,
    });
  }

  /**
   * 서점 리뷰 목록 조회 (비로그인 허용)
   */
  @UseMiddlewares(OptionalUserAuthMiddleware)
  @Query({
    input: getByBookstoreInputSchema,
    output: z.object({
      reviews: z.array(reviewResponseSchema),
      total: z.number(),
    }),
  })
  async getByBookstore(
    @Ctx() _ctx: OptionalUserContext,
    @Input('bookstoreId') bookstoreId: string,
    @Input('page') page: number,
    @Input('limit') limit: number
  ) {
    return await this.microserviceClient.send(
      'bookstoreReview.getByBookstore',
      {
        bookstoreId,
        page,
        limit,
      }
    );
  }
}
