import { Outlet, createRootRoute } from '@tanstack/react-router';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'sonner';

import { useAuthStore } from '../stores/auth';
import { refreshAuth } from '../utils/auth';

export const Route = createRootRoute({
  beforeLoad: async () => {
    // Skip if already authenticated
    const { user } = useAuthStore.getState();
    if (user) return;

    // Try to refresh authentication using cookie
    await refreshAuth();
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Helmet defaultTitle="Readly" titleTemplate="%s | Readly">
        <meta
          name="description"
          content="에디터와 팔로워를 연결하는 유료 블로그 플랫폼"
        />
        <meta property="og:site_name" content="Readly" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Outlet />
      <Toaster position="bottom-center" />
    </React.Fragment>
  );
}
