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
} from '../user/user.auth.middleware';

@Router({ alias: 'follow' })
export class FollowRouter extends BaseTrpcRouter {
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      followeeId: z.string().uuid(),
    }),
    output: z.object({
      id: z.string(),
      followerId: z.string(),
      followeeId: z.string(),
      createdAt: z.date(),
    }),
  })
  async follow(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('followeeId') followeeId: string
  ) {
    return await this.microserviceClient.send('follow.follow', {
      followerId: ctx.user.sub,
      followeeId,
    });
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: z.object({
      followeeId: z.string().uuid(),
    }),
    output: z.boolean(),
  })
  async unfollow(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('followeeId') followeeId: string
  ) {
    await this.microserviceClient.send('follow.unfollow', {
      followerId: ctx.user.sub,
      followeeId,
    });
    return true;
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: z.object({
      followeeId: z.string().uuid(),
    }),
    output: z.boolean(),
  })
  async isFollowing(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('followeeId') followeeId: string
  ) {
    return await this.microserviceClient.send('follow.isFollowing', {
      followerId: ctx.user.sub,
      followeeId,
    });
  }

  @Query({
    input: z.object({
      userId: z.string().uuid(),
    }),
    output: z.number(),
  })
  async getFollowerCount(@Input('userId') userId: string) {
    return await this.microserviceClient.send('follow.getFollowerCount', {
      userId,
    });
  }

  @Query({
    input: z.object({
      userId: z.string().uuid(),
    }),
    output: z.number(),
  })
  async getFollowingCount(@Input('userId') userId: string) {
    return await this.microserviceClient.send('follow.getFollowingCount', {
      userId,
    });
  }
}
