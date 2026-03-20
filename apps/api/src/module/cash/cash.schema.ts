import { z } from 'zod';

export const chargeInputSchema = z.object({
  amount: z.number().int().min(1000).max(1000000),
});

export const chargeOutputSchema = z.object({
  cashBalance: z.number(),
  cash: z.object({
    id: z.string(),
    initialAmount: z.number(),
    currentAmount: z.number(),
  }),
  history: z.object({
    id: z.string(),
    type: z.string(),
    amount: z.number(),
    balanceAfter: z.number(),
    description: z.string(),
  }),
});

export const getBalanceOutputSchema = z.object({
  amount: z.number(),
});

export const getHistoryInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const getHistoryOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      cashId: z.string(),
      type: z.string(),
      amount: z.number(),
      balanceAfter: z.number(),
      description: z.string(),
      createdAt: z.date(),
    })
  ),
  nextCursor: z.string().uuid().nullable(),
});
