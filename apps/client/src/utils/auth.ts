import { useAuthStore } from '../stores/auth';

export async function refreshAuth() {
  try {
    const response = await fetch(
      'http://localhost:3000/trpc/user.refreshToken',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    if (response.ok) {
      const data = await response.json();
      const result = data.result?.data;

      if (result?.accessToken && result?.user) {
        // Update auth state
        useAuthStore.getState().setAccessToken(result.accessToken);
        useAuthStore.getState().setUser(result.user);
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}
