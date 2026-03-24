import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import SubLayout from '../../../components/layout/SubLayout';

import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/my-bookstore/settings')({
  component: SettingsPage,
});

const settingsFormSchema = z.object({
  defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']),
  defaultPrice: z.number().int().min(0, '0 이상 입력해주세요'),
  defaultAgeRating: z.enum(['all', 'adult']),
});

type SettingsFormType = z.infer<typeof settingsFormSchema>;

const ACCESS_LEVEL_OPTIONS = [
  { value: 'public', label: '전체공개' },
  { value: 'subscriber', label: '구독자 전용' },
  { value: 'purchaser', label: '구매자 전용' },
] as const;

const AGE_RATING_OPTIONS = [
  { value: 'all', label: '전체이용가' },
  { value: 'adult', label: '성인' },
] as const;

function SettingsPage() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const settingsQuery = trpc.bookstore.getSettings.useQuery(undefined, {
    retry: false,
  });

  const updateSettingsMutation = trpc.bookstore.updateSettings.useMutation({
    onSuccess: () => {
      utils.bookstore.getSettings.invalidate();
      SnappyModal.show(
        <AlertModal title="저장 완료" message="발행 설정이 저장되었습니다." />,
      );
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="저장 실패" message={error.message} />,
      );
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<SettingsFormType>({
    resolver: zodResolver(settingsFormSchema),
    mode: 'onChange',
    defaultValues: {
      defaultAccessLevel: 'public',
      defaultPrice: 0,
      defaultAgeRating: 'all',
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset({
        defaultAccessLevel: settingsQuery.data.defaultAccessLevel,
        defaultPrice: settingsQuery.data.defaultPrice,
        defaultAgeRating: settingsQuery.data.defaultAgeRating,
      });
    }
  }, [settingsQuery.data, reset]);

  useEffect(() => {
    if (settingsQuery.error) {
      navigate({ to: '/bookstore/open' });
    }
  }, [settingsQuery.error, navigate]);

  const onSubmit = (data: SettingsFormType) => {
    updateSettingsMutation.mutate(data);
  };

  if (settingsQuery.isLoading) {
    return (
      <SubLayout title="발행 설정">
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </SubLayout>
    );
  }

  return (
    <SubLayout title="발행 설정">
      <PageContainer>
        <Description>새 글을 작성할 때 적용되는 기본 설정입니다.</Description>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Label>기본 접근 레벨</Label>
            <Controller
              name="defaultAccessLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  {ACCESS_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>기본 가격</Label>
            <Controller
              name="defaultPrice"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(Number(e.target.value))
                  }
                  placeholder="0"
                />
              )}
            />
            <HelpText>무료인 경우 0을 입력하세요</HelpText>
          </FieldGroup>

          <FieldGroup>
            <Label>기본 연령 등급</Label>
            <Controller
              name="defaultAgeRating"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  {AGE_RATING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FieldGroup>

          <SubmitButton
            type="submit"
            disabled={!isDirty || updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? '저장 중...' : '저장'}
          </SubmitButton>
        </Form>
      </PageContainer>
    </SubLayout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
`;

const Description = tw.p`
  text-sm
  text-gray-500
  mb-6
`;

const Form = tw.form`
  space-y-6
`;

const FieldGroup = tw.div`
  flex
  flex-col
  gap-1.5
`;

const Label = tw.label`
  text-sm
  font-medium
  text-gray-700
`;

const Select = tw.select`
  w-full
  px-3
  py-2.5
  border
  border-gray-300
  rounded-lg
  text-sm
  bg-white
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const Input = tw.input`
  w-full
  px-3
  py-2.5
  border
  border-gray-300
  rounded-lg
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const HelpText = tw.p`
  text-xs
  text-gray-400
`;

const SubmitButton = tw.button`
  w-full
  py-3
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  transition-colors
  disabled:bg-gray-300
  disabled:cursor-not-allowed
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;
