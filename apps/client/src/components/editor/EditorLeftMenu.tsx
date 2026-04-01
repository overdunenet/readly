import { Link, useLocation } from '@tanstack/react-router';
import {
  BarChart3,
  ChevronLeft,
  DollarSign,
  FileText,
  LayoutGrid,
  Menu,
  Settings,
  Store,
  X,
} from 'lucide-react';
import tw from 'tailwind-styled-components';

interface EditorLeftMenuProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const menuItems = [
  {
    name: '대시보드',
    path: '/my-bookstore',
    icon: <LayoutGrid size={20} />,
  },
  {
    name: '포스트 관리',
    path: '/my-bookstore/posts',
    icon: <FileText size={20} />,
  },
  {
    name: '프로필 편집',
    path: '/my-bookstore/profile',
    icon: <Store size={20} />,
  },
  {
    name: '작품 관리',
    path: '/my-bookstore/works',
    icon: <FileText size={20} />,
  },
  {
    name: '발행 설정',
    path: '/my-bookstore/publish-settings',
    icon: <Settings size={20} />,
  },
  {
    name: '통계',
    path: '/my-bookstore/analytics',
    icon: <BarChart3 size={20} />,
  },
  {
    name: '수익 관리',
    path: '/my-bookstore/revenue',
    icon: <DollarSign size={20} />,
  },
  {
    name: '설정',
    path: '/my-bookstore/settings',
    icon: <Settings size={20} />,
  },
];

export default function EditorLeftMenu({
  isSidebarOpen,
  setIsSidebarOpen,
}: EditorLeftMenuProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <Menu size={24} />
      </MobileMenuButton>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <SidebarOverlay onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader>
          <SidebarTitle>내 서점 관리</SidebarTitle>
          <CloseButton onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </CloseButton>
        </SidebarHeader>

        <Nav>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              $isActive={isActive(item.path)}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavItem>
          ))}
        </Nav>

        <SidebarFooter>
          <BackToMainLink to="/">
            <ChevronLeft size={20} />
            <span>메인으로</span>
          </BackToMainLink>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

// Styled Components
const MobileMenuButton = tw.button`
  fixed
  top-16
  left-4
  z-40
  p-2
  bg-white
  rounded-lg
  shadow-md
  lg:hidden
`;

const SidebarOverlay = tw.div`
  fixed
  inset-0
  bg-black/50
  z-30
  lg:hidden
`;

const Sidebar = tw.aside<{ $isOpen: boolean }>`
  fixed
  left-0
  top-14
  bottom-0
  w-64
  bg-white
  border-r
  border-gray-200
  transform
  transition-transform
  z-40
  flex
  flex-col
  ${(p) => (p.$isOpen ? 'translate-x-0' : '-translate-x-full')}
  lg:translate-x-0
  lg:sticky
  lg:h-[calc(100vh-3.5rem)]
`;

const SidebarHeader = tw.div`
  flex
  items-center
  justify-between
  p-6
  border-b
  border-gray-200
`;

const SidebarTitle = tw.h2`
  text-xl
  font-bold
  text-gray-900
`;

const CloseButton = tw.button`
  p-1
  rounded-lg
  hover:bg-gray-100
  lg:hidden
`;

const Nav = tw.nav`
  flex-1
  p-4
  space-y-1
  overflow-y-auto
`;

const NavItem = tw(Link)<{ $isActive: boolean }>`
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  text-sm
  font-medium
  transition-colors
  no-underline
  ${(p) =>
    p.$isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100'}
`;

const SidebarFooter = tw.div`
  p-4
  border-t
  border-gray-200
`;

const BackToMainLink = tw(Link)`
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  text-sm
  font-medium
  text-gray-600
  hover:bg-gray-100
  transition-colors
  no-underline
`;
