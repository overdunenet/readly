import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileText, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import PostListItem from '@/components/posts/manage/PostListItem';
import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';

export const Route = createFileRoute('/_auth/editor/posts/')({
  component: PostsPage,
});

function PostsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'published'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts, isLoading } = trpc.post.getMy.useQuery();
  const utils = trpc.useUtils();

  const createDraftMutation = trpc.post.create.useMutation({
    onSuccess: (post) => {
      navigate({ to: '/write/$postId', params: { postId: post.id } });
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal
          title="글 작성을 시작할 수 없습니다"
          message={error.message}
        />,
      );
    },
  });

  const publishMutation = trpc.post.publish.useMutation({
    onSuccess: () => utils.post.getMy.invalidate(),
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="발행 실패" message={error.message} />,
      );
    },
  });

  const unpublishMutation = trpc.post.unpublish.useMutation({
    onSuccess: () => utils.post.getMy.invalidate(),
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="발행 취소 실패" message={error.message} />,
      );
    },
  });

  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => utils.post.getMy.invalidate(),
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="삭제 실패" message={error.message} />,
      );
    },
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (
        searchQuery &&
        !post.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [posts, statusFilter, searchQuery]);

  const handleEdit = (postId: string) => {
    navigate({ to: '/editor/posts/$postId/edit', params: { postId } });
  };

  const handlePublish = (postId: string) => {
    publishMutation.mutate({ postId });
  };

  const handleUnpublish = (postId: string) => {
    unpublishMutation.mutate({ postId });
  };

  const handleDelete = (postId: string) => {
    deleteMutation.mutate({ postId });
  };

  const hasActiveFilters = statusFilter !== 'all' || searchQuery !== '';

  return (
    <Container>
      <Header>
        <PageTitle>포스트 관리</PageTitle>
        <CreateButton
          onClick={() => createDraftMutation.mutate({})}
          disabled={createDraftMutation.isPending}
        >
          <Plus size={20} />
          {createDraftMutation.isPending ? '생성 중...' : '새 포스트'}
        </CreateButton>
      </Header>

      <Toolbar>
        <FilterTabs>
          <FilterTab
            $active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            전체
          </FilterTab>
          <FilterTab
            $active={statusFilter === 'published'}
            onClick={() => setStatusFilter('published')}
          >
            발행됨
          </FilterTab>
          <FilterTab
            $active={statusFilter === 'draft'}
            onClick={() => setStatusFilter('draft')}
          >
            임시저장
          </FilterTab>
        </FilterTabs>

        <SearchWrapper>
          <SearchIconWrapper>
            <Search size={18} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="제목으로 검색..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </SearchWrapper>
      </Toolbar>

      {isLoading && (
        <LoadingState>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingState>
      )}

      {!isLoading && filteredPosts.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FileText size={48} />
          </EmptyIcon>
          <EmptyText>
            {hasActiveFilters
              ? '검색 결과가 없습니다'
              : '아직 작성한 포스트가 없습니다'}
          </EmptyText>
          <EmptySubtext>
            {hasActiveFilters
              ? '다른 검색어나 필터를 사용해보세요'
              : '첫 번째 포스트를 작성해보세요'}
          </EmptySubtext>
        </EmptyState>
      )}

      {!isLoading && filteredPosts.length > 0 && (
        <PostList>
          {filteredPosts.map((post) => (
            <PostListItem
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onDelete={handleDelete}
            />
          ))}
        </PostList>
      )}
    </Container>
  );
}

// Styled Components
const Container = tw.div`
  p-6
  lg:p-8
  max-w-7xl
  mx-auto
`;

const Header = tw.div`
  flex
  items-center
  justify-between
  mb-8
`;

const PageTitle = tw.h1`
  text-3xl
  font-bold
  text-gray-900
`;

const CreateButton = tw.button`
  flex
  items-center
  gap-2
  px-4
  py-2
  bg-blue-600
  text-white
  font-medium
  rounded-lg
  hover:bg-blue-700
  transition-colors
`;

const Toolbar = tw.div`
  flex
  flex-col
  sm:flex-row
  items-stretch
  sm:items-center
  gap-4
  mb-6
`;

const FilterTabs = tw.div`
  flex
  gap-1
  bg-gray-100
  rounded-lg
  p-1
`;

const FilterTab = tw.button<{ $active: boolean }>`
  px-3
  py-1.5
  rounded-md
  text-sm
  transition-colors
  ${({ $active }) =>
    $active
      ? 'bg-white text-gray-900 shadow-sm font-medium'
      : 'text-gray-600 hover:text-gray-900'}
`;

const SearchWrapper = tw.div`
  relative
  flex-1
`;

const SearchIconWrapper = tw.div`
  absolute
  left-3
  top-1/2
  -translate-y-1/2
  text-gray-400
  pointer-events-none
`;

const SearchInput = tw.input`
  w-full
  pl-10
  pr-4
  py-2
  border
  border-gray-300
  rounded-lg
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
`;

const LoadingState = tw.div`
  bg-white
  rounded-lg
  shadow
  p-12
  text-center
`;

const LoadingText = tw.p`
  text-gray-500
`;

const PostList = tw.div`
  flex
  flex-col
  gap-3
`;

const EmptyState = tw.div`
  bg-white
  rounded-lg
  shadow
  p-12
  text-center
`;

const EmptyIcon = tw.div`
  mx-auto
  w-12
  h-12
  text-gray-400
  mb-4
`;

const EmptyText = tw.p`
  text-gray-900
  font-medium
  mb-2
`;

const EmptySubtext = tw.p`
  text-sm
  text-gray-500
`;
