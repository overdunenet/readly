import { Module } from '@nestjs/common';
import { BookstoreService } from './bookstore.service';
import { BookstoreController } from './bookstore.controller';
import { BookstoreReviewService } from './bookstore-review.service';
import { BookstoreReviewController } from './bookstore-review.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
  ],
  controllers: [BookstoreController, BookstoreReviewController],
  providers: [BookstoreService, BookstoreReviewService],
  exports: [BookstoreService, BookstoreReviewService],
})
export class BookstoreModule {}
