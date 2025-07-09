import { REQUEST } from '@nestjs/core';
import { Global, Module, Scope } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

@Global()
@Module({
  providers: [
    {
      provide: TransactionService,
      useFactory: req => new TransactionService(),
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
    {
      provide: RepositoryProvider,
      useFactory: (transactionService: TransactionService, req) =>
        new RepositoryProvider(transactionService),
      inject: [TransactionService, REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  exports: [TransactionService, RepositoryProvider],
})
export class TransactionModule {}
