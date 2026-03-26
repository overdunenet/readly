import { Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

const CountryRestrictionNotice = () => (
  <Container>
    <Card>
      <IconWrapper>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </IconWrapper>
      <Title>서점 오픈 불가</Title>
      <Description>현재 한국 유저만 서점을 오픈할 수 있습니다.</Description>
      <BackLink to="/">메인으로 돌아가기</BackLink>
    </Card>
  </Container>
);

export default CountryRestrictionNotice;

// Styled Components
const Container = tw.div`
  px-4
  py-12
  flex
  items-center
  justify-center
`;

const Card = tw.div`
  w-full
  max-w-md
  bg-blue-50
  border
  border-blue-200
  rounded-lg
  p-8
  text-center
`;

const IconWrapper = tw.div`
  mx-auto
  w-12
  h-12
  text-blue-400
  mb-4
`;

const Title = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-2
`;

const Description = tw.p`
  text-sm
  text-gray-600
  mb-6
`;

const BackLink = tw(Link)`
  inline-block
  px-4
  py-2
  bg-blue-600
  text-white
  text-sm
  font-medium
  rounded-md
  hover:bg-blue-700
  transition-colors
  no-underline
`;
