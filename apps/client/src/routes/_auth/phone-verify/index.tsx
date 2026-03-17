import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import SubLayout from '../../../components/layout/SubLayout';

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
    <SubLayout title="전화번호 인증" onBack={() => navigate({ to: '/' })}>
      <PageContainer>
        <Description>본인확인을 위해 전화번호를 인증해주세요.</Description>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
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
            {errors.phone && (
              <ErrorMessage>{errors.phone.message}</ErrorMessage>
            )}
          </FormGroup>

          {error && <AlertBox>{error}</AlertBox>}

          <SubmitButton
            type="submit"
            disabled={!isValid || requestOtp.isPending}
          >
            {requestOtp.isPending ? '전송 중...' : '인증번호 받기'}
          </SubmitButton>
        </Form>
      </PageContainer>
    </SubLayout>
  );
}

export const Route = createFileRoute('/_auth/phone-verify/')({
  component: PhoneVerifyPage,
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

const Form = tw.form`
  space-y-6
`;

const FormGroup = tw.div`
  space-y-1
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
  mt-1
`;

const CountryCode = tw.span`
  px-3
  py-2
  bg-gray-100
  text-gray-500
  text-sm
  border
  border-r-0
  border-gray-300
  rounded-l-md
`;

const Input = tw.input`
  flex-1
  px-3
  py-2
  border
  border-gray-300
  rounded-r-md
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
  text-sm
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
  mt-1
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

const SubmitButton = tw.button`
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
