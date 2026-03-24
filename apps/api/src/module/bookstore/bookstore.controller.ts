import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import {
  BookstoreService,
  OpenBookstoreInput,
  UpdateProfileInput,
  GetPostsOptions,
} from './bookstore.service';
import { BookstoreEntity } from '../domain/bookstore.entity';
import { PostEntity } from '../domain/post.entity';

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

  @MessagePattern('bookstore.updateProfile')
  @Transactional
  async updateProfile(
    @Payload() data: { userId: string; input: UpdateProfileInput }
  ): Promise<BookstoreEntity> {
    return this.bookstoreService.updateProfile(data.userId, data.input);
  }

  @MessagePattern('bookstore.getById')
  async getById(
    @Payload() data: { bookstoreId: string }
  ): Promise<BookstoreEntity> {
    return this.bookstoreService.getById(data.bookstoreId);
  }

  @MessagePattern('bookstore.getPosts')
  async getPosts(
    @Payload() data: { bookstoreId: string; options: GetPostsOptions }
  ): Promise<{ posts: PostEntity[]; total: number }> {
    return this.bookstoreService.getPosts(data.bookstoreId, data.options);
  }

  @MessagePattern('bookstore.getMyWorks')
  async getMyWorks(
    @Payload() data: { userId: string; status?: string }
  ): Promise<PostEntity[]> {
    return this.bookstoreService.getMyWorks(data.userId, data.status);
  }
}
