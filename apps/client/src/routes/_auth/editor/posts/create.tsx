import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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

export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});

function CreatePostPage() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const createPostMutation = trpc.post.create.useMutation({
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="포스트 작성 실패" message={error.message} />,
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

      navigate({ to: '/editor/posts' });
    } catch (error) {
      setIsPublishing(false);
      setIsDrafting(false);
      console.error('Post creation failed:', error);
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
      <HeaderSection
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
