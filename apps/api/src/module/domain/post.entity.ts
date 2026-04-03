import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { BookstoreEntity } from './bookstore.entity';
import { PostVersionEntity } from './post-version.entity';
import { AgeRating } from './enums';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export type PostAccessLevel = 'public' | 'subscriber' | 'purchaser' | 'private';
export type PostStatus = 'draft' | 'published' | 'scheduled';

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
} as const;

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    default: 'public',
    comment: '포스트 접근 권한 레벨 (공개/구독자/구매자/비공개)',
  })
  accessLevel: PostAccessLevel;

  @Column({
    type: 'varchar',
    default: 'draft',
    comment: '포스트 상태 (임시저장/발행됨/예약발행)',
  })
  status: PostStatus;

  @Column({
    type: 'int',
    default: 0,
    comment: '포스트 가격 (유료 포스트인 경우)',
  })
  price: number;

  @Column({
    type: 'varchar',
    default: AgeRating.ALL,
    comment: '연령 등급 (전체/성인)',
  })
  ageRating: AgeRating;

  @Column({ type: 'timestamptz', nullable: true, comment: '포스트 발행 일시' })
  publishedAt: Date | null;

  @Column({ type: 'uuid', comment: '작성자 사용자 ID' })
  authorId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ type: 'uuid', nullable: true, comment: '서점 ID' })
  bookstoreId: string | null;

  @ManyToOne(() => BookstoreEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookstoreEntity;

  @Column({
    name: 'published_version_id',
    type: 'uuid',
    nullable: true,
    comment: '발행된 버전 ID',
  })
  publishedVersionId: string | null;

  @OneToOne(() => PostVersionEntity)
  @JoinColumn({ name: 'published_version_id' })
  publishedVersion: PostVersionEntity | null;

  @OneToMany(() => PostVersionEntity, version => version.post)
  versions: PostVersionEntity[];

  @Column({
    type: 'integer',
    nullable: true,
    comment: '서점 내 정렬 순서',
  })
  sortOrder: number | null;

  @DeleteDateColumn()
  deletedAt: Date;

  // DDD 패턴 - Static Factory Method
  static create(input: {
    authorId: string;
    bookstoreId?: string;
    accessLevel?: PostAccessLevel;
    price?: number;
    ageRating?: AgeRating;
  }): PostEntity {
    const post = new PostEntity();
    post.status = POST_STATUS.DRAFT;
    post.authorId = input.authorId;
    post.bookstoreId = input.bookstoreId ?? null;
    post.publishedVersionId = null;

    // edit 메서드를 활용하여 메타데이터 설정
    post.edit({
      accessLevel: input.accessLevel,
      price: input.price,
      ageRating: input.ageRating,
    });

    return post;
  }

  // 포스트 메타데이터 수정
  edit(input: {
    accessLevel?: PostAccessLevel;
    price?: number;
    ageRating?: AgeRating;
  }): void {
    if (input.accessLevel !== undefined) {
      this.accessLevel = input.accessLevel || 'public';
    }
    if (input.price !== undefined) {
      this.price = input.price || 0;
    }
    if (input.ageRating !== undefined) {
      this.ageRating = input.ageRating || AgeRating.ALL;
    }
  }

  // 유료 본문 접근 권한 검증
  canAccessPaidContent(userId: string | null): boolean {
    // 작성자는 항상 접근 가능
    if (userId && userId === this.authorId) {
      return true;
    }

    // 발행되지 않은 포스트는 작성자만 접근 가능
    if (this.status !== POST_STATUS.PUBLISHED) {
      return false;
    }

    // 공개 포스트는 누구나 유료 본문 접근 가능
    if (this.accessLevel === 'public') {
      return true;
    }

    // 비공개 포스트는 작성자만 접근 가능
    if (this.accessLevel === 'private') {
      return false;
    }

    // 구독자 전용, 구매자 전용은 추후 구현
    // TODO: 구독/구매 로직 구현 후 업데이트
    return false;
  }

  // 포스트 발행 (최초 발행 및 재발행)
  publish(latestVersionId: string): void {
    this.publishedVersionId = latestVersionId;
    this.status = POST_STATUS.PUBLISHED;
    this.publishedAt = this.publishedAt ?? new Date();
  }

  // 포스트 임시저장으로 변경
  unpublish(): void {
    if (this.status === POST_STATUS.DRAFT) {
      throw new Error('Post is already draft');
    }
    this.publishedVersionId = null;
    this.status = POST_STATUS.DRAFT;
    this.publishedAt = null;
  }

  // 수정/삭제 권한 검증
  canBeEditedBy(authorId: string): boolean {
    return this.authorId === authorId;
  }

  // 읽기 권한 검증
  canBeReadBy(user: UserEntity | null): boolean {
    // 작성자는 항상 접근 가능 (발행 상태 무관)
    if (user && user.id === this.authorId) {
      return true;
    }

    // 발행되지 않은 포스트는 작성자만 접근 가능
    if (this.status !== POST_STATUS.PUBLISHED) {
      return false;
    }

    // 비공개 포스트는 작성자만 접근 가능
    if (this.accessLevel === 'private') {
      return false;
    }

    // 공개 포스트는 누구나 접근 가능
    if (this.accessLevel === 'public') {
      return true;
    }

    // subscriber/purchaser: freeContent는 모든 사용자(비로그인 포함)에게 공개
    // paidContent 접근은 canAccessPaidContent()로 별도 제어
    // TODO: 구독/구매 검증 추가 시 비로그인(user === null)은 freeContent만 허용해야 함
    return true;
  }
}

export const getPostRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PostEntity)
    .extend({
      async createPost(input: {
        authorId: string;
        bookstoreId?: string;
        accessLevel?: PostAccessLevel;
        price?: number;
        ageRating?: AgeRating;
      }): Promise<PostEntity> {
        const post = PostEntity.create(input);
        return this.save(post);
      },

      async findByAuthor(authorId: string): Promise<PostEntity[]> {
        return this.findBy({ authorId });
      },

      async findPublished(): Promise<PostEntity[]> {
        return this.findBy({ status: POST_STATUS.PUBLISHED });
      },

      async findOneByIdForEdit(
        postId: string,
        authorId: string
      ): Promise<PostEntity> {
        const post = await this.findOneByOrFail({ id: postId });

        if (!post.canBeEditedBy(authorId)) {
          throw new Error('You are not allowed to edit this post');
        }

        return post;
      },

      async findOneByIdForRead(
        postId: string,
        userId?: string
      ): Promise<PostEntity> {
        const post = await this.findOneOrFail({
          where: { id: postId },
          relations: ['author'],
        });

        // TODO: 추후 쿼리 속도 등 개선 필요
        const user = userId
          ? await getEntityManager(source)
              .getRepository(UserEntity)
              .findOneBy({ id: userId })
          : null;

        if (!post.canBeReadBy(user as any)) {
          throw new Error('You are not allowed to read this post');
        }

        return post;
      },
    });
