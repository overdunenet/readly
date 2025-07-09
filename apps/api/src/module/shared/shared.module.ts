import { Global, Module } from '@nestjs/common';
import { RequestModule } from '@src/module/shared/request/request.module';
import { TransactionModule } from '@src/module/shared/transaction/transaction.module';

@Global()
@Module({
  imports: [RequestModule, TransactionModule],
  exports: [RequestModule, TransactionModule],
})
export class SharedModule {}
