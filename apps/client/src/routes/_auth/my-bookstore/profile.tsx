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

export const Route = createFileRoute('/_auth/my-bookstore/profile')({
  component: ProfileEditPage,
});

const profileFormSchema = z.object({
  penName: z.string().min(1, '필명을 입력해주세요').max(30),
  storeName: z.string().min(1, '서점 이름을 입력해주세요').max(50),
  bio: z.string().max(500).optional().or(z.literal('')),
  profileImage: z
    .string()
    .url('올바른 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
});

type ProfileFormType = z.infer<typeof profileFormSchema>;

function ProfileEditPage() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const myBookstoreQuery = trpc.bookstore.getMyBookstore.useQuery(undefined, {
    retry: false,
  });

  const updateProfileMutation = trpc.bookstore.updateProfile.useMutation({
    onSuccess: () => {
      utils.bookstore.getMyBookstore.invalidate();
      SnappyModal.show(
        <AlertModal title="저장 완료" message="프로필이 수정되었습니다." />,
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
    formState: { errors, isDirty },
  } = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    defaultValues: {
      penName: '',
      storeName: '',
      bio: '',
      profileImage: '',
    },
  });

  useEffect(() => {
    if (myBookstoreQuery.data) {
      reset({
        penName: myBookstoreQuery.data.penName,
        storeName: myBookstoreQuery.data.storeName,
        bio: myBookstoreQuery.data.bio ?? '',
        profileImage: myBookstoreQuery.data.profileImage ?? '',
      });
    }
  }, [myBookstoreQuery.data, reset]);

  useEffect(() => {
    if (myBookstoreQuery.error) {
      navigate({ to: '/bookstore/open' });
    }
  }, [myBookstoreQuery.error, navigate]);

  const onSubmit = (data: ProfileFormType) => {
    updateProfileMutation.mutate({
      penName: data.penName,
      storeName: data.storeName,
      bio: data.bio || undefined,
      profileImage: data.profileImage || undefined,
    });
  };

  if (myBookstoreQuery.isLoading) {
    return (
      <SubLayout title="프로필 편집">
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </SubLayout>
    );
  }

  if (!myBookstoreQuery.data) {
    return null;
  }

  return (
    <SubLayout title="프로필 편집">
      <PageContainer>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Label>필명</Label>
            <Controller
              name="penName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="필명을 입력하세요"
                  maxLength={30}
                />
              )}
            />
            {errors.penName && <ErrorText>{errors.penName.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label>서점 이름</Label>
            <Controller
              name="storeName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="서점 이름을 입력하세요"
                  maxLength={50}
                />
              )}
            />
            {errors.storeName && (
              <ErrorText>{errors.storeName.message}</ErrorText>
            )}
          </FieldGroup>

          <FieldGroup>
            <Label>소개</Label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="서점 소개를 입력하세요"
                  rows={4}
                  maxLength={500}
                />
              )}
            />
            {errors.bio && <ErrorText>{errors.bio.message}</ErrorText>}
          </FieldGroup>

          <FieldGroup>
            <Label>프로필 이미지 URL</Label>
            <Controller
              name="profileImage"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="https://example.com/image.jpg" />
              )}
            />
            {errors.profileImage && (
              <ErrorText>{errors.profileImage.message}</ErrorText>
            )}
          </FieldGroup>

          <SubmitButton
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? '저장 중...' : '저장'}
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

const Textarea = tw.textarea`
  w-full
  px-3
  py-2.5
  border
  border-gray-300
  rounded-lg
  text-sm
  resize-none
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const ErrorText = tw.p`
  text-xs
  text-red-500
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
