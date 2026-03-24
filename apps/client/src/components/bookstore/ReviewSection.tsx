import { Link, useLocation } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';

import { trpc } from '@/shared';
import { AlertModal } from '@/shared/modal/AlertModal';
import { ConfirmModal } from '@/shared/modal/ConfirmModal';
import { useAuthStore } from '@/stores/auth';

interface ReviewSectionProps {
  bookstoreId: string;
}

const ReviewSection = ({ bookstoreId }: ReviewSectionProps) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const utils = trpc.useUtils();
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const reviewsQuery = trpc.bookstoreReview.getByBookstore.useQuery({
    bookstoreId,
    page: 1,
    limit: 20,
  });

  const createMutation = trpc.bookstoreReview.create.useMutation({
    onSuccess: () => {
      utils.bookstoreReview.getByBookstore.invalidate({ bookstoreId });
      SnappyModal.show(
        <AlertModal title="등록 완료" message="리뷰가 등록되었습니다." />,
      );
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="등록 실패" message={error.message} />,
      );
    },
  });

  const updateMutation = trpc.bookstoreReview.update.useMutation({
    onSuccess: () => {
      utils.bookstoreReview.getByBookstore.invalidate({ bookstoreId });
      setEditingReviewId(null);
      SnappyModal.show(
        <AlertModal title="수정 완료" message="리뷰가 수정되었습니다." />,
      );
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="수정 실패" message={error.message} />,
      );
    },
  });

  const deleteMutation = trpc.bookstoreReview.delete.useMutation({
    onSuccess: () => {
      utils.bookstoreReview.getByBookstore.invalidate({ bookstoreId });
      SnappyModal.show(
        <AlertModal title="삭제 완료" message="리뷰가 삭제되었습니다." />,
      );
    },
    onError: (error) => {
      SnappyModal.show(
        <AlertModal title="삭제 실패" message={error.message} />,
      );
    },
  });

  const handleCreate = (content: string) => {
    createMutation.mutate({ bookstoreId, content });
  };

  const handleUpdate = (content: string) => {
    if (!editingReviewId) return;
    updateMutation.mutate({ reviewId: editingReviewId, content });
  };

  const handleDelete = (reviewId: string) => {
    SnappyModal.show(
      <ConfirmModal
        title="리뷰 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />,
    ).then((result) => {
      if (result === true) {
        deleteMutation.mutate({ reviewId });
      }
    });
  };

  const reviews = reviewsQuery.data?.reviews ?? [];
  const total = reviewsQuery.data?.total ?? 0;

  // 현재 유저가 이미 리뷰를 작성했는지 확인
  const hasMyReview = user
    ? reviews.some((r) => r.reviewerId === user.id)
    : false;

  return (
    <Container>
      <Header>
        <Title>응원 글</Title>
        <Count>{total}개</Count>
      </Header>

      {/* 리뷰 작성 폼 (로그인 + 미작성 시에만 표시) */}
      {user && !hasMyReview && (
        <FormSection>
          <ReviewForm
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
          />
        </FormSection>
      )}

      {/* 비로그인 안내 */}
      {!user && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <Link
            to="/login"
            search={{ redirect: location.pathname }}
            className="text-blue-600 underline"
          >
            로그인
          </Link>
          하면 응원 글을 남길 수 있습니다.
        </div>
      )}

      {/* 리뷰 목록 */}
      {reviewsQuery.isLoading && (
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      )}

      {!reviewsQuery.isLoading && reviews.length === 0 && (
        <EmptyContainer>
          <EmptyIcon>
            <MessageSquare size={40} />
          </EmptyIcon>
          <EmptyText>아직 응원 글이 없습니다</EmptyText>
        </EmptyContainer>
      )}

      {!reviewsQuery.isLoading && reviews.length > 0 && (
        <ReviewList>
          {reviews.map((review) => (
            <ReviewItemWrapper key={review.id}>
              {editingReviewId === review.id ? (
                <EditFormSection>
                  <ReviewForm
                    initialContent={review.content}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingReviewId(null)}
                    isSubmitting={updateMutation.isPending}
                    submitLabel="수정"
                  />
                </EditFormSection>
              ) : (
                <ReviewItem
                  review={review}
                  currentUserId={user?.id}
                  onEdit={setEditingReviewId}
                  onDelete={handleDelete}
                />
              )}
            </ReviewItemWrapper>
          ))}
        </ReviewList>
      )}
    </Container>
  );
};

export default ReviewSection;

// Styled Components
const Container = tw.div`
  bg-white
  rounded-lg
  shadow
`;

const Header = tw.div`
  flex
  items-center
  justify-between
  px-6
  py-4
  border-b
  border-gray-100
`;

const Title = tw.h2`
  text-lg
  font-bold
  text-gray-900
`;

const Count = tw.span`
  text-sm
  text-gray-500
`;

const FormSection = tw.div`
  px-6
  py-4
  border-b
  border-gray-100
`;

const EditFormSection = tw.div`
  px-6
  py-4
`;

const ReviewList = tw.div`
  divide-y
  divide-gray-100
`;

const ReviewItemWrapper = tw.div``;

const LoadingContainer = tw.div`
  flex
  items-center
  justify-center
  py-12
`;

const LoadingText = tw.p`
  text-sm
  text-gray-500
`;

const EmptyContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-12
`;

const EmptyIcon = tw.div`
  text-gray-300
  mb-3
`;

const EmptyText = tw.p`
  text-sm
  text-gray-500
`;
