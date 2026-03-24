import { Module } from '@nestjs/common';
import { BookstoreService } from './bookstore.service';
import { BookstoreController } from './bookstore.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
  ],
  controllers: [BookstoreController],
  providers: [BookstoreService],
  exports: [BookstoreService],
})
export class BookstoreModule {}
