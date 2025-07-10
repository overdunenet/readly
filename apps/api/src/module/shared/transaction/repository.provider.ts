import { Injectable } from '@nestjs/common';
import { getUserRepository } from '@src/module/domain/user.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

  get UserRepository() {
    return getUserRepository(this.transaction);
  }
}
