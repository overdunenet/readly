import { useCallback, useEffect, useRef, useState } from 'react';

interface UseOtpTimerReturn {
  remainingSeconds: number;
  resendSeconds: number;
  isExpired: boolean;
  canResend: boolean;
  formattedTime: string;
  reset: (expiresAt: string, resendAvailableAt: string) => void;
}

export function useOtpTimer(): UseOtpTimerReturn {
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [resendAt, setResendAt] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const remainingSeconds = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    : 0;

  const resendSeconds = resendAt
    ? Math.max(0, Math.floor((resendAt.getTime() - now.getTime()) / 1000))
    : 0;

  const isExpired = expiresAt ? now >= expiresAt : false;
  const canResend = resendAt ? now >= resendAt : true;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const reset = useCallback(
    (expiresAtStr: string, resendAvailableAtStr: string) => {
      setExpiresAt(new Date(expiresAtStr));
      setResendAt(new Date(resendAvailableAtStr));
      setNow(new Date());
    },
    [],
  );

  return {
    remainingSeconds,
    resendSeconds,
    isExpired,
    canResend,
    formattedTime,
    reset,
  };
}
