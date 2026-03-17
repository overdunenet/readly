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

    const isPhoneVerifyPage = location.pathname.startsWith('/phone-verify');

    if (!user.phoneVerified && !isPhoneVerifyPage) {
      throw redirect({ to: '/phone-verify' });
    }
    if (user.phoneVerified && isPhoneVerifyPage) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
