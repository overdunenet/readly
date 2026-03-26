import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { PublishDefaultEntity } from './publish-default.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('bookstores')
export class BookstoreEntity extends BaseEntity {
  @Column({ type: 'uuid', unique: true, comment: '서점 소유자 사용자 ID' })
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 30, comment: '필명' })
  penName: string;

  @Column({ type: 'varchar', length: 50, comment: '서점 이름' })
  storeName: string;

  @Column({ type: 'text', nullable: true, comment: '서점 소개' })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true, comment: '프로필 이미지 URL' })
  profileImage: string | null;

  @Column({ type: 'varchar', nullable: true, comment: '커버 이미지 URL' })
  coverImage: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ko',
    comment: '서점 언어 코드',
  })
  language: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: '서점 활성화 여부',
  })
  isActive: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: '이용약관 동의 일시',
  })
  termsAgreedAt: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: '서점 오픈 일시',
  })
  openedAt: Date | null;

  @Column(() => PublishDefaultEntity, { prefix: 'publish_default' })
  publishDefault: PublishDefaultEntity;

  @DeleteDateColumn()
  deletedAt: Date;

  // DDD 패턴 - Static Factory Method
  static create(input: {
    userId: string;
    penName: string;
    storeName: string;
    language: string;
    termsAgreedAt?: Date;
  }): BookstoreEntity {
    const bookstore = new BookstoreEntity();
    bookstore.userId = input.userId;
    bookstore.penName = input.penName;
    bookstore.storeName = input.storeName;
    bookstore.language = input.language;
    bookstore.termsAgreedAt = input.termsAgreedAt ?? null;
    return bookstore;
  }
}

export const getBookstoreRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BookstoreEntity);
