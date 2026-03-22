import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { nicknameSchema as nicknameFieldSchema } from '../../../shared/schemas';
import { useAuthStore } from '../../../stores/auth';

import { trpc } from '@/shared';

// Form schema
const profileFormSchema = z.object({
  nickname: nicknameFieldSchema,
});
type ProfileForm = z.infer<typeof profileFormSchema>;

function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const updateProfile = trpc.user.updateProfile.useMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: user?.nickname || '',
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    updateProfile.reset();
  };

  const handleCancel = () => {
    reset({ nickname: user?.nickname || '' });
    setIsEditing(false);
    updateProfile.reset();
  };

  const onSubmit = (data: ProfileForm) => {
    updateProfile
      .mutateAsync({ nickname: data.nickname })
      .then((result) => {
        setUser(result);
        reset({ nickname: result.nickname });
        setIsEditing(false);
      })
      .catch((error) => {
        console.error('프로필 업데이트 실패:', error);
      });
  };

  // 프로필 이미지: user.profileImage 있으면 img, 없으면 닉네임 첫글자 아바타
  const avatarLetter = user?.nickname?.charAt(0)?.toUpperCase() || '?';

  return (
    <Container>
      <Header>
        <Title>설정</Title>
      </Header>

      <Section>
        <SectionHeader>
          <SectionTitle>프로필 정보</SectionTitle>
          {!isEditing && (
            <EditButton type="button" onClick={handleEdit}>
              편집
            </EditButton>
          )}
        </SectionHeader>

        {updateProfile.isSuccess && !isEditing && (
          <SuccessBox>프로필이 수정되었습니다</SuccessBox>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* 아바타 영역 */}
          <AvatarSection>
            {user?.profileImage && !imageError ? (
              <AvatarImage
                src={user.profileImage}
                alt={user.nickname}
                onError={() => setImageError(true)}
              />
            ) : (
              <AvatarFallback>{avatarLetter}</AvatarFallback>
            )}
            {isEditing && <AvatarHint>이미지 변경은 준비 중입니다</AvatarHint>}
          </AvatarSection>

          {/* 닉네임 */}
          <FormGroup>
            <Label>닉네임</Label>
            {isEditing ? (
              <>
                <EditableInput
                  {...register('nickname')}
                  placeholder="닉네임을 입력해주세요"
                  maxLength={30}
                />
                {errors.nickname && (
                  <ErrorMessage>{errors.nickname.message}</ErrorMessage>
                )}
              </>
            ) : (
              <ReadOnlyValue>{user?.nickname || ''}</ReadOnlyValue>
            )}
          </FormGroup>

          {/* 이메일 (항상 읽기 전용) */}
          <FormGroup>
            <Label>이메일</Label>
            <ReadOnlyValue>{user?.email || ''}</ReadOnlyValue>
          </FormGroup>

          {updateProfile.isError && (
            <AlertBox>{updateProfile.error?.message}</AlertBox>
          )}

          {/* 편집 모드 버튼 */}
          {isEditing && (
            <ButtonGroup>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SaveButton
                type="submit"
                disabled={!isDirty || !isValid || updateProfile.isPending}
              >
                {updateProfile.isPending ? '저장 중...' : '저장'}
              </SaveButton>
            </ButtonGroup>
          )}
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

// Route 정의
export const Route = createFileRoute('/_auth/editor/settings')({
  component: SettingsPage,
});

// Styled Components
const Container = tw.div`p-6 lg:p-8 max-w-4xl mx-auto`;
const Header = tw.div`mb-8`;
const Title = tw.h1`text-3xl font-bold text-gray-900`;

const Section = tw.section`bg-white rounded-lg shadow p-6 mb-6`;
const SectionHeader = tw.div`flex items-center justify-between mb-4`;
const SectionTitle = tw.h2`text-xl font-semibold text-gray-900`;

const EditButton = tw.button`text-sm text-blue-600 hover:text-blue-800 font-medium`;

const Form = tw.form`space-y-6`;

const AvatarSection = tw.div`flex flex-col items-center gap-2`;
const AvatarImage = tw.img`w-20 h-20 rounded-full object-cover`;
const AvatarFallback = tw.div`w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold`;
const AvatarHint = tw.p`text-xs text-gray-400`;

const FormGroup = tw.div`space-y-1`;
const Label = tw.label`block text-sm font-medium text-gray-700`;

const EditableInput = tw.input`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`;
const ReadOnlyValue = tw.p`px-3 py-2 text-sm text-gray-900`;

const ErrorMessage = tw.p`text-sm text-red-600 mt-1`;
const AlertBox = tw.div`p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700`;
const SuccessBox = tw.div`p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 mb-4`;

const ButtonGroup = tw.div`flex justify-end gap-3 pt-2`;
const CancelButton = tw.button`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50`;
const SaveButton = tw.button`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;

const ComingSoon = tw.div`text-center py-8`;
const ComingSoonText = tw.p`text-gray-500`;
