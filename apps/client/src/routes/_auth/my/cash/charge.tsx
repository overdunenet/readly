import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import SubHeader from '../../../../components/layout/SubHeader';

import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

const PRESET_AMOUNTS = [5_000, 10_000, 30_000, 50_000, 100_000];

const PAY_METHODS = [
  { value: 'card', label: '신용/체크카드' },
  { value: 'kakaopay', label: '카카오페이' },
  { value: 'tosspay', label: '토스페이' },
] as const;

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 1_000_000;

export const Route = createFileRoute('/_auth/my/cash/charge')({
  component: CashChargePage,
});

function CashChargePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState<string>('card');

  const balanceQuery = trpc.cash.getBalance.useQuery();
  const initiateChargeMutation = trpc.cash.initiateCharge.useMutation();

  const finalAmount = selectedAmount ?? parseCustomAmount(customAmount);
  const isAmountValid =
    finalAmount !== null &&
    finalAmount >= MIN_AMOUNT &&
    finalAmount <= MAX_AMOUNT;
  const canSubmit = isAmountValid && !initiateChargeMutation.isPending;

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw);
    setSelectedAmount(null);
  };

  const handleCharge = () => {
    if (!isAmountValid || finalAmount === null) return;

    initiateChargeMutation
      .mutateAsync({ amount: finalAmount })
      .then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).AUTHNICE.requestPay({
          clientId: import.meta.env.VITE_NICEPAY_CLIENT_ID,
          method: payMethod,
          orderId: result.orderId,
          amount: result.amount,
          goodsName: `Readly 캐시 충전 ${result.amount.toLocaleString()}원`,
          returnUrl: `${import.meta.env.VITE_API_URL}/payment/nicepay/confirm`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fnError: (payResult: any) => {
            SnappyModal.show(
              <AlertModal
                title="결제 오류"
                message={payResult.errorMsg || '결제 중 오류가 발생했습니다'}
              />,
            );
          },
        });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : '충전 요청에 실패했습니다';
        SnappyModal.show(<AlertModal title="오류" message={message} />);
      });
  };

  return (
    <>
      <SubHeader title="캐시 충전" />
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

        {/* 충전 금액 선택 */}
        <Section>
          <SectionTitle>충전 금액</SectionTitle>
          <AmountGrid>
            {PRESET_AMOUNTS.map((amount) => (
              <AmountButton
                key={amount}
                type="button"
                $selected={selectedAmount === amount}
                onClick={() => handlePresetClick(amount)}
              >
                {amount.toLocaleString()}원
              </AmountButton>
            ))}
          </AmountGrid>

          <CustomAmountWrapper>
            <CustomAmountLabel>직접 입력</CustomAmountLabel>
            <CustomAmountInputWrapper>
              <CustomAmountInput
                type="text"
                inputMode="numeric"
                placeholder="금액을 입력해주세요"
                value={
                  customAmount
                    ? parseInt(customAmount, 10).toLocaleString()
                    : ''
                }
                onChange={handleCustomAmountChange}
              />
              <InputSuffix>원</InputSuffix>
            </CustomAmountInputWrapper>
            <AmountHint>최소 1,000원 ~ 최대 1,000,000원</AmountHint>
          </CustomAmountWrapper>
        </Section>

        {/* 결제 수단 선택 */}
        <Section>
          <SectionTitle>결제 수단</SectionTitle>
          <PayMethodList>
            {PAY_METHODS.map((method) => (
              <PayMethodItem
                key={method.value}
                type="button"
                $selected={payMethod === method.value}
                onClick={() => setPayMethod(method.value)}
              >
                <RadioCircle $selected={payMethod === method.value}>
                  {payMethod === method.value && <RadioDot />}
                </RadioCircle>
                <PayMethodLabel>{method.label}</PayMethodLabel>
              </PayMethodItem>
            ))}
          </PayMethodList>
        </Section>

        {/* 충전하기 버튼 */}
        <ChargeButton
          type="button"
          disabled={!canSubmit}
          onClick={handleCharge}
        >
          {initiateChargeMutation.isPending
            ? '처리 중...'
            : isAmountValid
              ? `${finalAmount!.toLocaleString()}원 충전하기`
              : '충전하기'}
        </ChargeButton>
      </PageContainer>
    </>
  );
}

function parseCustomAmount(value: string): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
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

const Section = tw.div`
  space-y-3
`;

const SectionTitle = tw.h2`
  text-base
  font-semibold
  text-gray-900
`;

const AmountGrid = tw.div`
  grid
  grid-cols-3
  gap-2
`;

const AmountButton = tw.button<{ $selected: boolean }>`
  py-3
  rounded-lg
  text-sm
  font-medium
  border
  transition-colors
  ${(p) =>
    p.$selected
      ? 'border-blue-500 bg-blue-50 text-blue-600'
      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}
`;

const CustomAmountWrapper = tw.div`
  space-y-1
  pt-2
`;

const CustomAmountLabel = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const CustomAmountInputWrapper = tw.div`
  relative
  flex
  items-center
`;

const CustomAmountInput = tw.input`
  w-full
  px-3
  py-2
  pr-8
  border
  border-gray-300
  rounded-md
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
  text-sm
  text-right
`;

const InputSuffix = tw.span`
  absolute
  right-3
  text-sm
  text-gray-500
  pointer-events-none
`;

const AmountHint = tw.p`
  text-xs
  text-gray-400
`;

const PayMethodList = tw.div`
  space-y-2
`;

const PayMethodItem = tw.button<{ $selected: boolean }>`
  w-full
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  border
  transition-colors
  ${(p) =>
    p.$selected
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 bg-white hover:border-gray-300'}
`;

const RadioCircle = tw.div<{ $selected: boolean }>`
  w-5
  h-5
  rounded-full
  border-2
  flex
  items-center
  justify-center
  flex-shrink-0
  ${(p) => (p.$selected ? 'border-blue-500' : 'border-gray-300')}
`;

const RadioDot = tw.div`
  w-2.5
  h-2.5
  rounded-full
  bg-blue-500
`;

const PayMethodLabel = tw.span`
  text-sm
  font-medium
  text-gray-700
`;

const ChargeButton = tw.button`
  w-full
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
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;
