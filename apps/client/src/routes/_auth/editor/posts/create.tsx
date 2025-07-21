import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { FormEditorSection } from '../../../../components/posts/create/FormEditorSection';
import { HeaderSection } from '../../../../components/posts/create/HeaderSection';
import { PermissionPriceSection } from '../../../../components/posts/create/PermissionPriceSection';
import {
  createPostSchema,
  CreatePostForm,
} from '../../../../components/posts/create/types';
import { trpc } from '../../../../shared/trpc';

export const Route = createFileRoute('/_auth/editor/posts/create')({
  component: CreatePostPage,
});

function CreatePostPage() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const createPostMutation = trpc.post.create.useMutation({
    onError: (error) => {
      alert(`포스트 작성 실패: ${error.message}`);
    },
  });

  const publishPostMutation = trpc.post.publish.useMutation({
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
