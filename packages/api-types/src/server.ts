import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  auth: t.router({
    socialLogin: publicProcedure
      .input(
        z.object({
          provider: z.enum(['naver', 'kakao', 'google']),
          code: z.string(),
          state: z.string(),
        })
      )
      .output(
        z.object({
          accessToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            nickname: z.string(),
            profileImage: z.string().nullable(),
          }),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    naverLoginUrl: publicProcedure
      .output(
        z.object({
          url: z.string(),
        })
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  follow: t.router({
    follow: publicProcedure
      .input(
        z.object({
          followeeId: z.string().uuid(),
        })
      )
      .output(
        z.object({
          id: z.string(),
          followerId: z.string(),
          followeeId: z.string(),
          createdAt: z.date(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    unfollow: publicProcedure
      .input(
        z.object({
          followeeId: z.string().uuid(),
        })
      )
      .output(z.boolean())
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    isFollowing: publicProcedure
      .input(
        z.object({
          followeeId: z.string().uuid(),
        })
      )
      .output(z.boolean())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getFollowerCount: publicProcedure
      .input(
        z.object({
          userId: z.string().uuid(),
        })
      )
      .output(z.number())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getFollowingCount: publicProcedure
      .input(
        z.object({
          userId: z.string().uuid(),
        })
      )
      .output(z.number())
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  post: t.router({
    create: publicProcedure
      .input(
        z
          .object({
            title: z.string().min(1).max(200).optional(),
            content: z.string().min(1).optional(),
            excerpt: z.string().max(500).optional(),
            thumbnail: z.string().url().optional(),
            accessLevel: z
              .enum(['public', 'subscriber', 'purchaser', 'private'])
              .optional(),
            price: z.number().int().min(0).optional(),
          })
          .required({ title: true, content: true })
      )
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().nullish(),
          thumbnail: z.string().nullish(),
          accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
          status: z.enum(['draft', 'published', 'scheduled']),
          price: z.number(),
          publishedAt: z.date().nullish(),
          scheduledAt: z.date().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    update: publicProcedure
      .input(
        z.object({
          postId: z.string(),
          data: z.object({
            title: z.string().min(1).max(200).optional(),
            content: z.string().min(1).optional(),
            excerpt: z.string().max(500).optional(),
            thumbnail: z.string().url().optional(),
            accessLevel: z
              .enum(['public', 'subscriber', 'purchaser', 'private'])
              .optional(),
            price: z.number().int().min(0).optional(),
          }),
        })
      )
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().nullish(),
          thumbnail: z.string().nullish(),
          accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
          status: z.enum(['draft', 'published', 'scheduled']),
          price: z.number(),
          publishedAt: z.date().nullish(),
          scheduledAt: z.date().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    publish: publicProcedure
      .input(
        z.object({
          postId: z.string(),
        })
      )
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().nullish(),
          thumbnail: z.string().nullish(),
          accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
          status: z.enum(['draft', 'published', 'scheduled']),
          price: z.number(),
          publishedAt: z.date().nullish(),
          scheduledAt: z.date().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    unpublish: publicProcedure
      .input(
        z.object({
          postId: z.string(),
        })
      )
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().nullish(),
          thumbnail: z.string().nullish(),
          accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
          status: z.enum(['draft', 'published', 'scheduled']),
          price: z.number(),
          publishedAt: z.date().nullish(),
          scheduledAt: z.date().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    delete: publicProcedure
      .input(
        z.object({
          postId: z.string(),
        })
      )
      .output(z.boolean())
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getOne: publicProcedure
      .input(
        z.object({
          postId: z.string(),
        })
      )
      .output(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          excerpt: z.string().nullish(),
          thumbnail: z.string().nullish(),
          accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private']),
          status: z.enum(['draft', 'published', 'scheduled']),
          price: z.number(),
          publishedAt: z.date().nullish(),
          scheduledAt: z.date().nullish(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getMy: publicProcedure
      .output(
        z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
            excerpt: z.string().nullish(),
            thumbnail: z.string().nullish(),
            accessLevel: z.enum([
              'public',
              'subscriber',
              'purchaser',
              'private',
            ]),
            status: z.enum(['draft', 'published', 'scheduled']),
            price: z.number(),
            publishedAt: z.date().nullish(),
            scheduledAt: z.date().nullish(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        )
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    getAccessible: publicProcedure
      .output(
        z.array(
          z
            .object({
              id: z.string(),
              title: z.string(),
              content: z.string(),
              excerpt: z.string().nullish(),
              thumbnail: z.string().nullish(),
              accessLevel: z.enum([
                'public',
                'subscriber',
                'purchaser',
                'private',
              ]),
              status: z.enum(['draft', 'published', 'scheduled']),
              price: z.number(),
              publishedAt: z.date().nullish(),
              scheduledAt: z.date().nullish(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
            .extend({
              author: z.object({
                id: z.string(),
                nickname: z.string(),
                profileImage: z.string().nullish(),
              }),
            })
        )
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
  user: t.router({
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
          nickname: z.string().min(2).max(20),
        })
      )
      .output(
        z.object({
          user: z.object({
            id: z.string(),
            email: z.string().email(),
            nickname: z.string(),
          }),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .output(
        z.object({
          accessToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string().email(),
            nickname: z.string(),
            profileImage: z.string().nullable(),
          }),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    refreshToken: publicProcedure
      .input(z.object({}))
      .output(
        z.object({
          accessToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string().email(),
            nickname: z.string(),
            profileImage: z.string().nullable(),
          }),
        })
      )
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    logout: publicProcedure
      .input(z.object({}))
      .output(z.boolean())
      .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    me: publicProcedure
      .output(
        z.object({
          id: z.string(),
          email: z.string().email(),
          nickname: z.string(),
          profileImage: z.string().nullable(),
        })
      )
      .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
  }),
});
export type AppRouter = typeof appRouter;
