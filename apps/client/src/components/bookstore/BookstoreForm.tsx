import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

// --- Schema ---

const formSchema = z.object({
  penName: z
    .string()
    .min(1, '필명을 입력해주세요')
    .max(30, '필명은 30자 이내여야 합니다'),
  storeName: z
    .string()
    .min(1, '서점 이름을 입력해주세요')
    .max(50, '서점 이름은 50자 이내여야 합니다'),
  agreedToTerms: z.boolean().optional(),
  bio: z.string().max(500).optional().or(z.literal('')),
  profileImage: z
    .string()
    .url('올바른 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
});

export type BookstoreFormData = z.infer<typeof formSchema>;

// --- Props ---

export interface BookstoreFormProps {
  mode: 'create' | 'edit';
  defaultValue?: {
    penName?: string;
    storeName?: string;
    bio?: string | null;
    profileImage?: string | null;
  };
  onSubmit: (data: BookstoreFormData) => void;
  isPending?: boolean;
  error?: string | null;
}

// --- Component ---

const BookstoreForm = (props: BookstoreFormProps) => {
  const isEdit = props.mode === 'edit';

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<BookstoreFormData>({
    resolver: zodResolver(
      isEdit
        ? formSchema
        : formSchema.refine((d) => d.agreedToTerms === true, {
            message: '약관에 동의해주세요',
            path: ['agreedToTerms'],
          }),
    ),
    mode: 'onChange',
    defaultValues: {
      penName: '',
      storeName: '',
      agreedToTerms: false,
      bio: '',
      profileImage: '',
    },
  });

  useEffect(() => {
    if (isEdit && props.defaultValue) {
      reset({
        penName: props.defaultValue.penName ?? '',
        storeName: props.defaultValue.storeName ?? '',
        bio: props.defaultValue.bio ?? '',
        profileImage: props.defaultValue.profileImage ?? '',
      });
    }
  }, [isEdit, props.defaultValue, reset]);

  return (
    <Form onSubmit={handleSubmit(props.onSubmit)}>
      {/* 공통 필드 */}
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

      {/* Edit 전용 필드 */}
      {isEdit && (
        <>
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
        </>
      )}

      {/* Create 전용 필드 */}
      {!isEdit && (
        <>
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
        </>
      )}

      {/* 에러 표시 (create 모드) */}
      {!isEdit && props.error && <AlertBox>{props.error}</AlertBox>}

      {/* 제출 버튼 */}
      <SubmitButton
        type="submit"
        disabled={
          isEdit ? !isDirty || props.isPending : !isValid || props.isPending
        }
      >
        {props.isPending
          ? isEdit
            ? '저장 중...'
            : '오픈 중...'
          : isEdit
            ? '저장'
            : '서점 오픈하기'}
      </SubmitButton>
    </Form>
  );
};

export default BookstoreForm;

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
