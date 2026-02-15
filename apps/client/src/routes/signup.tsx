import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { useAuthStore } from '../stores/auth';

import { trpc } from '@/shared';

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자까지 가능합니다'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.user.register.useMutation();
  const loginMutation = trpc.user.login.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });

      const loginResult = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      useAuthStore.getState().login({
        accessToken: loginResult.accessToken,
        user: loginResult.user,
      });

      navigate({ to: '/' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '회원가입에 실패했습니다';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Logo to="/">Readly</Logo>

        <Title>회원가입</Title>

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
              autoComplete="new-password"
            />
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>닉네임</Label>
            <Input
              {...register('nickname')}
              type="text"
              placeholder="닉네임을 입력하세요"
              autoComplete="nickname"
            />
            {errors.nickname && (
              <ErrorMessage>{errors.nickname.message}</ErrorMessage>
            )}
          </FormGroup>

          {error && <AlertBox>{error}</AlertBox>}

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '가입 중...' : '가입하기'}
          </SubmitButton>
        </Form>

        <Divider />

        <LinkContainer>
          <span>이미 계정이 있으신가요?</span>
          <StyledLink to="/login">로그인</StyledLink>
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
