import { Column, Entity, ManyToOne, JoinColumn, DeleteDateColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { UserEntity } from './user.entity';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export type PostAccessLevel = 'public' | 'subscriber' | 'purchaser' | 'private';
export type PostStatus = 'draft' | 'published' | 'scheduled';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column({ type: 'varchar', comment: '포스트 제목' })
  title: string;

  @Column({ type: 'text', comment: '포스트 본문 내용' })
  content: string;

  @Column({ type: 'text', nullable: true, comment: '포스트 요약/미리보기 텍스트' })
  excerpt: string | null;

  @Column({ type: 'varchar', nullable: true, comment: '포스트 썸네일 이미지 URL' })
  thumbnail: string | null;

  @Column({
    type: 'enum',
    enum: ['public', 'subscriber', 'purchaser', 'private'],
    default: 'public',
    comment: '포스트 접근 권한 레벨 (공개/구독자/구매자/비공개)',
  })
  accessLevel: PostAccessLevel;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
    comment: '포스트 상태 (임시저장/발행됨/예약발행)',
  })
  status: PostStatus;

  @Column({ type: 'int', default: 0, comment: '포스트 가격 (유료 포스트인 경우)' })
  price: number;

  @Column({ type: 'timestamptz', nullable: true, comment: '포스트 발행 일시' })
  publishedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, comment: '예약 발행 예정 일시' })
  scheduledAt: Date | null;

  @Column({ type: 'uuid', comment: '작성자 사용자 ID' })
  authorId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @DeleteDateColumn()
  deletedAt: Date;

  // DDD 패턴 - Static Factory Method
  static create(input: {
    title: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    accessLevel?: PostAccessLevel;
    price?: number;
    authorId: string;
  }): PostEntity {
    const post = new PostEntity();
    post.title = input.title;
    post.content = input.content;
    post.excerpt = input.excerpt || null;
    post.thumbnail = input.thumbnail || null;
    post.accessLevel = input.accessLevel || 'public';
    post.status = 'draft';
    post.price = input.price || 0;
    post.authorId = input.authorId;
    return post;
  }

  // 포스트 즉시 발행
  publish(): void {
    if (this.status === 'published') {
      throw new Error('Post is already published');
    }
    this.status = 'published';
    this.publishedAt = new Date();
    this.scheduledAt = null;
  }

  // 포스트 예약 발행
  schedulePublish(scheduledAt: Date): void {
    if (this.status === 'published') {
      throw new Error('Cannot schedule published post');
    }
    
    const now = new Date();
    if (scheduledAt <= now) {
      throw new Error('Scheduled time must be in the future');
    }

    this.status = 'scheduled';
    this.scheduledAt = scheduledAt;
    this.publishedAt = null;
  }

  // 예약 발행 취소
  cancelSchedule(): void {
    if (this.status !== 'scheduled') {
      throw new Error('Post is not scheduled');
    }
    this.status = 'draft';
    this.scheduledAt = null;
  }

  // 예약된 포스트를 발행 (스케줄러에서 호출)
  publishScheduled(): void {
    if (this.status !== 'scheduled') {
      throw new Error('Post is not scheduled');
    }
    this.status = 'published';
    this.publishedAt = new Date();
  }

  // 포스트 임시저장으로 변경
  unpublish(): void {
    if (this.status === 'draft') {
      throw new Error('Post is already draft');
    }
    this.status = 'draft';
    this.publishedAt = null;
    this.scheduledAt = null;
  }

  // 예약 발행 시간 체크
  isScheduledForPublishing(): boolean {
    if (this.status !== 'scheduled' || !this.scheduledAt) {
      return false;
    }
    return new Date() >= this.scheduledAt;
  }

  // 접근 권한 검증
  canBeAccessedBy(user: UserEntity | null): boolean {
    // 작성자는 항상 접근 가능
    if (user && user.id === this.authorId) {
      return true;
    }

    // 비공개 포스트는 작성자만 접근 가능
    if (this.accessLevel === 'private') {
      return false;
    }

    // 공개 포스트는 누구나 접근 가능
    if (this.accessLevel === 'public') {
      return true;
    }

    // 구독자 전용, 구매자 전용은 추후 구현
    // TODO: 구독/구매 로직 구현 후 업데이트
    return false;
  }
}

export const getPostRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PostEntity)
    .extend({
      async createPost(input: {
        title: string;
        content: string;
        excerpt?: string;
        thumbnail?: string;
        accessLevel?: PostAccessLevel;
        price?: number;
        authorId: string;
      }): Promise<PostEntity> {
        const post = PostEntity.create(input);
        return this.save(post);
      },

      async findByAuthor(authorId: string): Promise<PostEntity[]> {
        return this.findBy({ authorId });
      },

      async findPublished(): Promise<PostEntity[]> {
        return this.findBy({ status: 'published' });
      },

      async findAccessiblePosts(userId?: string): Promise<PostEntity[]> {
        const qb = this.createQueryBuilder('post')
          .leftJoinAndSelect('post.author', 'author')
          .where('post.status = :status', { status: 'published' });

        if (userId) {
          qb.andWhere(
            '(post.accessLevel = :public OR post.authorId = :userId)',
            { public: 'public', userId }
          );
        } else {
          qb.andWhere('post.accessLevel = :public', { public: 'public' });
        }

        return qb.orderBy('post.publishedAt', 'DESC').getMany();
      },
    });