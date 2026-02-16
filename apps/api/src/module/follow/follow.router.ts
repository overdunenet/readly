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
import {
  followInputSchema,
  followOutputSchema,
  userIdInputSchema,
} from './follow.schema';

@Router({ alias: 'follow' })
export class FollowRouter extends BaseTrpcRouter {
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: followInputSchema,
    output: followOutputSchema,
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
    input: followInputSchema,
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
    input: followInputSchema,
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
    input: userIdInputSchema,
    output: z.number(),
  })
  async getFollowerCount(@Input('userId') userId: string) {
    return await this.microserviceClient.send('follow.getFollowerCount', {
      userId,
    });
  }

  @Query({
    input: userIdInputSchema,
    output: z.number(),
  })
  async getFollowingCount(@Input('userId') userId: string) {
    return await this.microserviceClient.send('follow.getFollowingCount', {
      userId,
    });
  }
}
