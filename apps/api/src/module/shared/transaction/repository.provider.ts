import { Injectable } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

}
