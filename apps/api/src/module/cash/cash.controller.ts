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
    return this.cashService.charge(data.userId, data.amount);
  }

  @MessagePattern('cash.getHistory')
  async getHistory(
    @Payload() data: { userId: string; cursor?: string; limit: number }
  ) {
    return this.cashService.getHistory(data.userId, data.cursor, data.limit);
  }
}
