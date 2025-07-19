import { Outlet, createRootRoute } from '@tanstack/react-router';
import * as React from 'react';

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
      <Outlet />
    </React.Fragment>
  );
}
