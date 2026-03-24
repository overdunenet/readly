import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigProvider } from '@src/config';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';

interface NicepayCallbackBody {
  authResultCode: string;
  authResultMsg: string;
  tid: string;
  clientId: string;
  orderId: string;
  amount: string;
  authToken: string;
  signature: string;
}

@Controller('payment')
export class NicepayCallbackController {
  private readonly logger = new Logger(NicepayCallbackController.name);

  constructor(private readonly microserviceClient: MicroserviceClient) {}

  @Post('nicepay/confirm')
  async nicepayConfirm(
    @Body() body: NicepayCallbackBody,
    @Res() res: Response
  ) {
    const clientUrl = ConfigProvider.client.url;

    if (body.authResultCode !== '0000') {
      this.logger.warn(
        `NicePay 콜백 실패: ${body.authResultCode} - ${body.authResultMsg}`
      );
      return res.redirect(
        `${clientUrl}/editor/cash/charge-result?status=failed&message=${encodeURIComponent(body.authResultMsg)}`
      );
    }

    return this.microserviceClient
      .send('payment.confirmCharge', {
        orderId: body.orderId,
        tid: body.tid,
        amount: parseInt(body.amount, 10),
      })
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
        this.logger.error(
          `NicePay 승인 실패 (orderId: ${body.orderId}): ${message}`
        );
        return res.redirect(
          `${clientUrl}/editor/cash/charge-result?status=failed&message=${encodeURIComponent(message)}`
        );
      });
  }
}
