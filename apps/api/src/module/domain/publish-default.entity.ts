import { Column, Entity, OneToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { BookstoreEntity } from './bookstore.entity';
import { PublishAccessLevel, AgeRating } from './enums';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('publish_defaults')
export class PublishDefaultEntity extends BaseEntity {
  @Column({ type: 'uuid', unique: true, comment: '서점 ID' })
  bookstoreId: string;

  @OneToOne(() => BookstoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({
    type: 'varchar',
    default: PublishAccessLevel.PUBLIC,
    comment: '기본 접근 레벨',
  })
  defaultAccessLevel: PublishAccessLevel;

  @Column({
    type: 'int',
    default: 0,
    comment: '기본 가격',
  })
  defaultPrice: number;

  @Column({
    type: 'varchar',
    default: AgeRating.ALL,
    comment: '기본 연령 등급',
  })
  defaultAgeRating: AgeRating;

  // DDD 패턴 - Static Factory Method
  static create(input: {
    bookstoreId: string;
    defaultAccessLevel?: PublishAccessLevel;
    defaultPrice?: number;
    defaultAgeRating?: AgeRating;
  }): PublishDefaultEntity {
    const entity = new PublishDefaultEntity();
    entity.bookstoreId = input.bookstoreId;
    entity.defaultAccessLevel =
      input.defaultAccessLevel ?? PublishAccessLevel.PUBLIC;
    entity.defaultPrice = input.defaultPrice ?? 0;
    entity.defaultAgeRating = input.defaultAgeRating ?? AgeRating.ALL;
    return entity;
  }
}

export const getPublishDefaultRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(PublishDefaultEntity);
