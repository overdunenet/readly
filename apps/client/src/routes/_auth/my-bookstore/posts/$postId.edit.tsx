import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { BlockEditor } from '@/components/posts/create/editor/BlockEditor';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/my-bookstore/posts/$postId/edit')({
  component: WritePage,
});

function WritePage() {
  const { postId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: post, isLoading } = trpc.post.getOne.useQuery({ postId });

  const [title, setTitle] = useState('');
  const [freeContent, setFreeContent] = useState('');
  const [paidContent, setPaidContent] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setFreeContent(post.freeContent);
      setPaidContent(post.paidContent);
    }
  }, [post]);

  const updateMutation = trpc.post.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="저장 실패" message={error.message} />,
      );
    },
  });

  const deleteMutation = trpc.post.delete.useMutation({
    onError: (error) => {
      console.error('Draft 삭제 실패:', error.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      postId,
      data: { title, freeContent, paidContent },
    });
  };

  const handleBack = () => {
    const stripHtml = (html: string) =>
      html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    const isEmptyDraft =
      !title.trim() && !stripHtml(freeContent) && !paidContent;
    if (isEmptyDraft) {
      deleteMutation.mutate(
        { postId },
        {
          onSettled: () => navigate({ to: '/my-bookstore/posts' }),
        },
      );
    } else {
      navigate({ to: '/my-bookstore/posts' });
    }
  };

  const saveButtonText = saved
    ? '저장됨'
    : updateMutation.isPending
      ? '저장 중...'
      : '저장';

  if (isLoading) {
    return <LoadingArea>로딩 중...</LoadingArea>;
  }

  return (
    <EditorArea>
      <Toolbar>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>목록으로</span>
        </BackButton>
        <SaveButton
          onClick={handleSave}
          disabled={updateMutation.isPending || saved}
        >
          {saveButtonText}
        </SaveButton>
      </Toolbar>

      <TitleInput
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        placeholder="제목을 입력하세요"
      />

      <EditorWrapper>
        <BlockEditor
          key={postId}
          freeContent={freeContent}
          paidContent={paidContent}
          onChange={(free, paid) => {
            setFreeContent(free);
            setPaidContent(paid);
          }}
          placeholder="내용을 작성하세요"
        />
      </EditorWrapper>
    </EditorArea>
  );
}

// Styled Components
const EditorArea = tw.main`
  max-w-3xl
  mx-auto
  px-4
  py-6
`;

const Toolbar = tw.div`
  flex
  items-center
  justify-between
  mb-6
`;

const BackButton = tw.button`
  flex
  items-center
  gap-1.5
  text-sm
  text-gray-600
  hover:text-gray-900
  transition-colors
`;

const SaveButton = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  text-sm
  font-medium
  rounded-lg
  hover:bg-blue-700
  disabled:opacity-50
  disabled:cursor-not-allowed
  transition-colors
`;

const TitleInput = tw.input`
  w-full
  text-3xl
  font-bold
  text-gray-900
  placeholder-gray-300
  border-none
  outline-none
  focus:outline-none
  focus:ring-0
  mb-6
`;

const LoadingArea = tw.div`
  flex
  items-center
  justify-center
  py-20
  text-gray-500
`;

const EditorWrapper = tw.div`
  min-h-[calc(100vh-300px)]
`;
