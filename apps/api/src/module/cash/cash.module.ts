import { Module } from '@nestjs/common';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { CashBalanceSyncService } from './cash-balance-sync.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
  ],
  controllers: [CashController],
  providers: [CashService, CashBalanceSyncService],
  exports: [CashService],
})
export class CashModule {}
