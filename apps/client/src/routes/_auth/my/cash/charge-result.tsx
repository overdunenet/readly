import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { CheckCircle, XCircle } from 'lucide-react';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import SubLayout from '../../../../components/layout/SubLayout';

import { trpc } from '@/shared';

const searchSchema = z.object({
  status: z.enum(['success', 'failed']).optional(),
  orderId: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute('/_auth/my/cash/charge-result')({
  validateSearch: searchSchema,
  component: ChargeResultPage,
});

function ChargeResultPage() {
  const { status, message } = useSearch({
    from: '/_auth/my/cash/charge-result',
  });
  const navigate = useNavigate();
  const balanceQuery = trpc.cash.getBalance.useQuery(undefined, {
    enabled: status === 'success',
  });

  const isSuccess = status === 'success';

  const handleConfirm = () => {
    const target = isSuccess ? '/my/cash' : '/my/cash/charge';
    navigate({ to: target });
  };

  return (
    <SubLayout title="충전 결과">
      <PageContainer>
        <ResultCard>
          {isSuccess ? (
            <>
              <IconWrapper $variant="success">
                <CheckCircle size={48} />
              </IconWrapper>
              <ResultTitle>충전이 완료되었습니다</ResultTitle>
              <BalanceInfo>
                <BalanceLabel>현재 잔액</BalanceLabel>
                <BalanceAmount>
                  {balanceQuery.isLoading
                    ? '...'
                    : `${(balanceQuery.data?.amount ?? 0).toLocaleString()}원`}
                </BalanceAmount>
              </BalanceInfo>
            </>
          ) : (
            <>
              <IconWrapper $variant="failed">
                <XCircle size={48} />
              </IconWrapper>
              <ResultTitle>충전에 실패했습니다</ResultTitle>
              {message && <ErrorMessage>{message}</ErrorMessage>}
            </>
          )}

          <ActionButton type="button" onClick={handleConfirm}>
            {isSuccess ? '확인' : '다시 시도'}
          </ActionButton>
        </ResultCard>
      </PageContainer>
    </SubLayout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-8
  flex
  items-center
  justify-center
  min-h-[60vh]
`;

const ResultCard = tw.div`
  w-full
  max-w-sm
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-100
  p-8
  flex
  flex-col
  items-center
  gap-4
  text-center
`;

const IconWrapper = tw.div<{ $variant: 'success' | 'failed' }>`
  ${(p) => (p.$variant === 'success' ? 'text-green-500' : 'text-red-500')}
`;

const ResultTitle = tw.h2`
  text-lg
  font-bold
  text-gray-900
`;

const BalanceInfo = tw.div`
  bg-gray-50
  rounded-lg
  px-6
  py-3
  flex
  items-center
  justify-between
  w-full
`;

const BalanceLabel = tw.span`
  text-sm
  text-gray-600
`;

const BalanceAmount = tw.span`
  text-base
  font-bold
  text-blue-600
`;

const ErrorMessage = tw.p`
  text-sm
  text-gray-500
`;

const ActionButton = tw.button`
  w-full
  mt-4
  py-3
  bg-blue-600
  text-white
  font-semibold
  rounded-lg
  hover:bg-blue-700
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  transition-colors
`;
