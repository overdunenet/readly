import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CashService } from './cash.service';

@Controller()
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @MessagePattern('cash.getBalance')
  async getBalance(@Payload() data: { userId: string }) {
    return this.cashService.getBalance(data.userId);
  }

  @MessagePattern('cash.charge')
  async charge(@Payload() data: { userId: string; amount: number }) {
    const result = await this.cashService.charge(data.userId, data.amount);
    return {
      cashBalance: result.cashBalance.amount,
      cash: {
        id: result.cash.id,
        initialAmount: result.cash.initialAmount,
        currentAmount: result.cash.currentAmount,
      },
      history: {
        id: result.history.id,
        type: result.history.type,
        amount: result.history.amount,
        balanceAfter: result.history.balanceAfter,
        description: result.history.description,
      },
    };
  }

  @MessagePattern('cash.getHistory')
  async getHistory(
    @Payload() data: { userId: string; cursor?: string; limit: number }
  ) {
    const result = await this.cashService.getHistory(
      data.userId,
      data.cursor,
      data.limit
    );
    return {
      items: result.items.map(item => ({
        id: item.id,
        cashId: item.cashId,
        type: item.type,
        amount: item.amount,
        balanceAfter: item.balanceAfter,
        description: item.description,
        createdAt: item.createdAt,
      })),
      nextCursor: result.nextCursor,
    };
  }
}
