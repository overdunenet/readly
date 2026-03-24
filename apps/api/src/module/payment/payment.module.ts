import { Module } from '@nestjs/common';
import { NicepayClientModule } from './nicepay/nicepay-client.module';
import { CashModule } from '../cash/cash.module';
import { SharedModule } from '../shared/shared.module';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentHttpController } from './payment.http.controller';

@Module({
  imports: [SharedModule, NicepayClientModule, CashModule],
  controllers: [PaymentHttpController, PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
