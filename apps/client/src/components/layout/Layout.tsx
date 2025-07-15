import tw from 'tailwind-styled-components';

import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutContainer>
      <Header />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default Layout;

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
