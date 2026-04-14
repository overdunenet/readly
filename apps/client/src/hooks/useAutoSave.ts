import { useCallback, useEffect, useRef, useState } from 'react';

import { trpc } from '@/shared';

interface UseAutoSaveOptions {
  postId: string;
  title: string;
  freeContent: string;
  paidContent: string | null;
  enabled?: boolean;
  debounceMs?: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  saveNow: () => void;
}

interface ContentSnapshot {
  title: string;
  freeContent: string;
  paidContent: string | null;
}

export const useAutoSave = ({
  postId,
  title,
  freeContent,
  paidContent,
  enabled = true,
  debounceMs = 10000,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const prevRef = useRef<ContentSnapshot>({
    title,
    freeContent,
    paidContent,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const saveDraftMutation = trpc.post.saveDraft.useMutation();

  const isDirty = useCallback((): boolean => {
    const prev = prevRef.current;
    return (
      prev.title !== title ||
      prev.freeContent !== freeContent ||
      prev.paidContent !== paidContent
    );
  }, [title, freeContent, paidContent]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const executeSave = useCallback(
    (saveType: 'auto' | 'manual') => {
      if (!isDirty()) return;

      clearTimer();
      const payload: ContentSnapshot = { title, freeContent, paidContent };
      setSaveStatus('saving');
      saveDraftMutation.mutate(
        {
          postId,
          data: payload,
          saveType,
        },
        {
          onSuccess: () => {
            if (!isMountedRef.current) return;
            prevRef.current = payload;
            setSaveStatus('saved');
            setLastSavedAt(new Date());
          },
          onError: () => {
            if (!isMountedRef.current) return;
            setSaveStatus('error');
          },
        },
      );
    },
    [
      postId,
      title,
      freeContent,
      paidContent,
      isDirty,
      clearTimer,
      saveDraftMutation,
    ],
  );

  const saveNow = useCallback(() => {
    executeSave('manual');
  }, [executeSave]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !isDirty()) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      executeSave('auto');
    }, debounceMs);

    return () => {
      clearTimer();
    };
  }, [
    title,
    freeContent,
    paidContent,
    enabled,
    debounceMs,
    isDirty,
    clearTimer,
    executeSave,
  ]);

  // Unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { saveStatus, lastSavedAt, saveNow };
};
