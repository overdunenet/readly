import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '../shared/transaction/transaction.decorator';
import { TransactionService } from '../shared/transaction/transaction.service';
import {
  PostService,
  CreatePostInput,
  UpdatePostInput,
  SaveDraftInput,
} from './post.service';
import { SaveType, FlattenedPost } from '../domain/post-version.entity';

@Controller()
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('post.create')
  @Transactional
  async createPost(
    @Payload() data: { authorId: string; input: CreatePostInput }
  ): Promise<FlattenedPost> {
    return this.postService.createPost(data.authorId, data.input);
  }

  @MessagePattern('post.saveDraft')
  @Transactional
  async saveDraft(
    @Payload()
    data: {
      postId: string;
      authorId: string;
      input: SaveDraftInput;
      saveType: SaveType;
    }
  ) {
    return this.postService.saveDraft(
      data.postId,
      data.authorId,
      data.input,
      data.saveType
    );
  }

  @MessagePattern('post.update')
  async updatePost(
    @Payload()
    data: {
      postId: string;
      authorId: string;
      input: UpdatePostInput;
    }
  ): Promise<FlattenedPost> {
    return this.postService.updatePost(data.postId, data.authorId, data.input);
  }

  @MessagePattern('post.publish')
  async publishPost(
    @Payload() data: { postId: string; authorId: string }
  ): Promise<FlattenedPost> {
    return this.postService.publishPost(data.postId, data.authorId);
  }

  @MessagePattern('post.unpublish')
  async unpublishPost(
    @Payload() data: { postId: string; authorId: string }
  ): Promise<FlattenedPost> {
    return this.postService.unpublishPost(data.postId, data.authorId);
  }

  @MessagePattern('post.delete')
  async deletePost(
    @Payload() data: { postId: string; authorId: string }
  ): Promise<void> {
    return this.postService.deletePost(data.postId, data.authorId);
  }

  @MessagePattern('post.getOne')
  async getPost(
    @Payload() data: { postId: string; userId?: string }
  ): Promise<FlattenedPost> {
    return this.postService.getPost(data.postId, data.userId);
  }

  @MessagePattern('post.getMy')
  async getMyPosts(
    @Payload() data: { authorId: string }
  ): Promise<FlattenedPost[]> {
    return this.postService.getMyPosts(data.authorId);
  }

  @MessagePattern('post.getAccessible')
  async getAccessiblePosts(): Promise<FlattenedPost[]> {
    return this.postService.getAccessiblePosts();
  }
}
