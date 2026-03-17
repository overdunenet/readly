import tw from 'tailwind-styled-components';

import SubHeader from './SubHeader';

interface SubLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const SubLayout = ({ children, title, onBack }: SubLayoutProps) => (
  <LayoutContainer>
    <SubHeader title={title} onBack={onBack} />
    <MainContent>{children}</MainContent>
  </LayoutContainer>
);

export default SubLayout;

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
