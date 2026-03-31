import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { PostEntity, PostAccessLevel } from '../domain/post.entity';

export interface CreatePostInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string;
  thumbnail?: string;
  accessLevel?: PostAccessLevel;
  price?: number;
}

export interface UpdatePostInput {
  title?: string;
  freeContent?: string;
  paidContent?: string | null;
  excerpt?: string;
  thumbnail?: string;
  accessLevel?: PostAccessLevel;
  price?: number;
}

export interface SchedulePostInput {
  scheduledAt: Date;
}

@Injectable()
export class PostService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async createPost(
    authorId: string,
    input: CreatePostInput
  ): Promise<PostEntity> {
    const bookstore =
      await this.repositoryProvider.BookstoreRepository.findOneBy({
        userId: authorId,
      });

    if (!bookstore) {
      throw new ForbiddenException('서점을 먼저 오픈해주세요');
    }

    return await this.repositoryProvider.PostRepository.createPost({
      ...input,
      authorId,
      bookstoreId: bookstore.id,
    });
  }

  async updatePost(
    postId: string,
    authorId: string,
    input: UpdatePostInput
  ): Promise<PostEntity> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to update this post'
        );
      });

    // 업데이트
    post.edit(input);
    return this.repositoryProvider.PostRepository.save(post);
  }

  async publishPost(postId: string, authorId: string): Promise<PostEntity> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to publish this post'
        );
      });

    // 발행
    post.publish();
    return this.repositoryProvider.PostRepository.save(post);
  }

  async unpublishPost(postId: string, authorId: string): Promise<PostEntity> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to unpublish this post'
        );
      });

    // 임시저장으로 변경
    post.unpublish();
    return this.repositoryProvider.PostRepository.save(post);
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForEdit(
        postId,
        authorId
      ).catch(() => {
        throw new ForbiddenException(
          'Post not found or you are not allowed to delete this post'
        );
      });

    await this.repositoryProvider.PostRepository.softRemove(post);
  }

  async getPost(postId: string, userId?: string): Promise<PostEntity> {
    const post =
      await this.repositoryProvider.PostRepository.findOneByIdForRead(
        postId,
        userId
      ).catch(() => {
        throw new NotFoundException(
          'Post not found or you are not allowed to read this post'
        );
      });

    // 유료 본문 접근 권한이 없으면 paidContent를 null로 마스킹
    // findOneByIdForRead가 author 관계를 로드하므로, 작성자 본인인지는 authorId로 판단
    if (!post.canAccessPaidContent(userId ?? null)) {
      post.paidContent = null;
    }

    return post;
  }

  async getMyPosts(authorId: string): Promise<PostEntity[]> {
    return this.repositoryProvider.PostRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAccessiblePosts(): Promise<PostEntity[]> {
    return this.repositoryProvider.PostRepository.find({
      where: { status: 'published', accessLevel: 'public' },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
    });
  }
}
