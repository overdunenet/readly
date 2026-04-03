import { initTRPC } from "@trpc/server";
import { z } from "zod";

enum UserStatus {
  PENDING_PHONE = 'PENDING_PHONE',
  PENDING_PROFILE = 'PENDING_PROFILE',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

enum Language {
  KO = 'ko',
  EN = 'en',
}

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  auth: t.router({
    socialLogin: publicProcedure.input(z.object({
      provider: z.enum(['naver', 'kakao', 'google']),
      code: z.string(),
      state: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        nickname: z.string(),
        profileImage: z.string().nullable(),
        status: z.nativeEnum(UserStatus),
      language: z.string(),
    }),
})).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  phoneOtpRequest: publicProcedure.input(z.object({ phone: z.string().regex(/^01[0-9]{8,9}$/) })).output(z.object({
    expiresAt: z.string(),
    resendAvailableAt: z.string(),
  })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    phoneOtpVerify: publicProcedure.input(z.object({
      phone: z.string().regex(/^01[0-9]{8,9}$/),
      code: z.string().length(6),
    })).output(z.object({
      success: z.boolean(),
      phone: z.string(),
      accessToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        nickname: z.string(),
        profileImage: z.string().nullable(),
        status: z.nativeEnum(UserStatus),
      language: z.string(),
    }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any) }),
bookstore: t.router({
  createBookstore: publicProcedure.input(z.object({
    penName: z
      .string()
      .min(1)
      .max(30)
      .transform(v => v.trim())
      .pipe(z.string().regex(/^[가-힣a-zA-Z0-9_\s]+$/, '한글, 영문, 숫자, 밑줄, 공백만 허용')),
    storeName: z
      .string()
      .min(1)
      .max(50)
      .transform(v => v.trim())
      .pipe(z.string().regex(/^[가-힣a-zA-Z0-9_\s]+$/, '한글, 영문, 숫자, 밑줄, 공백만 허용')),
    termsAgreed: z.boolean().refine(v => v === true, '약관에 동의해야 합니다'),
  })).output(z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    penName: z.string(),
    storeName: z.string(),
    bio: z.string().nullable(),
    profileImage: z.string().nullable(),
    coverImage: z.string().nullable(),
    language: z.nativeEnum(Language),
    isActive: z.boolean(),
    termsAgreedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  hasBookstore: publicProcedure.output(z.boolean()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMyBookstore: publicProcedure.output(z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      penName: z.string(),
      storeName: z.string(),
      bio: z.string().nullable(),
      profileImage: z.string().nullable(),
      coverImage: z.string().nullable(),
      language: z.nativeEnum(Language),
      isActive: z.boolean(),
      termsAgreedAt: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
})).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  updateProfile: publicProcedure.input(z.object({
    penName: z
      .string()
      .min(1)
      .max(30)
      .transform(v => v.trim())
      .pipe(z.string().regex(/^[가-힣a-zA-Z0-9_\s]+$/, '한글, 영문, 숫자, 밑줄, 공백만 허용'))
      .optional(),
    storeName: z
      .string()
      .min(1)
      .max(50)
      .transform(v => v.trim())
      .pipe(z.string().regex(/^[가-힣a-zA-Z0-9_\s]+$/, '한글, 영문, 숫자, 밑줄, 공백만 허용'))
      .optional(),
    bio: z.string().max(500).optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
    coverImage: z.string().url().optional().or(z.literal('')),
  })).output(z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    penName: z.string(),
    storeName: z.string(),
    bio: z.string().nullable(),
    profileImage: z.string().nullable(),
    coverImage: z.string().nullable(),
    language: z.nativeEnum(Language),
    isActive: z.boolean(),
    termsAgreedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  getById: publicProcedure.input(z.object({
    bookstoreId: z.string().uuid(),
  })).output(z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    penName: z.string(),
    storeName: z.string(),
    bio: z.string().nullable(),
    profileImage: z.string().nullable(),
    coverImage: z.string().nullable(),
    language: z.nativeEnum(Language),
    isActive: z.boolean(),
    termsAgreedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  getPosts: publicProcedure.input(z.object({
    bookstoreId: z.string().uuid(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(20),
  })).output(z.object({
    posts: z.array(z.object({
      id: z.string(),
      title: z.string(),
      freeContent: z.string(),
      paidContent: z.string().nullable(),
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
      ageRating: z.enum(['all', 'adult']),
      bookstoreId: z.string().uuid().nullable(),
      publishedAt: z.date().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }).extend({
      author: z.object({
        id: z.string(),
        nickname: z.string(),
        profileImage: z.string().nullish(),
      }),
    })),
    total: z.number(),
  })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMyPosts: publicProcedure.input(z.object({
      status: z.enum(['draft', 'published', 'scheduled']).optional(),
    })).output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      freeContent: z.string(),
      paidContent: z.string().nullable(),
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
      ageRating: z.enum(['all', 'adult']),
      bookstoreId: z.string().uuid().nullable(),
      publishedAt: z.date().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      getSettings: publicProcedure.output(z.object({
        defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']),
        defaultPrice: z.number().int(),
        defaultAgeRating: z.enum(['all', 'adult']),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
        updateSettings: publicProcedure.input(z.object({
          defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']).optional(),
          defaultPrice: z.number().int().min(0).optional(),
          defaultAgeRating: z.enum(['all', 'adult']).optional(),
        })).output(z.object({
          defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']),
          defaultPrice: z.number().int(),
          defaultAgeRating: z.enum(['all', 'adult']),
        })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
          getPopularPosts: publicProcedure.input(z.object({
            bookstoreId: z.string().uuid(),
            limit: z.number().int().positive().max(10).default(5),
          })).output(z.array(z.object({
            id: z.string(),
            title: z.string(),
            freeContent: z.string(),
            paidContent: z.string().nullable(),
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
            ageRating: z.enum(['all', 'adult']),
            bookstoreId: z.string().uuid().nullable(),
            publishedAt: z.date().nullish(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }).extend({
            author: z.object({
              id: z.string(),
              nickname: z.string(),
              profileImage: z.string().nullish(),
            }),
          }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any) }),
cash: t.router({
  getBalance: publicProcedure.output(z.object({
    amount: z.number(),
  })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  getHistory: publicProcedure.input(z.object({
    cursor: z.string().uuid().optional(),
    limit: z.number().min(1).max(100).default(20),
  })).output(z.object({
    items: z.array(z.object({
      id: z.string(),
      cashId: z.string(),
      type: z.enum(['CHARGE', 'PURCHASE', 'REFUND']),
      amount: z.number(),
      balanceAfter: z.number(),
      description: z.string(),
      createdAt: z.date(),
    })),
    nextCursor: z.string().nullable(),
  })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  initiateCharge: publicProcedure.input(z.object({
    amount: z.number().min(1000).max(1000000),
  })).output(z.object({
    orderId: z.string(),
    amount: z.number(),
  })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
}),
  follow: t.router({
    follow: publicProcedure.input(z.object({
      followeeId: z.string().uuid(),
    })).output(z.object({
      id: z.string(),
      followerId: z.string(),
      followeeId: z.string(),
      createdAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    unfollow: publicProcedure.input(z.object({
      followeeId: z.string().uuid(),
    })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    isFollowing: publicProcedure.input(z.object({
      followeeId: z.string().uuid(),
    })).output(z.boolean()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFollowerCount: publicProcedure.input(z.object({
      userId: z.string().uuid(),
    })).output(z.number()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFollowingCount: publicProcedure.input(z.object({
      userId: z.string().uuid(),
    })).output(z.number()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
    post: t.router({
      create: publicProcedure.input(z.object({
        title: z.string().min(1).max(200).optional(),
        freeContent: z.string().optional(),
        paidContent: z.string().nullable().optional(),
        excerpt: z.string().max(500).optional(),
        thumbnail: z.string().url().optional(),
        accessLevel: z.enum([
          'public',
          'subscriber',
          'purchaser',
          'private',
        ]).optional(),
        price: z.number().int().min(0).optional(),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      saveDraft: publicProcedure.input(z.object({
        postId: z.string().uuid(),
        data: z.object({
          title: z.string().optional(),
          freeContent: z.string().optional(),
          paidContent: z.string().nullable().optional(),
          excerpt: z.string().max(500).optional(),
          thumbnail: z.string().optional(),
        }),
        saveType: z.enum(['auto', 'manual']),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      update: publicProcedure.input(z.object({
        postId: z.string(),
        data: z.object({
          title: z.string().min(1).max(200).optional(),
          freeContent: z.string().optional(),
          paidContent: z.string().nullable().optional(),
          excerpt: z.string().max(500).optional(),
          thumbnail: z.string().url().optional(),
          accessLevel: z.enum([
            'public',
            'subscriber',
            'purchaser',
            'private',
          ]).optional(),
          price: z.number().int().min(0).optional(),
        }),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      publish: publicProcedure.input(z.object({
        postId: z.string(),
        accessLevel: z.enum(['public', 'subscriber', 'purchaser']).optional(),
        price: z.number().int().min(0).max(100000).optional(),
        ageRating: z.enum(['all', 'adult']).optional(),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      unpublish: publicProcedure.input(z.object({
        postId: z.string(),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      delete: publicProcedure.input(z.object({
        postId: z.string(),
      })).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      getOne: publicProcedure.input(z.object({
        postId: z.string(),
      })).output(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      getMy: publicProcedure.output(z.array(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
      getAccessible: publicProcedure.output(z.array(z.object({
        id: z.string(),
        title: z.string(),
        freeContent: z.string(),
        paidContent: z.string().nullable(),
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
        ageRating: z.enum(['all', 'adult']),
        bookstoreId: z.string().uuid().nullable(),
        publishedAt: z.date().nullish(),
        scheduledAt: z.date().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }).extend({
        author: z.object({
          id: z.string(),
          nickname: z.string(),
          profileImage: z.string().nullish(),
        }),
      }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
    }),
      user: t.router({
        refreshToken: publicProcedure.input(z.object({})).output(z.object({
          accessToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string().email(),
            nickname: z.string(),
            profileImage: z.string().nullable(),
            status: z.nativeEnum(UserStatus),
          language: z.string(),
        }),
})).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  logout: publicProcedure.input(z.object({})).output(z.boolean()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    me: publicProcedure.output(z.object({
      id: z.string(),
      email: z.string().email(),
      nickname: z.string(),
      profileImage: z.string().nullable(),
      status: z.nativeEnum(UserStatus),
      language: z.string(),
})).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
  updateProfile: publicProcedure.input(z
    .object({
      nickname: z
        .string()
        .trim()
        .min(1, '닉네임을 입력해주세요')
        .max(30, '닉네임은 30자 이내로 입력해주세요')
        .regex(/^[가-힣a-zA-Z0-9_]+$/, '한글, 영문, 숫자, 밑줄만 사용 가능합니다').optional(),
      profileImage: z.string().url().nullable().optional(),
    })
    .refine(
      data => data.nickname !== undefined || data.profileImage !== undefined,
      { message: '최소 하나의 필드를 입력해주세요' }
    )).output(z.object({
      id: z.string(),
      email: z.string().email(),
      nickname: z.string(),
      profileImage: z.string().nullable(),
      status: z.nativeEnum(UserStatus),
      language: z.string(),
})).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any) })});
export type AppRouter = typeof appRouter;

