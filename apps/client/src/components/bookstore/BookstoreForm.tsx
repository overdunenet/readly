import { zodResolver } from '@hookform/resolvers/zod';
import type { AppRouter } from '@readly/api-types/src/server';
import type { inferRouterOutputs } from '@trpc/server';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Bookstore = RouterOutputs['bookstore']['getMyBookstore'];

const createSchema = z.object({
  penName: z
    .string()
    .min(1, '필명을 입력해주세요')
    .max(30, '필명은 30자 이내여야 합니다'),
  storeName: z
    .string()
    .min(1, '서점 이름을 입력해주세요')
    .max(50, '서점 이름은 50자 이내여야 합니다'),
  agreedToTerms: z.boolean().refine((v) => v === true, '약관에 동의해주세요'),
});

const editSchema = z.object({
  penName: z
    .string()
    .min(1, '필명을 입력해주세요')
    .max(30, '필명은 30자 이내여야 합니다'),
  storeName: z
    .string()
    .min(1, '서점 이름을 입력해주세요')
    .max(50, '서점 이름은 50자 이내여야 합니다'),
  bio: z.string().max(500).optional().or(z.literal('')),
  profileImage: z
    .string()
    .url('올바른 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
});

type CreateFormType = z.infer<typeof createSchema>;
type EditFormType = z.infer<typeof editSchema>;

interface CreateModeProps {
  mode: 'create';
  onSuccess: () => void;
}

interface EditModeProps {
  mode: 'edit';
  bookstore: Bookstore;
}

type BookstoreFormProps = CreateModeProps | EditModeProps;

const BookstoreForm = (props: BookstoreFormProps) => {
  if (props.mode === 'create') {
    return <CreateForm onSuccess={props.onSuccess} />;
  }
  return <EditForm bookstore={props.bookstore} />;
};

export default BookstoreForm;

// --- Create Form ---

const CreateForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [error, setError] = useState<string | null>(null);
  const openMutation = trpc.bookstore.open.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateFormType>({
    resolver: zodResolver(createSchema),
    mode: 'onChange',
    defaultValues: {
      penName: '',
      storeName: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = (data: CreateFormType) => {
    setError(null);
    openMutation
      .mutateAsync({
        penName: data.penName,
        storeName: data.storeName,
        termsAgreed: true,
      })
      .then(() => {
        onSuccess();
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : '서점 오픈에 실패했습니다',
        );
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Label>필명</Label>
        <Input
          {...register('penName')}
          placeholder="서점에서 사용할 필명을 입력해주세요"
          maxLength={30}
        />
        {errors.penName && <ErrorText>{errors.penName.message}</ErrorText>}
      </FieldGroup>

      <FieldGroup>
        <Label>서점 이름</Label>
        <Input
          {...register('storeName')}
          placeholder="서점 이름을 입력해주세요"
          maxLength={50}
        />
        {errors.storeName && <ErrorText>{errors.storeName.message}</ErrorText>}
      </FieldGroup>

      <CheckboxGroup>
        <CheckboxInput
          type="checkbox"
          id="agreedToTerms"
          {...register('agreedToTerms')}
        />
        <CheckboxLabel htmlFor="agreedToTerms">
          서점 운영 약관에 동의합니다
        </CheckboxLabel>
      </CheckboxGroup>
      {errors.agreedToTerms && (
        <ErrorText>{errors.agreedToTerms.message}</ErrorText>
      )}

      {error && <AlertBox>{error}</AlertBox>}

      <SubmitButton type="submit" disabled={!isValid || openMutation.isPending}>
        {openMutation.isPending ? '오픈 중...' : '서점 오픈하기'}
      </SubmitButton>
    </Form>
  );
};

// --- Edit Form ---

const EditForm = ({ bookstore }: { bookstore: Bookstore }) => {
  const utils = trpc.useUtils();

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
  } = useForm<EditFormType>({
    resolver: zodResolver(editSchema),
    mode: 'onChange',
    defaultValues: {
      penName: '',
      storeName: '',
      bio: '',
      profileImage: '',
    },
  });

  useEffect(() => {
    reset({
      penName: bookstore.penName,
      storeName: bookstore.storeName,
      bio: bookstore.bio ?? '',
      profileImage: bookstore.profileImage ?? '',
    });
  }, [bookstore, reset]);

  const onSubmit = (data: EditFormType) => {
    updateProfileMutation.mutate({
      penName: data.penName,
      storeName: data.storeName,
      bio: data.bio || undefined,
      profileImage: data.profileImage || undefined,
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Label>필명</Label>
        <Controller
          name="penName"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="필명을 입력하세요" maxLength={30} />
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
        {errors.storeName && <ErrorText>{errors.storeName.message}</ErrorText>}
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
  );
};

// Styled Components
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

const CheckboxGroup = tw.div`
  flex
  items-center
  gap-2
`;

const CheckboxInput = tw.input`
  w-4
  h-4
  text-blue-600
  border-gray-300
  rounded
  focus:ring-blue-500
`;

const CheckboxLabel = tw.label`
  text-sm
  text-gray-700
  cursor-pointer
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
