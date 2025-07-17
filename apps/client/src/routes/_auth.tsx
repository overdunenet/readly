import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { useAuthStore } from '../stores/auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
