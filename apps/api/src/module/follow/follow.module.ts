import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, // RepositoryProvider 포함
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
