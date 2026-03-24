import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import tw from 'tailwind-styled-components';

import SubLayout from '../../../components/layout/SubLayout';

import { BookstoreHeader, BookstoreNavMenu } from '@/components/bookstore';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/my-bookstore/')({
  component: MyBookstorePage,
});

function MyBookstorePage() {
  const navigate = useNavigate();

  const myBookstoreQuery = trpc.bookstore.getMyBookstore.useQuery(undefined, {
    retry: false,
  });

  // 서점이 없으면 (NOT_FOUND) 서점 오픈 페이지로 이동
  useEffect(() => {
    if (myBookstoreQuery.error) {
      navigate({ to: '/bookstore/open' });
    }
  }, [myBookstoreQuery.error, navigate]);

  if (myBookstoreQuery.isLoading) {
    return (
      <SubLayout title="내 서점">
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </SubLayout>
    );
  }

  if (!myBookstoreQuery.data) {
    return null;
  }

  return (
    <SubLayout title="내 서점">
      <PageContainer>
        <BookstoreHeader bookstore={myBookstoreQuery.data} />
        <MenuSection>
          <BookstoreNavMenu bookstoreId={myBookstoreQuery.data.id} />
        </MenuSection>
      </PageContainer>
    </SubLayout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
  space-y-6
`;

const MenuSection = tw.div``;

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
