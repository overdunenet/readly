import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigProvider } from '@src/config';
import { TransactionService } from '../shared/transaction/transaction.service';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { PaymentService } from './payment.service';
import { NicepayCallbackDto } from './nicepay/nicepay-client.interface';

@Controller('payment')
export class PaymentHttpController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService
  ) {}

  @Post('nicepay/confirm')
  @Transactional
  async nicepayConfirm(@Body() body: NicepayCallbackDto, @Res() res: Response) {
    const clientUrl = ConfigProvider.client.url;

    if (body.resultCode !== '0000') {
      return res.redirect(
        `${clientUrl}/editor/cash/charge-result?status=failed&message=${encodeURIComponent(body.resultMsg)}`
      );
    }

    return this.paymentService
      .confirmPayment(body.orderId, body.tid, parseInt(body.amount, 10))
      .then(() =>
        res.redirect(
          `${clientUrl}/editor/cash/charge-result?status=success&orderId=${body.orderId}`
        )
      )
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : '결제 처리 중 오류가 발생했습니다';
        return res.redirect(
          `${clientUrl}/editor/cash/charge-result?status=failed&message=${encodeURIComponent(message)}`
        );
      });
  }
}
