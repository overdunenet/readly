import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/write/$postId')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/my-bookstore/posts/$postId/edit',
      params: { postId: params.postId },
    });
  },
});
