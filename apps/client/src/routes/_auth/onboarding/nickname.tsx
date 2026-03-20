import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import SubLayout from '../../../components/layout/SubLayout';
import { nicknameSchema as nicknameFieldSchema } from '../../../shared/schemas';
import { useAuthStore } from '../../../stores/auth';

import { trpc } from '@/shared';

const nicknameSchema = z.object({
  nickname: nicknameFieldSchema,
});

type NicknameForm = z.infer<typeof nicknameSchema>;

function NicknameSettingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const updateProfile = trpc.user.updateProfile.useMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: user?.nickname?.startsWith('user_') ? '' : user?.nickname || '',
    },
  });

  const onSubmit = (data: NicknameForm) => {
    setError(null);
    updateProfile
      .mutateAsync({ nickname: data.nickname })
      .then((result) => {
        setUser(result);
        navigate({ to: '/' });
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : '프로필 설정에 실패했습니다',
        );
      });
  };

  return (
    <SubLayout title="프로필 설정">
      <PageContainer>
        <Description>서비스에서 사용할 닉네임을 설정해주세요.</Description>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>닉네임</Label>
            <Input
              {...register('nickname')}
              placeholder="닉네임을 입력해주세요"
              maxLength={30}
            />
            {errors.nickname && (
              <ErrorMessage>{errors.nickname.message}</ErrorMessage>
            )}
          </FormGroup>

          {error && <AlertBox>{error}</AlertBox>}

          <SubmitButton
            type="submit"
            disabled={!isValid || updateProfile.isPending}
          >
            {updateProfile.isPending ? '설정 중...' : '완료'}
          </SubmitButton>
        </Form>
      </PageContainer>
    </SubLayout>
  );
}

export const Route = createFileRoute('/_auth/onboarding/nickname')({
  component: NicknameSettingPage,
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

const Input = tw.input`
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
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
