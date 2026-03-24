import { z } from 'zod';
import {
  Input,
  Query,
  Router,
  Mutation,
  UseMiddlewares,
  Ctx,
} from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import {
  UserAuthMiddleware,
  UserAuthorizedContext,
} from '../user/user.auth.middleware';

const openBookstoreInputSchema = z.object({
  penName: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[가-힣a-zA-Z0-9_\s]+$/, '한글, 영문, 숫자, 밑줄, 공백만 허용'),
  storeName: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[가-힣a-zA-Z0-9_\s]+$/),
  termsAgreed: z.boolean().refine(v => v === true, '약관에 동의해야 합니다'),
});

const bookstoreResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  penName: z.string(),
  storeName: z.string(),
  bio: z.string().nullable(),
  profileImage: z.string().nullable(),
  coverImage: z.string().nullable(),
  genreTags: z.array(z.string()),
  country: z.string(),
  isActive: z.boolean(),
  termsAgreedAt: z.date().nullable(),
  openedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

@Router({ alias: 'bookstore' })
export class BookstoreRouter extends BaseTrpcRouter {
  /**
   * 서점 오픈
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Mutation({
    input: openBookstoreInputSchema,
    output: bookstoreResponseSchema,
  })
  async open(
    @Ctx() ctx: UserAuthorizedContext,
    @Input() input: z.infer<typeof openBookstoreInputSchema>
  ) {
    return await this.microserviceClient.send('bookstore.open', {
      userId: ctx.user.sub,
      input: {
        penName: input.penName,
        storeName: input.storeName,
        termsAgreedAt: input.termsAgreed ? new Date() : undefined,
      },
    });
  }

  /**
   * 서점 보유 여부 확인
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: z.boolean(),
  })
  async hasBookstore(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('bookstore.hasBookstore', {
      userId: ctx.user.sub,
    });
  }

  /**
   * 내 서점 조회
   */
  @UseMiddlewares(UserAuthMiddleware)
  @Query({
    output: bookstoreResponseSchema,
  })
  async getMyBookstore(@Ctx() ctx: UserAuthorizedContext) {
    return await this.microserviceClient.send('bookstore.getMyBookstore', {
      userId: ctx.user.sub,
    });
  }
}
