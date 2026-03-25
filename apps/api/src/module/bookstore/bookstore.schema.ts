import { z } from 'zod';

const nameRegex = /^[가-힣a-zA-Z0-9_\s]+$/;

export const openBookstoreInputSchema = z.object({
  penName: z
    .string()
    .min(1)
    .max(30)
    .transform(v => v.trim())
    .pipe(z.string().regex(nameRegex, '한글, 영문, 숫자, 밑줄, 공백만 허용')),
  storeName: z
    .string()
    .min(1)
    .max(50)
    .transform(v => v.trim())
    .pipe(z.string().regex(nameRegex, '한글, 영문, 숫자, 밑줄, 공백만 허용')),
  termsAgreed: z.boolean().refine(v => v === true, '약관에 동의해야 합니다'),
});

export const bookstoreResponseSchema = z.object({
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

export const updateProfileInputSchema = z.object({
  penName: z
    .string()
    .min(1)
    .max(30)
    .transform(v => v.trim())
    .pipe(z.string().regex(nameRegex, '한글, 영문, 숫자, 밑줄, 공백만 허용'))
    .optional(),
  storeName: z
    .string()
    .min(1)
    .max(50)
    .transform(v => v.trim())
    .pipe(z.string().regex(nameRegex, '한글, 영문, 숫자, 밑줄, 공백만 허용'))
    .optional(),
  bio: z.string().max(500).optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  coverImage: z.string().url().optional().or(z.literal('')),
});

const postAccessLevelSchema = z.enum([
  'public',
  'subscriber',
  'purchaser',
  'private',
]);

export const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullish(),
  thumbnail: z.string().nullish(),
  accessLevel: postAccessLevelSchema,
  status: z.enum(['draft', 'published', 'scheduled']),
  price: z.number(),
  bookstoreId: z.string().uuid().nullable(),
  publishedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const postFeedItemSchema = postResponseSchema.extend({
  author: z.object({
    id: z.string(),
    nickname: z.string(),
    profileImage: z.string().nullish(),
  }),
});

export const publishDefaultResponseSchema = z.object({
  defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']),
  defaultPrice: z.number().int(),
  defaultAgeRating: z.enum(['all', 'adult']),
});

export const updateSettingsInputSchema = z.object({
  defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']).optional(),
  defaultPrice: z.number().int().min(0).optional(),
  defaultAgeRating: z.enum(['all', 'adult']).optional(),
});
