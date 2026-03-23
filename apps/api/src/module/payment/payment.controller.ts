import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('payment.initiateCharge')
  async initiateCharge(@Payload() data: { userId: string; amount: number }) {
    return this.paymentService.createPendingPayment(data.userId, data.amount);
  }

  @MessagePattern('payment.confirmCharge')
  @Transactional
  async confirmCharge(
    @Payload() data: { orderId: string; tid: string; amount: number }
  ) {
    return this.paymentService.confirmPayment(
      data.orderId,
      data.tid,
      data.amount
    );
  }
}
