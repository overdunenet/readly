import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/editor')({
  beforeLoad: () => {
    throw redirect({ to: '/my-bookstore' });
  },
});
