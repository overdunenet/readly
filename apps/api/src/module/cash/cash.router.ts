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
  getBalanceOutputSchema,
  getHistoryInputSchema,
  getHistoryOutputSchema,
  initiateChargeInputSchema,
  initiateChargeOutputSchema,
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

  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: initiateChargeInputSchema,
    output: initiateChargeOutputSchema,
  })
  async initiateCharge(
    @Ctx() ctx: UserAuthorizedContext,
    @Input('amount') amount: number
  ) {
    return await this.microserviceClient.send('payment.initiateCharge', {
      userId: ctx.user.sub,
      amount,
    });
  }
}
