import { z } from 'zod';

// getBalance
export const getBalanceOutputSchema = z.object({
  amount: z.number(),
});

// getHistory
export const getHistoryInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const cashHistoryItemSchema = z.object({
  id: z.string(),
  cashId: z.string(),
  type: z.enum(['CHARGE', 'PURCHASE', 'REFUND']),
  amount: z.number(),
  balanceAfter: z.number(),
  description: z.string(),
  createdAt: z.date(),
});

export const getHistoryOutputSchema = z.object({
  items: z.array(cashHistoryItemSchema),
  nextCursor: z.string().nullable(),
});

// initiateCharge
export const initiateChargeInputSchema = z.object({
  amount: z.number().min(1000).max(1000000),
});

export const initiateChargeOutputSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
});
