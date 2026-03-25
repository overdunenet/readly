import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import {
  BookstoreForm,
  BookstoreHeader,
  BookstoreNavMenu,
  CountryRestrictionNotice,
} from '@/components/bookstore';
import { trpc } from '@/shared';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_auth/editor/my-bookstore/')({
  component: MyBookstorePage,
});

function MyBookstorePage() {
  const user = useAuthStore((state) => state.user);
  const utils = trpc.useUtils();

  const myBookstoreQuery = trpc.bookstore.getMyBookstore.useQuery(undefined, {
    retry: false,
  });

  // 비한국 유저 안내
  if (user?.country !== 'KR' && myBookstoreQuery.error) {
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
    if (user?.country !== 'KR') {
      return <CountryRestrictionNotice />;
    }

    const handleOpenSuccess = () => {
      utils.bookstore.getMyBookstore.invalidate();
    };

    return (
      <PageContainer>
        <OpenSection>
          <OpenTitle>서점 오픈</OpenTitle>
          <OpenDescription>
            서점을 오픈하고 작품을 발행해보세요.
          </OpenDescription>
          <BookstoreForm mode="create" onSuccess={handleOpenSuccess} />
        </OpenSection>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BookstoreHeader bookstore={myBookstoreQuery.data} />
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
