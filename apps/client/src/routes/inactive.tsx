import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

function InactivePage() {
  return (
    <Container>
      <Title>비활성화된 계정</Title>
      <Description>이 계정은 비활성화되었습니다.</Description>
      <StyledLink to="/login">로그인 페이지로 이동</StyledLink>
    </Container>
  );
}

export const Route = createFileRoute('/inactive')({
  component: InactivePage,
});

const Container = tw.div`
  flex
  flex-col
  items-center
  justify-center
  min-h-screen
  px-4
`;

const Title = tw.h1`
  text-xl
  font-bold
  text-gray-900
  mb-2
`;

const Description = tw.p`
  text-sm
  text-gray-500
  mb-8
`;

const StyledLink = tw(Link)`
  text-blue-600
  hover:text-blue-700
  text-sm
  font-medium
`;
