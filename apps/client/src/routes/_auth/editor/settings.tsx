import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { useAuth } from '../../../hooks/useAuth';

export const Route = createFileRoute('/_auth/editor/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  return (
    <Container>
      <Header>
        <Title>설정</Title>
      </Header>

      <Section>
        <SectionTitle>프로필 정보</SectionTitle>
        <Form>
          <FormGroup>
            <Label>닉네임</Label>
            <Input type="text" value={user?.nickname || ''} readOnly />
          </FormGroup>
          <FormGroup>
            <Label>이메일</Label>
            <Input type="email" value={user?.email || ''} readOnly />
          </FormGroup>
          <InfoText>프로필 수정 기능은 준비 중입니다</InfoText>
        </Form>
      </Section>

      <Section>
        <SectionTitle>에디터 설정</SectionTitle>
        <ComingSoon>
          <ComingSoonText>추가 설정 옵션 준비 중</ComingSoonText>
        </ComingSoon>
      </Section>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  p-6
  lg:p-8
  max-w-4xl
  mx-auto
`;

const Header = tw.div`
  mb-8
`;

const Title = tw.h1`
  text-3xl
  font-bold
  text-gray-900
`;

const Section = tw.section`
  bg-white
  rounded-lg
  shadow
  p-6
  mb-6
`;

const SectionTitle = tw.h2`
  text-xl
  font-semibold
  text-gray-900
  mb-4
`;

const Form = tw.form`
  space-y-4
`;

const FormGroup = tw.div`
  space-y-1
`;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

const Input = tw.input`
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  bg-gray-50
  text-gray-600
  cursor-not-allowed
`;

const InfoText = tw.p`
  text-sm
  text-gray-500
  mt-4
`;

const ComingSoon = tw.div`
  text-center
  py-8
`;

const ComingSoonText = tw.p`
  text-gray-500
`;
