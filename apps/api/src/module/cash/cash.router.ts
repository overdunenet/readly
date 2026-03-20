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
  chargeInputSchema,
  chargeOutputSchema,
  getBalanceOutputSchema,
  getHistoryInputSchema,
  getHistoryOutputSchema,
} from './cash.schema';

@Router({ alias: 'cash' })
export class CashRouter extends BaseTrpcRouter {
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: getBalanceOutputSchema,
  })
  async getBalance(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('cash.getBalance', {
      userId: ctx.user.sub,
    });
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: chargeInputSchema,
    output: chargeOutputSchema,
  })
  async charge(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('amount') amount: number
  ) {
    return await this.microserviceClient.send('cash.charge', {
      userId: ctx.user.sub,
      amount,
    });
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    input: getHistoryInputSchema,
    output: getHistoryOutputSchema,
  })
  async getHistory(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('cursor') cursor: string | undefined,
    @Input('limit') limit: number
  ) {
    return await this.microserviceClient.send('cash.getHistory', {
      userId: ctx.user.sub,
      cursor,
      limit,
    });
  }
}
