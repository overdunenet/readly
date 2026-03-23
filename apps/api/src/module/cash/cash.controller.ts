import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { CashService } from './cash.service';
import { CashBalanceSyncService } from './cash-balance-sync.service';

@Controller()
export class CashController {
  constructor(
    private readonly cashService: CashService,
    private readonly cashBalanceSyncService: CashBalanceSyncService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('cash.getBalance')
  async getBalance(@Payload() data: { userId: string }) {
    const balance = await this.cashService.getBalance(data.userId);
    return { amount: balance?.amount ?? 0 };
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

  @MessagePattern('cash.syncBalances')
  @Transactional
  async syncBalances() {
    return this.cashBalanceSyncService.syncBalances();
  }
}
