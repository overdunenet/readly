import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { useAuthStore } from '../stores/auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const { user } = useAuthStore.getState();

    if (!user) {
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
