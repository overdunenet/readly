import { useCallback, useRef } from 'react';

import { trpc } from '@/shared';

export const useFollow = (followeeId: string, enabled = true) => {
  const isMutating = useRef(false);
  const utils = trpc.useUtils();

  const { data: isFollowing } = trpc.follow.isFollowing.useQuery(
    { followeeId },
    { enabled: !!followeeId && enabled },
  );

  const followMutation = trpc.follow.follow.useMutation({
    onMutate: async () => {
      await utils.follow.isFollowing.cancel({ followeeId });
      const previous = utils.follow.isFollowing.getData({ followeeId });
      utils.follow.isFollowing.setData({ followeeId }, true);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        utils.follow.isFollowing.setData({ followeeId }, context.previous);
      }
    },
    onSettled: () => {
      isMutating.current = false;
      utils.follow.isFollowing.invalidate({ followeeId });
    },
  });

  const unfollowMutation = trpc.follow.unfollow.useMutation({
    onMutate: async () => {
      await utils.follow.isFollowing.cancel({ followeeId });
      const previous = utils.follow.isFollowing.getData({ followeeId });
      utils.follow.isFollowing.setData({ followeeId }, false);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        utils.follow.isFollowing.setData({ followeeId }, context.previous);
      }
    },
    onSettled: () => {
      isMutating.current = false;
      utils.follow.isFollowing.invalidate({ followeeId });
    },
  });

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const toggleFollow = useCallback(() => {
    if (isMutating.current) return;
    isMutating.current = true;

    if (isFollowing) {
      unfollowMutation.mutate({ followeeId });
    } else {
      followMutation.mutate({ followeeId });
    }
  }, [isFollowing, followeeId, followMutation, unfollowMutation]);

  return { isFollowing, isLoading, toggleFollow };
};
