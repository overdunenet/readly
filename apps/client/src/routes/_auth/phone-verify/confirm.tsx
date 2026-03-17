import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { useAuthStore } from '../../../stores/auth';

import { useOtpTimer } from '@/hooks/useOtpTimer';
import { trpc } from '@/shared';

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
  }, [expiresAt, resendAvailableAt]);

  const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

  const handleVerify = async () => {
    try {
      setError(null);
      const result = await verifyOtp.mutateAsync({ phone, code });
      if (result.success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            phone: result.phone,
          });
        }
        navigate({ to: '/' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다');
    }
  };

  const handleResend = async () => {
    try {
      setError(null);
      const result = await requestOtp.mutateAsync({ phone });
      timer.reset(result.expiresAt, result.resendAvailableAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '재전송에 실패했습니다');
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate({ to: '/phone-verify' })}>
        ← 뒤로
      </BackButton>
      <Title>인증번호 입력</Title>
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
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />

        <TimerText $expired={timer.isExpired}>
          {timer.isExpired ? '인증번호가 만료되었습니다' : timer.formattedTime}
        </TimerText>

        {error && <ErrorText>{error}</ErrorText>}

        <VerifyButton
          onClick={handleVerify}
          disabled={code.length !== 6 || timer.isExpired || verifyOtp.isPending}
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
    </Container>
  );
}

export const Route = createFileRoute('/_auth/phone-verify/confirm')({
  component: OtpConfirmPage,
  validateSearch: searchSchema,
});

// Styled Components
const Container = tw.div`
  min-h-screen
  flex
  flex-col
  items-center
  justify-center
  px-4
`;

const BackButton = tw.button`
  self-start
  mb-8
  text-gray-500
  hover:text-gray-700
`;

const Title = tw.h1`
  text-2xl
  font-bold
  mb-2
`;

const Description = tw.p`
  text-gray-500
  mb-8
  text-center
`;

const FormWrapper = tw.div`
  w-full
  max-w-sm
  space-y-4
`;

const CodeInput = tw.input`
  w-full
  px-4
  py-3
  border
  rounded-lg
  text-center
  text-lg
  tracking-widest
  outline-none
  focus:border-black
`;

const TimerText = tw.p<{ $expired: boolean }>`
  text-center
  text-sm
  ${(p: { $expired: boolean }) => (p.$expired ? 'text-red-500' : 'text-gray-500')}
`;

const ErrorText = tw.p`
  text-red-500
  text-sm
  text-center
`;

const VerifyButton = tw.button`
  w-full
  py-3
  rounded-lg
  bg-black
  text-white
  font-medium
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const ResendButton = tw.button`
  w-full
  py-3
  rounded-lg
  border
  border-gray-300
  text-gray-700
  font-medium
  disabled:opacity-50
  disabled:cursor-not-allowed
`;
