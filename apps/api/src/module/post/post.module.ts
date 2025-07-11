import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}