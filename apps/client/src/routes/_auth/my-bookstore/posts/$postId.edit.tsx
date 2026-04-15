import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';

import { BlockEditor } from '@/components/posts/create/editor/BlockEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/my-bookstore/posts/$postId/edit')({
  component: WritePage,
});

function WritePage() {
  const { postId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: post, isLoading } = trpc.post.getOne.useQuery({ postId });
  const utils = trpc.useUtils();

  const [title, setTitle] = useState('');
  const [freeContent, setFreeContent] = useState('');
  const [paidContent, setPaidContent] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (post && !dataReady) {
      setTitle(post.title);
      setFreeContent(post.freeContent);
      setPaidContent(post.paidContent);
      setDataReady(true);
    }
  }, [post, dataReady]);

  const { saveStatus, lastSavedAt, saveNow } = useAutoSave({
    postId,
    title,
    freeContent,
    paidContent,
  });

  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getMy.invalidate();
    },
    onError: (error) => {
      console.error('Draft 삭제 실패:', error.message);
    },
  });

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

  if (isLoading || !dataReady) {
    return <LoadingArea>로딩 중...</LoadingArea>;
  }

  return (
    <EditorArea>
      <Toolbar>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>목록으로</span>
        </BackButton>
        <SaveArea>
          {saveStatus === 'saving' && (
            <SaveStatusText>저장 중...</SaveStatusText>
          )}
          {saveStatus === 'saved' && lastSavedAt && (
            <SaveStatusText>
              자동저장됨{' '}
              {lastSavedAt.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </SaveStatusText>
          )}
          {saveStatus === 'error' && <SaveErrorText>저장 실패</SaveErrorText>}
          <SaveButton onClick={saveNow} disabled={saveStatus === 'saving'}>
            저장
          </SaveButton>
        </SaveArea>
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
          keyPrefix={`post/${postId}`}
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

const SaveArea = tw.div`
  flex
  items-center
  gap-3
`;

const SaveStatusText = tw.span`
  text-gray-400
  text-sm
`;

const SaveErrorText = tw.span`
  text-red-500
  text-sm
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
