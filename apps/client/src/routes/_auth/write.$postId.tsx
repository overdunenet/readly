import { CKEditor } from '@ckeditor/ckeditor5-react';
import { createFileRoute } from '@tanstack/react-router';
import { ClassicEditor } from 'ckeditor5';
import { ArrowLeft } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import 'ckeditor5/ckeditor5.css';

import { editorConfig } from '@/components/posts/create/FormEditorSection';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/write/$postId')({
  component: WritePage,
});

function WritePage() {
  const { postId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: post, isLoading } = trpc.post.getOne.useQuery({ postId });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
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
      data: { title, content },
    });
  };

  const handleBack = () => {
    const stripHtml = (html: string) =>
      html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    const isEmptyDraft = !title.trim() && !stripHtml(content);
    if (isEmptyDraft) {
      deleteMutation.mutate(
        { postId },
        {
          onSettled: () => navigate({ to: '/editor/posts' }),
        },
      );
    } else {
      navigate({ to: '/editor/posts' });
    }
  };

  const saveButtonText = saved
    ? '저장됨'
    : updateMutation.isPending
      ? '저장 중...'
      : '저장';

  if (isLoading) {
    return (
      <PageWrapper>
        <Header>
          <BackButton onClick={() => navigate({ to: '/editor/posts' })}>
            <ArrowLeft size={24} />
          </BackButton>
          <SaveButton disabled>저장</SaveButton>
        </Header>
        <LoadingArea>로딩 중...</LoadingArea>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={24} />
        </BackButton>
        <SaveButton
          onClick={handleSave}
          disabled={updateMutation.isPending || saved}
        >
          {saveButtonText}
        </SaveButton>
      </Header>

      <EditorArea>
        <TitleInput
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="제목을 입력하세요"
        />

        <EditorWrapper>
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={content}
            onChange={(_event, editor) => setContent(editor.getData())}
          />
        </EditorWrapper>
      </EditorArea>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = tw.div`
  min-h-screen
  bg-white
`;

const Header = tw.header`
  sticky
  top-0
  z-10
  flex
  items-center
  justify-between
  h-14
  px-4
  bg-white
  border-b
  border-gray-200
`;

const BackButton = tw.button`
  flex
  items-center
  justify-center
  w-10
  h-10
  rounded-lg
  text-gray-600
  hover:bg-gray-100
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
  transition-colors
`;

const EditorArea = tw.main`
  max-w-3xl
  mx-auto
  px-4
  py-8
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
  h-[calc(100vh-56px)]
  text-gray-500
`;

const EditorWrapper = tw.div`
  min-h-[calc(100vh-200px)]
`;
