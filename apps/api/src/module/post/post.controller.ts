import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService, CreatePostInput, UpdatePostInput } from './post.service';
import { PostEntity } from '../domain/post.entity';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern('post.create')
  async createPost(
    @Payload() data: { authorId: string; input: CreatePostInput }
  ): Promise<PostEntity> {
    return this.postService.createPost(data.authorId, data.input);
  }

  @MessagePattern('post.update')
  async updatePost(
    @Payload()
    data: {
      postId: string;
      authorId: string;
      input: UpdatePostInput;
    }
  ): Promise<PostEntity> {
    return this.postService.updatePost(data.postId, data.authorId, data.input);
  }

  @MessagePattern('post.publish')
  async publishPost(
    @Payload() data: { postId: string; authorId: string }
  ): Promise<PostEntity> {
    return this.postService.publishPost(data.postId, data.authorId);
  }

  @MessagePattern('post.unpublish')
  async unpublishPost(
    @Payload() data: { postId: string; authorId: string }
  ): Promise<PostEntity> {
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
  ): Promise<PostEntity> {
    return this.postService.getPost(data.postId, data.userId);
  }

  @MessagePattern('post.getMy')
  async getMyPosts(
    @Payload() data: { authorId: string }
  ): Promise<PostEntity[]> {
    return this.postService.getMyPosts(data.authorId);
  }

  @MessagePattern('post.getAccessible')
  async getAccessiblePosts(): Promise<PostEntity[]> {
    return this.postService.getAccessiblePosts();
  }
}
