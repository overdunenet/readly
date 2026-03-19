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

    const pathname = location.pathname;

    switch (user.status) {
      case 'PENDING_PHONE':
        if (!pathname.startsWith('/phone-verify')) {
          throw redirect({ to: '/phone-verify' });
        }
        break;
      case 'PENDING_PROFILE':
        if (!pathname.startsWith('/onboarding')) {
          throw redirect({ to: '/onboarding/nickname' });
        }
        break;
      case 'INACTIVE':
        useAuthStore.getState().logout();
        throw redirect({ to: '/inactive' });
      case 'ACTIVE':
        if (
          pathname.startsWith('/phone-verify') ||
          pathname.startsWith('/onboarding')
        ) {
          throw redirect({ to: '/' });
        }
        break;
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
