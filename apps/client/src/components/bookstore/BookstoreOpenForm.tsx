import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { trpc } from '@/shared';

const bookstoreOpenSchema = z.object({
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

type BookstoreOpenFormValues = z.infer<typeof bookstoreOpenSchema>;

interface BookstoreOpenFormProps {
  onSuccess: () => void;
}

const BookstoreOpenForm = ({ onSuccess }: BookstoreOpenFormProps) => {
  const [error, setError] = useState<string | null>(null);

  const openMutation = trpc.bookstore.open.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BookstoreOpenFormValues>({
    resolver: zodResolver(bookstoreOpenSchema),
    mode: 'onChange',
    defaultValues: {
      penName: '',
      storeName: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = (data: BookstoreOpenFormValues) => {
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
      <FormGroup>
        <Label>필명</Label>
        <Input
          {...register('penName')}
          placeholder="서점에서 사용할 필명을 입력해주세요"
          maxLength={30}
        />
        {errors.penName && (
          <ErrorMessage>{errors.penName.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label>서점 이름</Label>
        <Input
          {...register('storeName')}
          placeholder="서점 이름을 입력해주세요"
          maxLength={50}
        />
        {errors.storeName && (
          <ErrorMessage>{errors.storeName.message}</ErrorMessage>
        )}
      </FormGroup>

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
        <ErrorMessage>{errors.agreedToTerms.message}</ErrorMessage>
      )}

      {error && <AlertBox>{error}</AlertBox>}

      <SubmitButton type="submit" disabled={!isValid || openMutation.isPending}>
        {openMutation.isPending ? '오픈 중...' : '서점 오픈하기'}
      </SubmitButton>
    </Form>
  );
};

export default BookstoreOpenForm;

// Styled Components
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
