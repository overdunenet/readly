import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import SubLayout from '../../../../components/layout/SubLayout';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/my/cash/')({
  component: CashHubPage,
});

function CashHubPage() {
  const balanceQuery = trpc.cash.getBalance.useQuery();
  const historyQuery = trpc.cash.getHistory.useQuery({ limit: 5 });

  const items = historyQuery.data?.items ?? [];

  return (
    <SubLayout title="캐시 관리">
      <PageContainer>
        {/* 현재 잔액 */}
        <BalanceSection>
          <BalanceLabel>현재 잔액</BalanceLabel>
          <BalanceAmount>
            {balanceQuery.isLoading
              ? '...'
              : `${(balanceQuery.data?.amount ?? 0).toLocaleString()}원`}
          </BalanceAmount>
        </BalanceSection>

        {/* 액션 버튼 */}
        <ButtonGroup>
          <PrimaryButton to="/my/cash/charge">캐시 충전하기</PrimaryButton>
          <SecondaryButton to="/my/cash/history">거래 내역</SecondaryButton>
        </ButtonGroup>

        {/* 최근 거래 */}
        <Section>
          <SectionTitle>최근 거래</SectionTitle>
          {historyQuery.isLoading ? (
            <LoadingText>불러오는 중...</LoadingText>
          ) : items.length === 0 ? (
            <EmptyText>아직 거래 내역이 없습니다</EmptyText>
          ) : (
            <TransactionList>
              {items.map((item) => (
                <TransactionItem key={item.id}>
                  <TransactionInfo>
                    <TransactionDescription>
                      {item.description}
                    </TransactionDescription>
                    <TransactionDate>
                      {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </TransactionDate>
                  </TransactionInfo>
                  <TransactionAmount $type={item.type}>
                    {formatAmount(item.type, item.amount)}
                  </TransactionAmount>
                </TransactionItem>
              ))}
            </TransactionList>
          )}
        </Section>
      </PageContainer>
    </SubLayout>
  );
}

function formatAmount(type: string, amount: number): string {
  const formatted = amount.toLocaleString();
  if (type === 'CHARGE' || type === 'REFUND') return `+${formatted}원`;
  return `-${formatted}원`;
}

function getAmountColor(type: string): string {
  if (type === 'CHARGE') return 'text-green-600';
  if (type === 'PURCHASE') return 'text-red-500';
  if (type === 'REFUND') return 'text-blue-600';
  return 'text-gray-900';
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
  space-y-6
`;

const BalanceSection = tw.div`
  bg-blue-50
  rounded-lg
  p-4
  flex
  items-center
  justify-between
`;

const BalanceLabel = tw.span`
  text-sm
  font-medium
  text-gray-600
`;

const BalanceAmount = tw.span`
  text-lg
  font-bold
  text-blue-600
`;

const ButtonGroup = tw.div`
  flex
  gap-3
`;

const PrimaryButton = tw(Link)`
  flex-1
  text-center
  py-3
  bg-blue-600
  text-white
  font-semibold
  rounded-lg
  hover:bg-blue-700
  transition-colors
`;

const SecondaryButton = tw(Link)`
  flex-1
  text-center
  py-3
  border
  border-gray-300
  text-gray-700
  font-semibold
  rounded-lg
  hover:border-gray-400
  transition-colors
`;

const Section = tw.div`
  space-y-3
`;

const SectionTitle = tw.h2`
  text-base
  font-semibold
  text-gray-900
`;

const LoadingText = tw.p`
  text-sm
  text-gray-400
  text-center
  py-8
`;

const EmptyText = tw.p`
  text-sm
  text-gray-400
  text-center
  py-8
`;

const TransactionList = tw.div`
  divide-y
  divide-gray-100
`;

const TransactionItem = tw.div`
  flex
  items-center
  justify-between
  py-3
`;

const TransactionInfo = tw.div`
  flex
  flex-col
  gap-0.5
`;

const TransactionDescription = tw.span`
  text-sm
  font-medium
  text-gray-900
`;

const TransactionDate = tw.span`
  text-xs
  text-gray-400
`;

const TransactionAmount = tw.span<{ $type: string }>`
  text-sm
  font-semibold
  ${(p) => getAmountColor(p.$type)}
`;
