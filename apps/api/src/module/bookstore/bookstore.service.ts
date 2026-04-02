import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { stripHtml } from '../shared/utils/sanitize';
import { BookstoreEntity } from '../domain/bookstore.entity';
import { PostEntity, PostStatus, POST_STATUS } from '../domain/post.entity';
import { PostVersionEntity } from '../domain/post-version.entity';
import { PublishDefaultEntity } from '../domain/publish-default.entity';
import { PublishAccessLevel, AgeRating, Language } from '../domain/enums';

export interface CreateBookstoreInput {
  penName: string;
  storeName: string;
  termsAgreedAt?: Date;
}

export interface UpdateProfileInput {
  penName?: string;
  storeName?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
}

export interface GetPostsOptions {
  type?: 'single' | 'series';
  page?: number;
  limit?: number;
}

export interface UpdateSettingsInput {
  defaultAccessLevel?: PublishAccessLevel;
  defaultPrice?: number;
  defaultAgeRating?: AgeRating;
}

@Injectable()
export class BookstoreService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  private flattenPostWithVersion(post: PostEntity, version: PostVersionEntity) {
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

  private getBookstoreByUserId(userId: string): Promise<BookstoreEntity> {
    return this.repositoryProvider.BookstoreRepository.findOneByOrFail({
      userId,
    }).catch(() => {
      throw new NotFoundException('서점을 찾을 수 없습니다');
    });
  }

  async createBookstore(
    userId: string,
    input: CreateBookstoreInput
  ): Promise<BookstoreEntity> {
    const existing =
      await this.repositoryProvider.BookstoreRepository.findOneBy({ userId });

    if (existing) {
      throw new ConflictException('이미 서점을 보유하고 있습니다');
    }

    const user = await this.repositoryProvider.UserRepository.findOneByOrFail({
      id: userId,
    }).catch(() => {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    });

    if (user.language !== Language.KO) {
      throw new ForbiddenException(
        '현재 한국 유저만 서점을 오픈할 수 있습니다'
      );
    }

    const bookstore = BookstoreEntity.create({
      userId,
      penName: input.penName,
      storeName: input.storeName,
      language: user.language,
      termsAgreedAt: input.termsAgreedAt,
    });

    return this.repositoryProvider.BookstoreRepository.save(bookstore);
  }

  async hasBookstore(userId: string): Promise<boolean> {
    const count = await this.repositoryProvider.BookstoreRepository.countBy({
      userId,
    });
    return count > 0;
  }

  async getMyBookstore(userId: string): Promise<BookstoreEntity> {
    return this.getBookstoreByUserId(userId);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<BookstoreEntity> {
    const bookstore = await this.getBookstoreByUserId(userId);

    if (input.penName !== undefined) {
      bookstore.penName = input.penName;
    }
    if (input.storeName !== undefined) {
      bookstore.storeName = input.storeName;
    }
    if (input.bio !== undefined) {
      bookstore.bio = input.bio ? stripHtml(input.bio) : null;
    }
    if (input.profileImage !== undefined) {
      bookstore.profileImage = input.profileImage || null;
    }
    if (input.coverImage !== undefined) {
      bookstore.coverImage = input.coverImage || null;
    }

    return this.repositoryProvider.BookstoreRepository.save(bookstore);
  }

  async getById(bookstoreId: string): Promise<BookstoreEntity> {
    return this.repositoryProvider.BookstoreRepository.findOneByOrFail({
      id: bookstoreId,
    }).catch(() => {
      throw new NotFoundException('서점을 찾을 수 없습니다');
    });
  }

  async getPosts(bookstoreId: string, options: GetPostsOptions) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const [posts, total] =
      await this.repositoryProvider.PostRepository.findAndCount({
        where: {
          bookstoreId,
          status: POST_STATUS.PUBLISHED,
        },
        relations: ['author'],
        order: { publishedAt: 'DESC' },
        skip,
        take: limit,
      });

    if (posts.length === 0) {
      return { posts: [], total };
    }

    const publishedVersionIds = posts
      .map(p => p.publishedVersionId)
      .filter((id): id is string => id != null);

    const versions = await this.repositoryProvider.PostVersionRepository.find({
      where: { id: In(publishedVersionIds) },
    });

    const versionMap = new Map(versions.map(v => [v.id, v]));

    const flattenedPosts = posts
      .filter(
        post =>
          post.publishedVersionId != null &&
          versionMap.has(post.publishedVersionId)
      )
      .map(post =>
        this.flattenPostWithVersion(
          post,
          versionMap.get(post.publishedVersionId!)!
        )
      );

    return { posts: flattenedPosts, total };
  }

  async getMyPosts(userId: string, status?: PostStatus) {
    const bookstore = await this.getBookstoreByUserId(userId);

    const where: FindOptionsWhere<PostEntity> = { bookstoreId: bookstore.id };
    if (status) {
      where.status = status;
    }

    const posts = await this.repositoryProvider.PostRepository.find({
      where,
      relations: ['author'],
      order: { updatedAt: 'DESC' },
    });

    if (posts.length === 0) {
      return [];
    }

    const postIds = posts.map(p => p.id);

    const latestVersionRows =
      await this.repositoryProvider.PostVersionRepository.createQueryBuilder(
        'pv'
      )
        .select('DISTINCT ON (pv.post_id) pv.id', 'id')
        .where('pv.post_id IN (:...postIds)', { postIds })
        .orderBy('pv.post_id')
        .addOrderBy('pv.version_number', 'DESC')
        .getRawMany<{ id: string }>();

    const latestVersionIds = latestVersionRows.map(r => r.id);

    const versions =
      latestVersionIds.length > 0
        ? await this.repositoryProvider.PostVersionRepository.find({
            where: { id: In(latestVersionIds) },
          })
        : [];

    const versionMap = new Map(versions.map(v => [v.postId, v]));

    return posts
      .filter(post => versionMap.has(post.id))
      .map(post => this.flattenPostWithVersion(post, versionMap.get(post.id)!));
  }

  async getSettings(userId: string): Promise<PublishDefaultEntity> {
    const bookstore = await this.getBookstoreByUserId(userId);

    return bookstore.publishDefault ?? PublishDefaultEntity.createDefault();
  }

  async updateSettings(
    userId: string,
    input: UpdateSettingsInput
  ): Promise<PublishDefaultEntity> {
    const bookstore = await this.getBookstoreByUserId(userId);

    if (!bookstore.publishDefault) {
      bookstore.publishDefault = PublishDefaultEntity.createDefault();
    }

    if (input.defaultAccessLevel !== undefined) {
      bookstore.publishDefault.defaultAccessLevel = input.defaultAccessLevel;
    }
    if (input.defaultPrice !== undefined) {
      bookstore.publishDefault.defaultPrice = input.defaultPrice;
    }
    if (input.defaultAgeRating !== undefined) {
      bookstore.publishDefault.defaultAgeRating = input.defaultAgeRating;
    }

    const saved =
      await this.repositoryProvider.BookstoreRepository.save(bookstore);
    return saved.publishDefault;
  }

  async getPopularPosts(bookstoreId: string, limit: number = 5) {
    // viewCount가 아직 없으므로 최신순 + published 필터로 대체
    const posts = await this.repositoryProvider.PostRepository.find({
      where: {
        bookstoreId,
        status: POST_STATUS.PUBLISHED,
      },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    if (posts.length === 0) {
      return [];
    }

    const publishedVersionIds = posts
      .map(p => p.publishedVersionId)
      .filter((id): id is string => id != null);

    const versions = await this.repositoryProvider.PostVersionRepository.find({
      where: { id: In(publishedVersionIds) },
    });

    const versionMap = new Map(versions.map(v => [v.id, v]));

    return posts
      .filter(
        post =>
          post.publishedVersionId != null &&
          versionMap.has(post.publishedVersionId)
      )
      .map(post =>
        this.flattenPostWithVersion(
          post,
          versionMap.get(post.publishedVersionId!)!
        )
      );
  }
}
