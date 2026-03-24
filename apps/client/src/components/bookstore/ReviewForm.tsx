import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

interface ReviewFormProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const reviewFormSchema = z.object({
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(500, '500자 이내로 입력해주세요'),
});

type ReviewFormType = z.infer<typeof reviewFormSchema>;

const ReviewForm = ({
  initialContent = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = '등록',
}: ReviewFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ReviewFormType>({
    resolver: zodResolver(reviewFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: initialContent,
    },
  });

  const handleFormSubmit = (data: ReviewFormType) => {
    onSubmit(data.content);
  };

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder="응원 글을 남겨주세요"
            rows={3}
            maxLength={500}
          />
        )}
      />
      {errors.content && <ErrorText>{errors.content.message}</ErrorText>}
      <ButtonGroup>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel}>
            취소
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? '처리 중...' : submitLabel}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};

export default ReviewForm;

// Styled Components
const Form = tw.form`
  space-y-3
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

const ButtonGroup = tw.div`
  flex
  justify-end
  gap-2
`;

const CancelButton = tw.button`
  px-4
  py-2
  text-sm
  text-gray-600
  bg-gray-100
  rounded-lg
  hover:bg-gray-200
  transition-colors
`;

const SubmitButton = tw.button`
  px-4
  py-2
  text-sm
  text-white
  bg-blue-600
  rounded-lg
  hover:bg-blue-700
  transition-colors
  disabled:bg-gray-300
  disabled:cursor-not-allowed
`;
