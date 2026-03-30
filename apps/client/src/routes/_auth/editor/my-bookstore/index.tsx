import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import {
  BookstoreForm,
  BookstoreProfile,
  BookstoreNavMenu,
  CountryRestrictionNotice,
} from '@/components/bookstore';
import type { BookstoreFormData } from '@/components/bookstore/BookstoreForm';
import { trpc } from '@/shared';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_auth/editor/my-bookstore/')({
  component: MyBookstorePage,
});

function MyBookstorePage() {
  const user = useAuthStore((state) => state.user);
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const myBookstoreQuery = trpc.bookstore.getMyBookstore.useQuery(undefined, {
    retry: false,
  });

  const createMutation = trpc.bookstore.createBookstore.useMutation();

  const handleCreate = (data: BookstoreFormData) => {
    setError(null);
    createMutation
      .mutateAsync({
        penName: data.penName,
        storeName: data.storeName,
        termsAgreed: true,
      })
      .then(() => {
        utils.bookstore.getMyBookstore.invalidate();
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : '서점 오픈에 실패했습니다',
        );
      });
  };

  // 비한국 유저 안내
  if (user?.language !== 'ko' && myBookstoreQuery.error) {
    return <CountryRestrictionNotice />;
  }

  if (myBookstoreQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // 서점이 없으면 오픈 폼 표시 (별도 페이지 이동 아님)
  if (myBookstoreQuery.error || !myBookstoreQuery.data) {
    // 비한국 유저 안내
    if (user?.language !== 'ko') {
      return <CountryRestrictionNotice />;
    }

    return (
      <PageContainer>
        <OpenSection>
          <OpenTitle>서점 오픈</OpenTitle>
          <OpenDescription>
            서점을 오픈하고 작품을 발행해보세요.
          </OpenDescription>
          <BookstoreForm
            mode="create"
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            error={error}
          />
        </OpenSection>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BookstoreProfile bookstore={myBookstoreQuery.data} />
      <MenuSection>
        <BookstoreNavMenu bookstoreId={myBookstoreQuery.data.id} />
      </MenuSection>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = tw.div`
  p-6
  lg:p-8
  max-w-3xl
  mx-auto
  space-y-6
`;

const MenuSection = tw.div``;

const OpenSection = tw.div`
  space-y-6
`;

const OpenTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
`;

const OpenDescription = tw.p`
  text-sm
  text-gray-500
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;
