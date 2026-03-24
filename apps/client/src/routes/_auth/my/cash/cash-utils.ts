export type CashHistoryType = 'CHARGE' | 'PURCHASE' | 'REFUND';

export function formatAmount(type: string, amount: number): string {
  const formatted = amount.toLocaleString();
  if (type === 'CHARGE' || type === 'REFUND') return `+${formatted}원`;
  return `-${formatted}원`;
}

export function getAmountColor(type: string): string {
  if (type === 'CHARGE') return 'text-green-600';
  if (type === 'PURCHASE') return 'text-red-500';
  if (type === 'REFUND') return 'text-blue-600';
  return 'text-gray-900';
}

export function getIconBgColor(type: string): string {
  if (type === 'CHARGE') return 'bg-green-50 text-green-600';
  if (type === 'PURCHASE') return 'bg-red-50 text-red-500';
  if (type === 'REFUND') return 'bg-blue-50 text-blue-600';
  return 'bg-gray-50 text-gray-600';
}
