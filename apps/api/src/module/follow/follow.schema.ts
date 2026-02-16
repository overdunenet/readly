import { z } from 'zod';

export const followInputSchema = z.object({
  followeeId: z.string().uuid(),
});

export const userIdInputSchema = z.object({
  userId: z.string().uuid(),
});

export const followOutputSchema = z.object({
  id: z.string(),
  followerId: z.string(),
  followeeId: z.string(),
  createdAt: z.date(),
});
