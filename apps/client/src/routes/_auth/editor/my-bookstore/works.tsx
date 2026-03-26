import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileText } from 'lucide-react';
import { Suspense, useState } from 'react';
import tw from 'tailwind-styled-components';

import StatusFilter, {
  type StatusFilterValue,
} from '@/components/bookstore/StatusFilter';
import WorkListItem from '@/components/bookstore/WorkListItem';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/editor/my-bookstore/works')({
  component: WorksPage,
});

function WorksPage() {
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilterValue>('all');

  // 서점 존재 확인 (없으면 Suspense ErrorBoundary에서 처리)
  trpc.bookstore.getMyBookstore.useSuspenseQuery();

  return (
    <PageContainer>
      <PageTitle>작품 관리</PageTitle>

      <StatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <Suspense fallback={<LoadingPlaceholder />}>
        <WorkListContent selectedStatus={selectedStatus} />
      </Suspense>
    </PageContainer>
  );
}

function WorkListContent({
  selectedStatus,
}: {
  selectedStatus: StatusFilterValue;
}) {
  const navigate = useNavigate();
  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
  const [works] = trpc.bookstore.getMyPosts.useSuspenseQuery({
    status: statusParam,
  });

  const handleEdit = (postId: string) => {
    navigate({ to: '/editor/posts/$postId/edit', params: { postId } });
  };

  if (works.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>
          <FileText size={48} />
        </EmptyIcon>
        <EmptyText>
          {selectedStatus === 'all'
            ? '아직 등록된 작품이 없습니다'
            : '해당 상태의 작품이 없습니다'}
        </EmptyText>
        <EmptySubtext>포스트를 작성하면 여기에 표시됩니다</EmptySubtext>
      </EmptyState>
    );
  }

  return (
    <WorkList>
      {works.map((work) => (
        <WorkListItem key={work.id} work={work} onEdit={handleEdit} />
      ))}
    </WorkList>
  );
}

// Styled Components
const PageContainer = tw.div`
  p-6
  lg:p-8
  max-w-3xl
  mx-auto
  space-y-4
`;

const PageTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

const WorkList = tw.div`
  flex
  flex-col
  gap-3
`;

const EmptyState = tw.div`
  bg-white
  rounded-lg
  shadow-sm
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

const LoadingPlaceholder = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  p-12
  text-center
  text-sm
  text-gray-400
  animate-pulse
`;
