import { createFileRoute } from '@tanstack/react-router';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { BookstoreForm } from '@/components/bookstore';
import type { BookstoreFormData } from '@/components/bookstore/BookstoreForm';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/my-bookstore/settings')({
  component: ProfileEditPage,
});

function ProfileEditPage() {
  const [bookstore] = trpc.bookstore.getMyBookstore.useSuspenseQuery();
  const utils = trpc.useUtils();

  const updateProfileMutation = trpc.bookstore.updateProfile.useMutation({
    onSuccess: () => {
      utils.bookstore.getMyBookstore.invalidate();
      void SnappyModal.show(
        <AlertModal title="저장 완료" message="프로필이 수정되었습니다." />,
      );
    },
    onError: (error) => {
      void SnappyModal.show(
        <AlertModal title="저장 실패" message={error.message} />,
      );
    },
  });

  const handleSubmit = (data: BookstoreFormData) => {
    updateProfileMutation.mutate({
      penName: data.penName,
      storeName: data.storeName,
      bio: data.bio || undefined,
      profileImage: data.profileImage || undefined,
    });
  };

  return (
    <PageContainer>
      <PageTitle>프로필 편집</PageTitle>
      <BookstoreForm
        mode="edit"
        defaultValue={bookstore}
        onSubmit={handleSubmit}
        isPending={updateProfileMutation.isPending}
      />
    </PageContainer>
  );
}

// Styled Components
const PageContainer = tw.div`
  p-6
  lg:p-8
  max-w-3xl
  mx-auto
`;

const PageTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-6
`;
