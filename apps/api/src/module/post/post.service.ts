import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
  ) {
  }

  async createPost(authorId: string, input: CreatePostInput): Promise<PostEntity> {
    return this.repositoryProvider.PostRepository.createPost({
      ...input,
      authorId,
    });
  }

  async updatePost(postId: string, authorId: string, input: UpdatePostInput): Promise<PostEntity> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to update this post');
    });

    // 업데이트
    post.edit(input);
    return this.repositoryProvider.PostRepository.save(post);
  }

  async publishPost(postId: string, authorId: string): Promise<PostEntity> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to publish this post');
    });

    // 발행
    post.publish();
    return this.repositoryProvider.PostRepository.save(post);
  }

  async unpublishPost(postId: string, authorId: string): Promise<PostEntity> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to unpublish this post');
    });

    // 임시저장으로 변경
    post.unpublish();
    return this.repositoryProvider.PostRepository.save(post);
  }

  async schedulePost(postId: string, authorId: string, input: SchedulePostInput): Promise<PostEntity> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to schedule this post');
    });

    // 예약 발행 설정
    post.schedulePublish(input.scheduledAt);
    return this.repositoryProvider.PostRepository.save(post);
  }

  async cancelSchedule(postId: string, authorId: string): Promise<PostEntity> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to cancel schedule for this post');
    });

    // 예약 발행 취소
    post.cancelSchedule();
    return this.repositoryProvider.PostRepository.save(post);
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    const post = await this.repositoryProvider.PostRepository.findOneByIdForEdit(postId, authorId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to delete this post');
    });

    await this.repositoryProvider.PostRepository.softRemove(post);
  }

  async getPost(postId: string, userId?: string): Promise<PostEntity> {
    return this.repositoryProvider.PostRepository.findOneByIdForRead(postId, userId).catch(() => {
      throw new ForbiddenException('Post not found or you are not allowed to read this post');
    });
  }

  async getMyPosts(authorId: string): Promise<PostEntity[]> {
    return this.repositoryProvider.PostRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
}