import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err?.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Logo to="/">Readly</Logo>

        <Title>로그인</Title>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>이메일</Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="이메일을 입력하세요"
              autoComplete="email"
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>비밀번호</Label>
            <Input
              {...register('password')}
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </FormGroup>

          {error && <AlertBox>{error}</AlertBox>}

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </SubmitButton>
        </Form>

        <Divider />

        <LinkContainer>
          <span>아직 계정이 없으신가요?</span>
          <StyledLink to="/signup">회원가입</StyledLink>
        </LinkContainer>
      </FormCard>
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  min-h-screen
  bg-gray-50
  flex
  items-center
  justify-center
  px-4
  py-12
`;

const FormCard = tw.div`
  w-full
  max-w-md
  bg-white
  rounded-lg
  shadow-lg
  p-8
`;

const Logo = tw(Link)`
  block
  text-2xl
  font-bold
  text-center
  text-gray-900
  mb-8
  no-underline
`;

const Title = tw.h1`
  text-2xl
  font-semibold
  text-center
  text-gray-900
  mb-6
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
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
`;

const ErrorMessage = tw.p`
  text-sm
  text-red-600
  mt-1
`;

const AlertBox = tw.div`
  p-3
  bg-red-50
  border
  border-red-200
  rounded-md
  text-sm
  text-red-700
`;

const SubmitButton = tw.button`
  w-full
  py-2
  px-4
  bg-blue-600
  text-white
  font-medium
  rounded-md
  hover:bg-blue-700
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const Divider = tw.div`
  my-6
  border-t
  border-gray-200
`;

const LinkContainer = tw.div`
  text-center
  text-sm
  text-gray-600
  space-x-1
`;

const StyledLink = tw(Link)`
  text-blue-600
  hover:text-blue-500
  font-medium
`;
