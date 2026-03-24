import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { BookstoreService, OpenBookstoreInput } from './bookstore.service';
import { BookstoreEntity } from '../domain/bookstore.entity';

@Controller()
export class BookstoreController {
  constructor(
    private readonly bookstoreService: BookstoreService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('bookstore.open')
  @Transactional
  async open(
    @Payload() data: { userId: string; input: OpenBookstoreInput }
  ): Promise<BookstoreEntity> {
    return this.bookstoreService.open(data.userId, data.input);
  }

  @MessagePattern('bookstore.hasBookstore')
  async hasBookstore(@Payload() data: { userId: string }): Promise<boolean> {
    return this.bookstoreService.hasBookstore(data.userId);
  }

  @MessagePattern('bookstore.getMyBookstore')
  async getMyBookstore(
    @Payload() data: { userId: string }
  ): Promise<BookstoreEntity> {
    return this.bookstoreService.getMyBookstore(data.userId);
  }
}
