import { z } from 'zod';
import { Router, Mutation, UseMiddlewares, Ctx, Input } from 'nestjs-trpc-v2';
import { Inject } from '@nestjs/common';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import { MicroserviceClient } from '../trpc/microserviceClient';
import { CookieService } from '../trpc/services/cookie.service';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
} from '../user/user.auth.middleware';
import { UploadService } from './upload.service';

const getPresignedUrlInput = z.object({
  key: z.string().min(1),
  contentType: z.string().min(1),
});

const getPresignedUrlOutput = z.object({
  presignedUrl: z.string(),
  cdnUrl: z.string(),
});

// Router → Service 직접 주입 패턴
// S3 presigned URL 생성은 DB 트랜잭션이 불필요하므로
// EventBus(MicroserviceClient) 경유 없이 Service를 직접 호출한다.
@Router({ alias: 'upload' })
export class UploadRouter extends BaseTrpcRouter {
  constructor(
    microserviceClient: MicroserviceClient,
    cookieService: CookieService,
    @Inject(UploadService)
    private readonly uploadService: UploadService
  ) {
    super(microserviceClient, cookieService);
  }

  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({ input: getPresignedUrlInput, output: getPresignedUrlOutput })
  async getPresignedUrl(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof getPresignedUrlInput>
  ) {
    return this.uploadService.getPresignedUploadUrl(
      input.key,
      input.contentType
    );
  }
}
