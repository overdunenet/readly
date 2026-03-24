import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  EntityManager,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { BookstoreEntity } from './bookstore.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('bookstore_reviews')
@Unique('uq_bookstore_reviews_bookstore_reviewer', [
  'bookstoreId',
  'reviewerId',
])
export class BookstoreReviewEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '서점 ID' })
  bookstoreId: string;

  @ManyToOne(() => BookstoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({ type: 'uuid', comment: '리뷰 작성자 ID' })
  reviewerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ type: 'text', comment: '리뷰 내용' })
  content: string;

  @DeleteDateColumn()
  deletedAt: Date;

  // DDD 패턴 - Static Factory Method
  static create(input: {
    bookstoreId: string;
    reviewerId: string;
    content: string;
  }): BookstoreReviewEntity {
    const entity = new BookstoreReviewEntity();
    entity.bookstoreId = input.bookstoreId;
    entity.reviewerId = input.reviewerId;
    entity.content = input.content;
    return entity;
  }

  // 본인 리뷰인지 확인
  isOwnedBy(userId: string): boolean {
    return this.reviewerId === userId;
  }
}

export const getBookstoreReviewRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BookstoreReviewEntity);
