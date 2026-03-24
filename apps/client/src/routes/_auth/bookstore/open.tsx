import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import tw from 'tailwind-styled-components';

import SubLayout from '../../../components/layout/SubLayout';
import { useAuthStore } from '../../../stores/auth';

import {
  BookstoreOpenForm,
  CountryRestrictionNotice,
} from '@/components/bookstore';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/bookstore/open')({
  component: BookstoreOpenPage,
});

function BookstoreOpenPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const hasBookstoreQuery = trpc.bookstore.hasBookstore.useQuery();

  // 이미 서점이 있으면 my-bookstore로 이동
  useEffect(() => {
    if (hasBookstoreQuery.data === true) {
      navigate({ to: '/my-bookstore' });
    }
  }, [hasBookstoreQuery.data, navigate]);

  if (hasBookstoreQuery.data === true) {
    return null;
  }

  if (hasBookstoreQuery.isLoading) {
    return (
      <SubLayout title="서점 오픈">
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </SubLayout>
    );
  }

  // 비한국 유저 안내
  if (user?.country !== 'KR') {
    return (
      <SubLayout title="서점 오픈">
        <CountryRestrictionNotice />
      </SubLayout>
    );
  }

  const handleSuccess = () => {
    navigate({ to: '/my-bookstore' });
  };

  return (
    <SubLayout title="서점 오픈">
      <PageContainer>
        <Description>서점을 오픈하고 작품을 발행해보세요.</Description>
        <BookstoreOpenForm onSuccess={handleSuccess} />
      </PageContainer>
    </SubLayout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-8
`;

const Description = tw.p`
  text-sm
  text-gray-500
  mb-8
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
