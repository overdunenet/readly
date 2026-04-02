import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/my')({
  component: MyLayout,
});

function MyLayout() {
  return (
    <LayoutContainer>
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
    </LayoutContainer>
  );
}

// Styled Components
const LayoutContainer = tw.div`
  min-h-screen
  bg-gray-50
`;

const MainContent = tw.main`
  pt-14
  md:max-w-md
  md:mx-auto
  min-h-screen
  bg-white
`;

const LoadingContainer = tw.div`
  flex
  justify-center
  py-20
`;
