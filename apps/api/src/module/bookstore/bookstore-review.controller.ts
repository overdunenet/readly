import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import { BookstoreReviewService } from './bookstore-review.service';
import { BookstoreReviewEntity } from '../domain/bookstore-review.entity';

@Controller()
export class BookstoreReviewController {
  constructor(
    private readonly bookstoreReviewService: BookstoreReviewService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('bookstoreReview.create')
  @Transactional
  async create(
    @Payload()
    data: {
      reviewerId: string;
      bookstoreId: string;
      content: string;
    }
  ): Promise<BookstoreReviewEntity> {
    return this.bookstoreReviewService.create(
      data.reviewerId,
      data.bookstoreId,
      data.content
    );
  }

  @MessagePattern('bookstoreReview.update')
  @Transactional
  async update(
    @Payload() data: { reviewerId: string; reviewId: string; content: string }
  ): Promise<BookstoreReviewEntity> {
    return this.bookstoreReviewService.update(
      data.reviewerId,
      data.reviewId,
      data.content
    );
  }

  @MessagePattern('bookstoreReview.delete')
  @Transactional
  async delete(
    @Payload() data: { reviewerId: string; reviewId: string }
  ): Promise<{ success: boolean }> {
    await this.bookstoreReviewService.delete(data.reviewerId, data.reviewId);
    return { success: true };
  }

  @MessagePattern('bookstoreReview.getByBookstore')
  async getByBookstore(
    @Payload()
    data: {
      bookstoreId: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ reviews: BookstoreReviewEntity[]; total: number }> {
    return this.bookstoreReviewService.getByBookstore(
      data.bookstoreId,
      data.page,
      data.limit
    );
  }
}
