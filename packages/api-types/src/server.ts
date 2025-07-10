import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  sample: t.router({
    getHello: publicProcedure.input(z.object({
      name: z.string().optional(),
    })).output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSample: publicProcedure.output(z.string()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  user: t.router({
    register: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
      nickname: z.string().min(2).max(20),
    })).output(z.object({
      user: z.object({
        id: z.string(),
        email: z.string().email(),
        nickname: z.string(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    login: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string().email(),
        nickname: z.string(),
        profileImage: z.string().nullable(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    refreshToken: publicProcedure.input(z.object({
      refreshToken: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string().email(),
        nickname: z.string(),
        profileImage: z.string().nullable(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    me: publicProcedure.output(z.object({
      id: z.string(),
      email: z.string().email(),
      nickname: z.string(),
      profileImage: z.string().nullable(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

