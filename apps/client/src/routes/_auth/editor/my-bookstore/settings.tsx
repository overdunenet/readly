import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { trpc } from '@/shared';
import { PUBLISH_ACCESS_LEVEL_OPTIONS } from '@/shared/constants/access-level';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/editor/my-bookstore/settings')({
  component: SettingsPage,
});

const settingsFormSchema = z.object({
  defaultAccessLevel: z.enum(['public', 'subscriber', 'purchaser']),
  defaultPrice: z.number().int().min(0, '0 이상 입력해주세요'),
  defaultAgeRating: z.enum(['all', 'adult']),
});

type SettingsFormType = z.infer<typeof settingsFormSchema>;

const AGE_RATING_OPTIONS = [
  { value: 'all', label: '전체이용가' },
  { value: 'adult', label: '성인' },
] as const;

function SettingsPage() {
  const utils = trpc.useUtils();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [settings] = trpc.bookstore.getSettings.useSuspenseQuery();

  const updateSettingsMutation = trpc.bookstore.updateSettings.useMutation({
    onSuccess: () => {
      utils.bookstore.getSettings.invalidate();
      setToastMessage('발행 설정이 저장되었습니다.');
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
      defaultAccessLevel: settings.defaultAccessLevel,
      defaultPrice: settings.defaultPrice,
      defaultAgeRating: settings.defaultAgeRating,
    },
  });

  useEffect(() => {
    reset({
      defaultAccessLevel: settings.defaultAccessLevel,
      defaultPrice: settings.defaultPrice,
      defaultAgeRating: settings.defaultAgeRating,
    });
  }, [settings, reset]);

  // toast 자동 사라짐
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const onSubmit = (data: SettingsFormType) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <PageContainer>
      <PageTitle>발행 설정</PageTitle>
      <Description>새 글을 작성할 때 적용되는 기본 설정입니다.</Description>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label>기본 접근 레벨</Label>
          <Controller
            name="defaultAccessLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange}>
                {PUBLISH_ACCESS_LEVEL_OPTIONS.map((option) => (
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
                value={field.value === 0 ? '' : field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(
                    e.target.value === ''
                      ? 0
                      : parseInt(e.target.value, 10) || 0,
                  )
                }
                onBlur={() => {
                  if (field.value === 0) field.onChange(0);
                }}
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

      {toastMessage && <Toast>{toastMessage}</Toast>}
    </PageContainer>
  );
}

// Styled Components
const PageContainer = tw.div`
  p-6
  lg:p-8
  max-w-3xl
  mx-auto
  relative
`;

const PageTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
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

const Toast = tw.div`
  fixed
  bottom-6
  left-1/2
  -translate-x-1/2
  px-4
  py-2.5
  bg-gray-900
  text-white
  text-sm
  rounded-lg
  shadow-lg
  animate-fade-in
  z-50
`;
