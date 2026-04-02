import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import {
  BookstoreForm,
  CountryRestrictionNotice,
} from '@/components/bookstore';
import type { BookstoreFormData } from '@/components/bookstore/BookstoreForm';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

import EditorHeader from '../../components/editor/EditorHeader';
import EditorLeftMenu from '../../components/editor/EditorLeftMenu';
import { useAuthStore } from '../../stores/auth';

export const Route = createFileRoute('/_auth/my-bookstore')({
  component: MyBookstoreLayout,
});

function BookstoreCreateSection() {
  const user = useAuthStore((s) => s.user);
  const utils = trpc.useUtils();

  const createMutation = trpc.bookstore.createBookstore.useMutation({
    onSuccess: () => {
      utils.bookstore.hasBookstore.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        utils.bookstore.hasBookstore.invalidate();
        return;
      }
      SnappyModal.show(
        <AlertModal title="서점 생성 실패" message={error.message} />,
      );
    },
  });

  const handleSubmit = (data: BookstoreFormData) => {
    createMutation.mutate({
      penName: data.penName,
      storeName: data.storeName,
      termsAgreed: data.agreedToTerms ?? false,
    });
  };

  if (user?.language !== 'ko') {
    return <CountryRestrictionNotice />;
  }

  return (
    <CreateContainer>
      <CreateCard>
        <CreateTitle>서점 오픈하기</CreateTitle>
        <CreateSubtitle>
          나만의 서점을 만들고 작품을 발행해보세요
        </CreateSubtitle>
        <BookstoreForm
          mode="create"
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          error={createMutation.error?.message ?? null}
        />
      </CreateCard>
    </CreateContainer>
  );
}

function MyBookstoreLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    data: hasBookstore,
    isLoading,
    isError,
  } = trpc.bookstore.hasBookstore.useQuery();

  if (isLoading) {
    return <FullScreenLoading>로딩 중...</FullScreenLoading>;
  }

  if (isError) {
    return <FullScreenLoading>오류가 발생했습니다</FullScreenLoading>;
  }

  if (!hasBookstore) {
    return <BookstoreCreateSection />;
  }

  return (
    <>
      <EditorHeader />

      <Container>
        <EditorLeftMenu
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Content */}
        <MainContent>
          <Suspense
            fallback={
              <LoadingContainer>
                <span className="text-gray-400">로딩 중...</span>
              </LoadingContainer>
            }
          >
            <Outlet />
          </Suspense>
        </MainContent>
      </Container>
    </>
  );
}

// Styled Components
const Container = tw.div`
  flex
  min-h-screen
  bg-gray-50
  pt-14
`;

const MainContent = tw.main`
  flex-1
  lg:ml-auto
  min-h-[calc(100vh-3.5rem)]
`;

const LoadingContainer = tw.div`
  flex
  justify-center
  py-20
`;

const FullScreenLoading = tw.div`
  flex
  items-center
  justify-center
  min-h-screen
  text-gray-500
  text-sm
`;

const CreateContainer = tw.div`
  flex
  items-center
  justify-center
  min-h-screen
  bg-gray-50
  p-4
`;

const CreateCard = tw.div`
  w-full
  max-w-lg
  bg-white
  rounded-xl
  shadow-lg
  p-8
`;

const CreateTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
  text-center
`;

const CreateSubtitle = tw.p`
  text-sm
  text-gray-500
  mb-8
  text-center
`;
