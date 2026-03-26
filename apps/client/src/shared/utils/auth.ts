import type { UserStatus } from '../../stores/auth';

export function getRedirectPathByStatus(
  status: UserStatus,
  redirectUrl?: string,
): string {
  switch (status) {
    case 'PENDING_PHONE':
      return '/phone-verify';
    case 'PENDING_PROFILE':
      return '/onboarding/nickname';
    case 'ACTIVE':
      if (redirectUrl && redirectUrl.startsWith('/')) {
        return redirectUrl;
      }
      return '/';
    case 'INACTIVE':
      return '/inactive';
    default:
      return '/';
  }
}
