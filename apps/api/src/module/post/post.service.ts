import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RepositoryProvider } from '../shared/transaction/repository.provider';
import { PostEntity, PostAccessLevel } from '../domain/post.entity';

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  accessLevel?: PostAccessLevel;
  price?: number;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
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
    return this.repositoryProvider.PostRepository.findOneByIdForRead(
      postId,
      userId
    ).catch(() => {
      throw new NotFoundException(
        'Post not found or you are not allowed to read this post'
      );
    });
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
