import { Column, Entity, ManyToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/shared/entity/base.entity';
import { PostEntity, PostAccessLevel, PostStatus } from './post.entity';
import { AgeRating } from './enums';
import { TransactionService } from '../shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

export interface FlattenedPost {
  id: string;
  title: string;
  freeContent: string;
  paidContent: string | null;
  excerpt: string | null;
  thumbnail: string | null;
  accessLevel: PostAccessLevel;
  status: PostStatus;
  price: number;
  ageRating: AgeRating;
  bookstoreId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

export type SaveType = 'auto' | 'manual';

export const SAVE_TYPE = {
  AUTO: 'auto' as const,
  MANUAL: 'manual' as const,
};

export interface CreateVersionInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string | null;
  thumbnail?: string | null;
}

export type EditContentInput = CreateVersionInput;

@Entity('post_versions')
export class PostVersionEntity extends BaseEntity {
  @Column({ type: 'uuid', comment: '포스트 ID' })
  postId: string;

  @Column({
    type: 'integer',
    default: 1,
    comment: '버전 번호',
  })
  versionNumber: number;

  @Column({ type: 'varchar', default: '', comment: '포스트 제목' })
  title: string;

  @Column({
    name: 'free_content',
    type: 'text',
    default: '',
    comment: '포스트 무료 본문 내용',
  })
  freeContent: string;

  @Column({
    name: 'paid_content',
    type: 'text',
    nullable: true,
    comment: '포스트 유료 본문 내용',
  })
  paidContent: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: '포스트 요약/미리보기 텍스트',
  })
  excerpt: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '포스트 썸네일 이미지 URL',
  })
  thumbnail: string | null;

  @Column({
    name: 'save_type',
    type: 'varchar',
    default: SAVE_TYPE.MANUAL,
    comment: '저장 유형 (auto: 자동저장 / manual: 수동저장)',
  })
  saveType: SaveType;

  @ManyToOne(() => PostEntity, post => post.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  // DDD 패턴 - Static Factory Methods

  static createInitial(
    postId: string,
    input: CreateVersionInput
  ): PostVersionEntity {
    const version = new PostVersionEntity();
    version.postId = postId;
    version.versionNumber = 1;
    version.saveType = SAVE_TYPE.MANUAL;
    version.title = input.title ?? '';
    version.freeContent = input.freeContent ?? '';
    version.paidContent = input.paidContent ?? null;
    version.excerpt = input.excerpt ?? null;
    version.thumbnail = input.thumbnail ?? null;
    return version;
  }

  static createNext(
    postId: string,
    versionNumber: number,
    saveType: SaveType,
    input: CreateVersionInput
  ): PostVersionEntity {
    const version = new PostVersionEntity();
    version.postId = postId;
    version.versionNumber = versionNumber;
    version.saveType = saveType;
    version.title = input.title ?? '';
    version.freeContent = input.freeContent ?? '';
    version.paidContent = input.paidContent ?? null;
    version.excerpt = input.excerpt ?? null;
    version.thumbnail = input.thumbnail ?? null;
    return version;
  }

  // 콘텐츠 수정 (undefined가 아닌 필드만 업데이트)
  editContent(input: EditContentInput): void {
    if (input.title !== undefined) {
      this.title = input.title;
    }
    if (input.freeContent !== undefined) {
      this.freeContent = input.freeContent;
    }
    if (input.paidContent !== undefined) {
      this.paidContent =
        input.paidContent === '' ? null : (input.paidContent ?? null);
    }
    if (input.excerpt !== undefined) {
      this.excerpt = input.excerpt || null;
    }
    if (input.thumbnail !== undefined) {
      this.thumbnail = input.thumbnail || null;
    }
  }

  // 자동저장 → 수동저장으로 승격
  promoteToManual(): void {
    this.saveType = SAVE_TYPE.MANUAL;
  }
}

export function flattenPostWithVersion(
  post: PostEntity,
  version: PostVersionEntity
): FlattenedPost {
  return {
    id: post.id,
    title: version.title,
    freeContent: version.freeContent,
    paidContent: version.paidContent,
    excerpt: version.excerpt,
    thumbnail: version.thumbnail,
    accessLevel: post.accessLevel,
    status: post.status,
    price: post.price,
    ageRating: post.ageRating,
    bookstoreId: post.bookstoreId,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    ...(post.author && {
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        profileImage: post.author.profileImage,
      },
    }),
  };
}

export const getPostVersionRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PostVersionEntity)
    .extend({
      async findLatestByPostId(
        postId: string
      ): Promise<PostVersionEntity | null> {
        return this.findOne({
          where: { postId },
          order: { versionNumber: 'DESC' },
        });
      },
    });
