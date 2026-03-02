import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { FormEditorSection } from '@/components/posts/create/FormEditorSection.tsx';
import { HeaderSection } from '@/components/posts/create/HeaderSection.tsx';
import { PermissionPriceSection } from '@/components/posts/create/PermissionPriceSection.tsx';
import {
  createPostSchema,
  CreatePostForm,
} from '@/components/posts/create/types.ts';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal.tsx';

export const Route = createFileRoute('/_auth/editor/posts/$postId/edit')({
  component: EditPostPage,
});

function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = Route.useParams();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const {
    data: postData,
    isLoading,
    error,
  } = trpc.post.getOne.useQuery({ postId });

  const updatePostMutation = trpc.post.update.useMutation({
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="포스트 수정 실패" message={error.message} />,
      );
    },
  });

  const publishPostMutation = trpc.post.publish.useMutation({
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="포스트 발행 실패" message={error.message} />,
      );
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
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

  useEffect(() => {
    if (postData) {
      reset({
        title: postData.title,
        content: postData.content,
        accessLevel: postData.accessLevel,
        price: postData.price ?? 0,
      });
    }
  }, [postData, reset]);

  const watchedAccessLevel = watch('accessLevel');

  const mode = postData?.status === 'published' ? 'editPublished' : 'editDraft';

  const onSubmit = async (data: CreatePostForm, shouldPublish = false) => {
    try {
      if (shouldPublish) {
        setIsPublishing(true);
      } else {
        setIsDrafting(true);
      }

      // Update post
      await updatePostMutation.mutateAsync({
        postId,
        data: {
          ...data,
          price: data.accessLevel === 'purchaser' ? data.price : undefined,
        },
      });

      // If should publish AND post is not already published
      if (shouldPublish && postData?.status !== 'published') {
        await publishPostMutation.mutateAsync({ postId });
      }

      navigate({ to: '/editor/posts' });
    } catch (error) {
      setIsPublishing(false);
      setIsDrafting(false);
      console.error('Post update failed:', error);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  const handlePublish = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingWrapper>로딩 중...</LoadingWrapper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorWrapper>포스트를 찾을 수 없습니다.</ErrorWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderSection
        title="포스트 편집"
        mode={mode}
        isValid={isValid}
        isDrafting={isDrafting}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <Form>
        <FormEditorSection control={control} errors={errors} />

        <PermissionPriceSection
          control={control}
          errors={errors}
          watchedAccessLevel={watchedAccessLevel}
        />
      </Form>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  max-w-4xl
  mx-auto
  p-6
  lg:p-8
`;

const Form = tw.div`
  space-y-8
`;

const LoadingWrapper = tw.div`
  text-center
  py-12
  text-gray-500
`;

const ErrorWrapper = tw.div`
  text-center
  py-12
  text-red-500
`;
