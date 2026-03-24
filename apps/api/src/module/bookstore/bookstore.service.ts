import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { BookstoreEntity } from '../domain/bookstore.entity';
import { PostEntity, PostStatus } from '../domain/post.entity';

export interface OpenBookstoreInput {
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

@Injectable()
export class BookstoreService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async open(
    userId: string,
    input: OpenBookstoreInput
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

    if (user.country !== 'KR') {
      throw new ForbiddenException(
        '현재 한국 유저만 서점을 오픈할 수 있습니다'
      );
    }

    const bookstore = BookstoreEntity.create({
      userId,
      penName: input.penName,
      storeName: input.storeName,
      country: user.country,
      termsAgreedAt: input.termsAgreedAt,
    });
    bookstore.openedAt = new Date();

    return this.repositoryProvider.BookstoreRepository.save(bookstore);
  }

  async hasBookstore(userId: string): Promise<boolean> {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneBy({ userId });
    return !!bookstore;
  }

  async getMyBookstore(userId: string): Promise<BookstoreEntity> {
    return this.repositoryProvider.BookstoreRepository.findOneByOrFail({
      userId,
    }).catch(() => {
      throw new NotFoundException('서점을 찾을 수 없습니다');
    });
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<BookstoreEntity> {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneByOrFail({
        userId,
      }).catch(() => {
        throw new NotFoundException('서점을 찾을 수 없습니다');
      });

    if (input.penName !== undefined) {
      bookstore.penName = input.penName;
    }
    if (input.storeName !== undefined) {
      bookstore.storeName = input.storeName;
    }
    if (input.bio !== undefined) {
      bookstore.bio = input.bio || null;
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

  async getPosts(
    bookstoreId: string,
    options: GetPostsOptions
  ): Promise<{ posts: PostEntity[]; total: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const [posts, total] =
      await this.repositoryProvider.PostRepository.findAndCount({
        where: {
          bookstoreId,
          status: 'published' as PostStatus,
        },
        relations: ['author'],
        order: { publishedAt: 'DESC' },
        skip,
        take: limit,
      });

    return { posts, total };
  }

  async getMyWorks(userId: string, status?: string): Promise<PostEntity[]> {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneByOrFail({
        userId,
      }).catch(() => {
        throw new NotFoundException('서점을 찾을 수 없습니다');
      });

    const where: Record<string, unknown> = { bookstoreId: bookstore.id };
    if (status) {
      where.status = status as PostStatus;
    }

    return this.repositoryProvider.PostRepository.find({
      where,
      relations: ['author'],
      order: { updatedAt: 'DESC' },
    });
  }
}
