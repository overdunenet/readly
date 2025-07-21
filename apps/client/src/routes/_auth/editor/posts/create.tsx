import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { trpc } from '../../../../shared/trpc';

export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});

function CreatePostPage() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: (post) => {
      navigate({
        to: '/editor/posts',
        search: { created: post.id },
      });
    },
    onError: (error) => {
      alert(`포스트 작성 실패: ${error.message}`);
    },
  });

  const publishPostMutation = trpc.post.publish.useMutation({
    onSuccess: () => {
      navigate({
        to: '/editor/posts',
        search: { published: 'success' },
      });
    },
    onError: (error) => {
      alert(`포스트 발행 실패: ${error.message}`);
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      accessLevel: 'public',
      price: 0,
    },
    mode: 'onChange',
  });

  const watchedAccessLevel = watch('accessLevel');

  const onSubmit = async (data: CreatePostForm, shouldPublish = false) => {
    try {
      if (shouldPublish) {
        setIsPublishing(true);
      } else {
        setIsDrafting(true);
      }

      // Create post
      const post = await createPostMutation.mutateAsync({
        ...data,
        price: data.accessLevel === 'purchaser' ? data.price : undefined,
      });

      // If should publish, publish it immediately
      if (shouldPublish) {
        await publishPostMutation.mutateAsync({ postId: post.id });
      }
    } catch (error) {
      console.error('Post creation failed:', error);
    } finally {
      setIsPublishing(false);
      setIsDrafting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  const handlePublish = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton
            onClick={() => navigate({ to: '/editor/posts' })}
            type="button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            뒤로
          </BackButton>
          <Title>새 포스트 작성</Title>
        </HeaderLeft>

        <HeaderRight>
          <SaveButton
            onClick={handleSaveDraft}
            disabled={!isValid || isDrafting || isPublishing}
            type="button"
          >
            {isDrafting ? '저장 중...' : '임시저장'}
          </SaveButton>
          <PublishButton
            onClick={handlePublish}
            disabled={!isValid || isDrafting || isPublishing}
            type="button"
          >
            {isPublishing ? '발행 중...' : '발행'}
          </PublishButton>
        </HeaderRight>
      </Header>

      <Form>
        <FormSection>
          <FormField>
            <Label>제목 *</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TitleInput
                  {...field}
                  placeholder="포스트 제목을 입력하세요"
                  hasError={!!errors.title}
                />
              )}
            />
            {errors.title && (
              <ErrorMessage>{errors.title.message}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label>내용 *</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <EditorWrapper hasError={!!errors.content}>
                  <ReactQuill
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="포스트 내용을 작성하세요"
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                  />
                </EditorWrapper>
              )}
            />
            {errors.content && (
              <ErrorMessage>{errors.content.message}</ErrorMessage>
            )}
          </FormField>
        </FormSection>

        <FormSection>
          <SectionTitle>접근 권한 설정</SectionTitle>

          <FormField>
            <Label>접근 권한 *</Label>
            <Controller
              name="accessLevel"
              control={control}
              render={({ field }) => (
                <AccessLevelGrid>
                  {accessLevelOptions.map((option) => (
                    <AccessLevelOption key={option.value}>
                      <AccessLevelRadio
                        {...field}
                        type="radio"
                        value={option.value}
                        id={option.value}
                        checked={field.value === option.value}
                      />
                      <AccessLevelLabel
                        htmlFor={option.value}
                        isSelected={field.value === option.value}
                      >
                        <AccessLevelTitle>{option.label}</AccessLevelTitle>
                        <AccessLevelDescription>
                          {option.description}
                        </AccessLevelDescription>
                      </AccessLevelLabel>
                    </AccessLevelOption>
                  ))}
                </AccessLevelGrid>
              )}
            />
            {errors.accessLevel && (
              <ErrorMessage>{errors.accessLevel.message}</ErrorMessage>
            )}
          </FormField>

          {watchedAccessLevel === 'purchaser' && (
            <FormField>
              <Label>판매 가격 *</Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <PriceInputWrapper>
                    <PriceInput
                      {...field}
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.onChange(Number(e.target.value))
                      }
                      hasError={!!errors.price}
                    />
                    <PriceUnit>원</PriceUnit>
                  </PriceInputWrapper>
                )}
              />
              {errors.price && (
                <ErrorMessage>{errors.price.message}</ErrorMessage>
              )}
              <FieldHint>1,000원 단위로 입력해주세요</FieldHint>
            </FormField>
          )}
        </FormSection>
      </Form>
    </Container>
  );
}

// Form validation schema
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이하로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  accessLevel: z.enum(['public', 'subscriber', 'purchaser', 'private'], {
    required_error: '접근 권한을 선택해주세요',
  }),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

// ReactQuill configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
  'image',
];

const accessLevelOptions = [
  { value: 'public', label: '전체 공개', description: '누구나 볼 수 있습니다' },
  {
    value: 'subscriber',
    label: '구독자 전용',
    description: '구독자만 볼 수 있습니다',
  },
  {
    value: 'purchaser',
    label: '구매자 전용',
    description: '개별 구매한 사람만 볼 수 있습니다',
  },
  { value: 'private', label: '비공개', description: '작성자만 볼 수 있습니다' },
] as const;

// Styled Components
const Container = tw.div`
  max-w-4xl
  mx-auto
  p-6
  lg:p-8
`;

const Header = tw.div`
  flex
  items-center
  justify-between
  mb-8
  pb-4
  border-b
  border-gray-200
`;

const HeaderLeft = tw.div`
  flex
  items-center
  gap-4
`;

const HeaderRight = tw.div`
  flex
  items-center
  gap-3
`;

const BackButton = tw.button`
  flex
  items-center
  gap-2
  px-3
  py-2
  text-gray-600
  hover:text-gray-900
  hover:bg-gray-100
  rounded-lg
  transition-colors
`;

const Title = tw.h1`
  text-2xl
  lg:text-3xl
  font-bold
  text-gray-900
`;

const SaveButton = tw.button`
  px-4
  py-2
  text-gray-700
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const PublishButton = tw.button`
  px-6
  py-2
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const Form = tw.div`
  space-y-8
`;

const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-gray-200
  p-6
  space-y-6
`;

const SectionTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-4
`;

const FormField = tw.div`
  space-y-2
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const Input = tw.input<{ hasError?: boolean }>`
  w-full
  px-3
  py-2
  border
  ${(p) => (p.hasError ? 'border-red-300' : 'border-gray-300')}
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
`;

const TitleInput = tw(Input)`
  text-lg
  font-medium
`;

const EditorWrapper = tw.div<{ hasError?: boolean }>`
  ${(p) => (p.hasError ? 'border border-red-300' : 'border border-gray-300')}
  rounded-lg
  overflow-hidden
`;

const AccessLevelGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  gap-4
`;

const AccessLevelOption = tw.div`
  relative
`;

const AccessLevelRadio = tw.input`
  sr-only
`;

const AccessLevelLabel = tw.label<{ isSelected: boolean }>`
  block
  p-4
  border
  ${(p) => (p.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}
  rounded-lg
  cursor-pointer
  hover:border-gray-300
  transition-colors
`;

const AccessLevelTitle = tw.div`
  font-medium
  text-gray-900
  mb-1
`;

const AccessLevelDescription = tw.div`
  text-sm
  text-gray-600
`;

const PriceInputWrapper = tw.div`
  relative
  max-w-xs
`;

const PriceInput = tw(Input)`
  pr-10
`;

const PriceUnit = tw.span`
  absolute
  right-3
  top-1/2
  transform
  -translate-y-1/2
  text-gray-500
  text-sm
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
`;

const FieldHint = tw.p`
  text-sm
  text-gray-500
`;
