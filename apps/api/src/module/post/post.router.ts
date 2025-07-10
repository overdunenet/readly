import { z } from 'zod';
import { Input, Query, Router, Mutation, UseMiddlewares, Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import { TRPCError } from '@trpc/server';
import { UserAuthMiddleware, UserAuthorizedContext } from '../user/user.auth.middleware';

const postAccessLevelSchema = z.enum(['public', 'subscriber', 'purchaser', 'private']);

const createPostInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  accessLevel: postAccessLevelSchema.optional(),
  price: z.number().int().min(0).optional(),
});

const updatePostInputSchema = createPostInputSchema.partial();

const schedulePostInputSchema = z.object({
  scheduledAt: z.date(),
});

const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  thumbnail: z.string().nullable(),
  accessLevel: postAccessLevelSchema,
  status: z.enum(['draft', 'published', 'scheduled']),
  price: z.number(),
  publishedAt: z.date().nullable(),
  scheduledAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.object({
    id: z.string(),
    nickname: z.string(),
    profileImage: z.string().nullable(),
  }),
});

@Router({ alias: 'post' })
export class PostRouter extends BaseTrpcRouter {
  /**
   * 포스트 작성
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: createPostInputSchema,
    output: postResponseSchema,
  })
  async create(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof createPostInputSchema>,
  ) {
    try {
      const result = await this.microserviceClient.send('post.create', {
        authorId: ctx.user.sub,
        input,
      });
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to create post',
      });
    }
  }

  /**
   * 포스트 수정
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
      data: updatePostInputSchema,
    }),
    output: postResponseSchema,
  })
  async update(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
    @Input('data') data: z.infer<typeof updatePostInputSchema>,
  ) {
    try {
      const result = await this.microserviceClient.send('post.update', {
        postId,
        authorId: ctx.user.sub,
        input: data,
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to update post',
      });
    }
  }

  /**
   * 포스트 발행
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
    }),
    output: postResponseSchema,
  })
  async publish(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
  ) {
    try {
      const result = await this.microserviceClient.send('post.publish', {
        postId,
        authorId: ctx.user.sub,
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to publish post',
      });
    }
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
    @Input('postId') postId: string,
  ) {
    try {
      const result = await this.microserviceClient.send('post.unpublish', {
        postId,
        authorId: ctx.user.sub,
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to unpublish post',
      });
    }
  }

  /**
   * 포스트 예약 발행
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
      scheduledAt: z.string().datetime(),
    }),
    output: postResponseSchema,
  })
  async schedule(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
    @Input('scheduledAt') scheduledAt: string,
  ) {
    try {
      const result = await this.microserviceClient.send('post.schedule', {
        postId,
        authorId: ctx.user.sub,
        input: {
          scheduledAt: new Date(scheduledAt),
        },
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      if (error.message?.includes('must be in the future')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Scheduled time must be in the future',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to schedule post',
      });
    }
  }

  /**
   * 포스트 예약 발행 취소
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      postId: z.string(),
    }),
    output: postResponseSchema,
  })
  async cancelSchedule(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('postId') postId: string,
  ) {
    try {
      const result = await this.microserviceClient.send('post.cancelSchedule', {
        postId,
        authorId: ctx.user.sub,
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      if (error.message?.includes('not scheduled')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post is not scheduled',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to cancel schedule',
      });
    }
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
    @Input('postId') postId: string,
  ) {
    try {
      await this.microserviceClient.send('post.delete', {
        postId,
        authorId: ctx.user.sub,
      });
      return true;
    } catch (error) {
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to delete post',
      });
    }
  }

  /**
   * 포스트 단일 조회
   */
  @Query({
    input: z.object({
      postId: z.string(),
    }),
    output: postResponseSchema,
  })
  async getOne(
    @Ctx() ctx: any,
    @Input('postId') postId: string,
  ) {
    try {
      const userId = ctx.user?.sub;
      const result = await this.microserviceClient.send('post.getOne', {
        postId,
        userId,
      });
      return result;
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }
      if (error.message?.includes('not allowed')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this post',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get post',
      });
    }
  }

  /**
   * 내 포스트 목록 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: z.array(postResponseSchema),
  })
  async getMy(@Ctx() ctx: UserAuthorizedContext) {
    try {
      const result = await this.microserviceClient.send('post.getMy', {
        authorId: ctx.user.sub,
      });
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get posts',
      });
    }
  }

  /**
   * 접근 가능한 포스트 목록 조회
   */
  @Query({
    output: z.array(postResponseSchema),
  })
  async getAccessible(@Ctx() ctx: any) {
    try {
      const userId = ctx.user?.sub;
      const result = await this.microserviceClient.send('post.getAccessible', {
        userId,
      });
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get posts',
      });
    }
  }

}