import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { NicepayClientService } from './nicepay/nicepay-client.service';
import { CashService } from '../cash/cash.service';
import { PaymentEntity, PaymentStatus } from '../domain/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

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
    const payment = await this.repositoryProvider.PaymentRepository.findOne({
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!payment) {
      throw new BadRequestException('결제 정보를 찾을 수 없습니다');
    }

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

    if (Number(confirmResult.amount) !== payment.amount) {
      payment.status = PaymentStatus.FAILED;
      payment.failReason = `PG 승인 금액 불일치: expected=${payment.amount}, actual=${confirmResult.amount}`;
      await this.repositoryProvider.PaymentRepository.save(payment);
      throw new BadRequestException('결제 금액이 일치하지 않습니다');
    }

    payment.status = PaymentStatus.PAID;
    payment.pgTid = tid;
    payment.paidAt = new Date();
    payment.method = confirmResult.payMethod;

    const cash = await this.cashService
      .charge(payment.userId, amount)
      .catch(async (chargeError: unknown) => {
        this.logger.error(
          `Cash 충전 실패 (orderId: ${orderId}, tid: ${tid}). NicePay 승인은 완료되었으나 캐시 충전 실패`,
          chargeError instanceof Error ? chargeError.stack : String(chargeError)
        );
        payment.status = PaymentStatus.FAILED;
        payment.failReason = 'PG 승인 완료, 캐시 충전 실패 — 수동 확인 필요';
        await this.repositoryProvider.PaymentRepository.save(payment);
        throw new BadRequestException(
          '결제는 완료되었으나 캐시 충전 중 오류가 발생했습니다. 고객센터에 문의해주세요.'
        );
      });
    payment.cashId = cash.id;

    return this.repositoryProvider.PaymentRepository.save(payment);
  }
}
