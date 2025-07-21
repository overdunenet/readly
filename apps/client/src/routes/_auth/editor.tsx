import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import EditorHeader from '../../components/editor/EditorHeader';
import EditorLeftMenu from '../../components/editor/EditorLeftMenu';

export const Route = createFileRoute('/_auth/editor')({
  component: EditorLayout,
});

function EditorLayout() {
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
          <Outlet />
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
