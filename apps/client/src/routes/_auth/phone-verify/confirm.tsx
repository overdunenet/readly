import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import SubLayout from '../../../components/layout/SubLayout';
import { useAuthStore } from '../../../stores/auth';

import { useOtpTimer } from '@/hooks/useOtpTimer';
import { trpc } from '@/shared';
import { getRedirectPathByStatus } from '../../../shared/utils/auth';

const searchSchema = z.object({
  phone: z.string(),
  expiresAt: z.string(),
  resendAvailableAt: z.string(),
});

function OtpConfirmPage() {
  const navigate = useNavigate();
  const { phone, expiresAt, resendAvailableAt } = Route.useSearch();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const timer = useOtpTimer();
  const verifyOtp = trpc.auth.phoneOtpVerify.useMutation();
  const requestOtp = trpc.auth.phoneOtpRequest.useMutation();

  useEffect(() => {
    timer.reset(expiresAt, resendAvailableAt);
  }, [expiresAt, resendAvailableAt, timer.reset]);

  const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

  const handleVerify = () => {
    setError(null);
    verifyOtp
      .mutateAsync({ phone, code })
      .then((result) => {
        if (result.success) {
          // 새 accessToken 저장
          useAuthStore.getState().setAccessToken(result.accessToken);
          // 서버에서 반환한 user 객체로 갱신
          useAuthStore.getState().setUser(result.user);

          navigate({ to: getRedirectPathByStatus(result.user.status) });
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '인증에 실패했습니다');
      });
  };

  const handleResend = () => {
    setError(null);
    requestOtp
      .mutateAsync({ phone })
      .then((result) => {
        timer.reset(result.expiresAt, result.resendAvailableAt);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : '재전송에 실패했습니다');
      });
  };

  return (
    <SubLayout
      title="인증번호 입력"
      onBack={() => navigate({ to: '/phone-verify' })}
    >
      <PageContainer>
        <Description>
          {formattedPhone}로 전송된 인증번호를 입력해주세요
        </Description>

        <FormWrapper>
          <CodeInput
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="인증번호 6자리"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCode(e.target.value.replace(/\D/g, ''))
            }
          />

          <TimerText $expired={timer.isExpired}>
            {timer.isExpired
              ? '인증번호가 만료되었습니다'
              : timer.formattedTime}
          </TimerText>

          {error && <AlertBox>{error}</AlertBox>}

          <VerifyButton
            onClick={handleVerify}
            disabled={
              code.length !== 6 || timer.isExpired || verifyOtp.isPending
            }
          >
            {verifyOtp.isPending ? '인증 중...' : '인증하기'}
          </VerifyButton>

          <ResendButton
            onClick={handleResend}
            disabled={!timer.canResend || requestOtp.isPending}
          >
            {requestOtp.isPending
              ? '전송 중...'
              : timer.canResend
                ? '인증번호 재전송'
                : `재전송 (${timer.resendSeconds}초)`}
          </ResendButton>
        </FormWrapper>
      </PageContainer>
    </SubLayout>
  );
}

export const Route = createFileRoute('/_auth/phone-verify/confirm')({
  component: OtpConfirmPage,
  validateSearch: searchSchema,
});

// Styled Components
const PageContainer = tw.div`
  px-4
  py-8
`;

const Description = tw.p`
  text-sm
  text-gray-500
  mb-8
`;

const FormWrapper = tw.div`
  space-y-4
`;

const CodeInput = tw.input`
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  text-center
  text-lg
  tracking-widest
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
`;

const TimerText = tw.p<{ $expired: boolean }>`
  text-center
  text-sm
  ${(p: { $expired: boolean }) => (p.$expired ? 'text-red-600' : 'text-gray-500')}
`;

const AlertBox = tw.div`
  p-3
  bg-red-50
  border
  border-red-200
  rounded-md
  text-sm
  text-red-700
`;

const VerifyButton = tw.button`
  w-full
  py-2
  px-4
  bg-blue-600
  text-white
  font-medium
  rounded-md
  hover:bg-blue-700
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const ResendButton = tw.button`
  w-full
  py-2
  px-4
  border
  border-gray-300
  text-gray-700
  font-medium
  rounded-md
  hover:bg-gray-50
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;
