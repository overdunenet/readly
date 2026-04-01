import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useState } from 'react';
import tw from 'tailwind-styled-components';

import EditorHeader from '../../components/editor/EditorHeader';
import EditorLeftMenu from '../../components/editor/EditorLeftMenu';

export const Route = createFileRoute('/_auth/my-bookstore')({
  component: MyBookstoreLayout,
});

function MyBookstoreLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
