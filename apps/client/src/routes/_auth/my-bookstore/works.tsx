import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';

import SubLayout from '../../../components/layout/SubLayout';

import StatusFilter from '@/components/bookstore/StatusFilter';
import WorkListItem from '@/components/bookstore/WorkListItem';
import { trpc } from '@/shared';

export const Route = createFileRoute('/_auth/my-bookstore/works')({
  component: WorksPage,
});

type StatusFilterValue = 'all' | 'draft' | 'published' | 'scheduled';

function WorksPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilterValue>('all');

  const myBookstoreQuery = trpc.bookstore.getMyBookstore.useQuery(undefined, {
    retry: false,
  });

  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
  const worksQuery = trpc.bookstore.getMyWorks.useQuery(
    { status: statusParam },
    { enabled: !!myBookstoreQuery.data },
  );

  useEffect(() => {
    if (myBookstoreQuery.error) {
      navigate({ to: '/bookstore/open' });
    }
  }, [myBookstoreQuery.error, navigate]);

  const handleEdit = (postId: string) => {
    navigate({ to: '/editor/posts/$postId/edit', params: { postId } });
  };

  if (myBookstoreQuery.isLoading) {
    return (
      <SubLayout title="작품 관리">
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </SubLayout>
    );
  }

  if (!myBookstoreQuery.data) {
    return null;
  }

  return (
    <SubLayout title="작품 관리">
      <PageContainer>
        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {worksQuery.isLoading && (
          <LoadingContainer>
            <LoadingText>로딩 중...</LoadingText>
          </LoadingContainer>
        )}

        {!worksQuery.isLoading &&
          (!worksQuery.data || worksQuery.data.length === 0) && (
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
          )}

        {!worksQuery.isLoading &&
          worksQuery.data &&
          worksQuery.data.length > 0 && (
            <WorkList>
              {worksQuery.data.map((work) => (
                <WorkListItem key={work.id} work={work} onEdit={handleEdit} />
              ))}
            </WorkList>
          )}
      </PageContainer>
    </SubLayout>
  );
}

// Styled Components
const PageContainer = tw.div`
  px-4
  py-6
  space-y-4
`;

const WorkList = tw.div`
  flex
  flex-col
  gap-3
`;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-20
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
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
