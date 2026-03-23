import { BadRequestException, Injectable } from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { NicepayClientService } from './nicepay/nicepay-client.service';
import { CashService } from '../cash/cash.service';
import { PaymentEntity, PaymentStatus } from '../domain/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly nicepayClientService: NicepayClientService,
    private readonly cashService: CashService
  ) {}

  async createPendingPayment(
    userId: string,
    amount: number
  ): Promise<{ orderId: string; amount: number }> {
    const payment = PaymentEntity.create(userId, amount);
    const saved = await this.repositoryProvider.PaymentRepository.save(payment);
    return { orderId: saved.id, amount: saved.amount };
  }

  async confirmPayment(
    orderId: string,
    tid: string,
    amount: number
  ): Promise<PaymentEntity> {
    const payment =
      await this.repositoryProvider.PaymentRepository.findOneByOrFail({
        id: orderId,
      }).catch(() => {
        throw new BadRequestException('결제 정보를 찾을 수 없습니다');
      });

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('이미 처리된 결제입니다');
    }

    if (payment.amount !== amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다');
    }

    const confirmResult = await this.nicepayClientService.confirmPayment(
      tid,
      amount
    );

    if (!confirmResult) {
      payment.status = PaymentStatus.FAILED;
      payment.failReason = 'PG 결제 승인 실패';
      await this.repositoryProvider.PaymentRepository.save(payment);
      throw new BadRequestException('결제 승인에 실패했습니다');
    }

    payment.status = PaymentStatus.PAID;
    payment.pgTid = tid;
    payment.paidAt = new Date();
    payment.method = confirmResult.payMethod;

    const cash = await this.cashService.charge(payment.userId, amount);
    payment.cashId = cash.id;

    return this.repositoryProvider.PaymentRepository.save(payment);
  }
}
