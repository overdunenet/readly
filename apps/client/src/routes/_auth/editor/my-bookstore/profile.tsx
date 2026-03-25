import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { BookstoreForm } from '@/components/bookstore';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/editor/my-bookstore/profile')({
  component: ProfileEditPage,
});

function ProfileEditPage() {
  const [bookstore] = trpc.bookstore.getMyBookstore.useSuspenseQuery();

  return (
    <PageContainer>
      <PageTitle>프로필 편집</PageTitle>
      <BookstoreForm mode="edit" bookstore={bookstore} />
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
