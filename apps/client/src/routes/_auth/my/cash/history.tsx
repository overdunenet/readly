import { createFileRoute } from '@tanstack/react-router';
import { ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';

import SubLayout from '../../../../components/layout/SubLayout';

import { formatAmount, getAmountColor, getIconBgColor } from './cash-utils';

import { trpc } from '@/shared';

const LIMIT = 20;

export const Route = createFileRoute('/_auth/my/cash/history')({
  component: CashHistoryPage,
});

interface HistoryItem {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

function CashHistoryPage() {
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const historyQuery = trpc.cash.getHistory.useQuery({ cursor, limit: LIMIT });

  useEffect(() => {
    if (!historyQuery.data) return;
    setAllItems((prev) =>
      cursor ? [...prev, ...historyQuery.data.items] : historyQuery.data.items,
    );
    setHasMore(historyQuery.data.nextCursor !== null);
  }, [historyQuery.data, cursor]);

  const handleLoadMore = () => {
    const lastItem = allItems[allItems.length - 1];
    if (lastItem) {
      setCursor(lastItem.id);
    }
  };

  return (
    <SubLayout title="거래 내역">
      <PageContainer>
        {historyQuery.isLoading && allItems.length === 0 ? (
          <LoadingText>불러오는 중...</LoadingText>
        ) : allItems.length === 0 ? (
          <EmptyText>아직 거래 내역이 없습니다</EmptyText>
        ) : (
          <>
            <TransactionList>
              {allItems.map((item) => (
                <TransactionItem key={item.id}>
                  <ItemLeft>
                    <IconWrapper $type={item.type}>
                      <TypeIcon type={item.type} />
                    </IconWrapper>
                    <ItemInfo>
                      <ItemDescription>{item.description}</ItemDescription>
                      <ItemMeta>
                        <ItemDate>
                          {new Date(item.createdAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </ItemDate>
                        <ItemBalance>
                          잔액 {item.balanceAfter.toLocaleString()}원
                        </ItemBalance>
                      </ItemMeta>
                    </ItemInfo>
                  </ItemLeft>
                  <ItemAmount $type={item.type}>
                    {formatAmount(item.type, item.amount)}
                  </ItemAmount>
                </TransactionItem>
              ))}
            </TransactionList>
            {hasMore && (
              <LoadMoreButton
                type="button"
                onClick={handleLoadMore}
                disabled={historyQuery.isFetching}
              >
                {historyQuery.isFetching ? '불러오는 중...' : '더 보기'}
              </LoadMoreButton>
            )}
          </>
        )}
      </PageContainer>
    </SubLayout>
  );
}

function TypeIcon({ type }: { type: string }) {
  const size = 18;
  if (type === 'CHARGE') return <ArrowDownCircle size={size} />;
  if (type === 'PURCHASE') return <ArrowUpCircle size={size} />;
  if (type === 'REFUND') return <RotateCcw size={size} />;
  return <ArrowDownCircle size={size} />;
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
`;

const LoadingText = tw.p`
  text-sm
  text-gray-400
  text-center
  py-16
`;

const EmptyText = tw.p`
  text-sm
  text-gray-400
  text-center
  py-16
`;

const TransactionList = tw.div`
  divide-y
  divide-gray-100
`;

const TransactionItem = tw.div`
  flex
  items-center
  justify-between
  py-4
`;

const ItemLeft = tw.div`
  flex
  items-center
  gap-3
  min-w-0
  flex-1
`;

const IconWrapper = tw.div<{ $type: string }>`
  w-9
  h-9
  rounded-full
  flex
  items-center
  justify-center
  flex-shrink-0
  ${(p) => getIconBgColor(p.$type)}
`;

const ItemInfo = tw.div`
  flex
  flex-col
  gap-0.5
  min-w-0
`;

const ItemDescription = tw.span`
  text-sm
  font-medium
  text-gray-900
  truncate
`;

const ItemMeta = tw.div`
  flex
  items-center
  gap-2
`;

const ItemDate = tw.span`
  text-xs
  text-gray-400
`;

const ItemBalance = tw.span`
  text-xs
  text-gray-400
`;

const ItemAmount = tw.span<{ $type: string }>`
  text-sm
  font-semibold
  flex-shrink-0
  ml-3
  ${(p) => getAmountColor(p.$type)}
`;

const LoadMoreButton = tw.button`
  w-full
  py-3
  mt-4
  text-sm
  font-medium
  text-gray-500
  bg-gray-50
  rounded-lg
  hover:bg-gray-100
  transition-colors
  disabled:opacity-50
  disabled:cursor-not-allowed
`;
