import type { UserStatus } from '../../stores/auth';

export function getRedirectPathByStatus(status: UserStatus): string {
  switch (status) {
    case 'PENDING_PHONE':
      return '/phone-verify';
    case 'PENDING_PROFILE':
      return '/onboarding/nickname';
    case 'ACTIVE':
      return '/';
    case 'INACTIVE':
      return '/inactive';
  }
}
