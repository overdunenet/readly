import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigProvider } from '@src/config';
import { NicepayConfirmResponse } from './nicepay-client.interface';

@Injectable()
export class NicepayClientService {
  constructor(private readonly httpService: HttpService) {}

  private generateAccessToken(): string {
    const credentials = `${ConfigProvider.payment.nicepay.clientKey}:${ConfigProvider.payment.nicepay.secret}`;
    return Buffer.from(credentials, 'utf8').toString('base64');
  }

  // 결제 승인 요청
  confirmPayment(
    tid: string,
    amount: number
  ): Promise<NicepayConfirmResponse | null> {
    const accessToken = this.generateAccessToken();
    return lastValueFrom(
      this.httpService.post(
        `${ConfigProvider.payment.nicepay.url}/v1/payments/${tid}`,
        { amount },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { headers: { Authorization: `Basic ${accessToken}` } }
      )
    )
      .then(response => {
        const data = response.data as NicepayConfirmResponse;
        if (data.resultCode !== '0000') return null;
        return data;
      })
      .catch(
        (err: unknown) =>
          ((err as Record<string, Record<string, unknown>>)?.response
            ?.data as NicepayConfirmResponse) ?? null
      );
  }

  // 결제 정보 조회 (이미 승인된 건 확인)
  checkPaymentInfo(tid: string): Promise<NicepayConfirmResponse | null> {
    const accessToken = this.generateAccessToken();
    return lastValueFrom(
      this.httpService.get(
        `${ConfigProvider.payment.nicepay.url}/v1/payments/${tid}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { headers: { Authorization: `Basic ${accessToken}` } }
      )
    )
      .then(response => {
        const data = response.data as NicepayConfirmResponse;
        if (data.resultCode !== '0000') return null;
        return data;
      })
      .catch(
        (err: unknown) =>
          ((err as Record<string, Record<string, unknown>>)?.response
            ?.data as NicepayConfirmResponse) ?? null
      );
  }
}
