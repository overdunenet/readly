import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { trpc } from '@/shared';

const phoneSchema = z.object({
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 전화번호를 입력해주세요'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

function PhoneVerifyPage() {
  const navigate = useNavigate();
  const requestOtp = trpc.auth.phoneOtpRequest.useMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: PhoneFormData) => {
    try {
      setError(null);
      const result = await requestOtp.mutateAsync({ phone: data.phone });
      navigate({
        to: '/phone-verify/confirm',
        search: {
          phone: data.phone,
          expiresAt: result.expiresAt,
          resendAvailableAt: result.resendAvailableAt,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증번호 요청에 실패했습니다',
      );
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate({ to: '/' })}>← 뒤로</BackButton>
      <Title>전화번호 인증</Title>
      <Description>본인확인을 위해 전화번호를 인증해주세요.</Description>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Label>전화번호</Label>
          <InputWrapper>
            <CountryCode>+82</CountryCode>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="01012345678"
              maxLength={11}
            />
          </InputWrapper>
          {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
        </InputGroup>

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton type="submit" disabled={!isValid || requestOtp.isPending}>
          {requestOtp.isPending ? '전송 중...' : '인증번호 받기'}
        </SubmitButton>
      </Form>
    </Container>
  );
}

export const Route = createFileRoute('/_auth/phone-verify/')({
  component: PhoneVerifyPage,
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
`;

const Form = tw.form`
  w-full
  max-w-sm
  space-y-6
`;

const InputGroup = tw.div`
  space-y-2
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const InputWrapper = tw.div`
  flex
  items-center
  border
  rounded-lg
  overflow-hidden
`;

const CountryCode = tw.span`
  px-3
  py-3
  bg-gray-100
  text-gray-500
  text-sm
  border-r
`;

const Input = tw.input`
  flex-1
  px-3
  py-3
  outline-none
  text-sm
`;

const ErrorText = tw.p`
  text-red-500
  text-sm
`;

const SubmitButton = tw.button`
  w-full
  py-3
  rounded-lg
  bg-black
  text-white
  font-medium
  disabled:opacity-50
  disabled:cursor-not-allowed
`;
