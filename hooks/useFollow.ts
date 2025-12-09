import { useState, useEffect, useCallback, useRef } from 'react';
import { followService, subscribeToFollowers, subscribeToFollowing, unsubscribeFromFollows } from '@/services/followService';
import { useAuthStore } from '@/stores/authStore';

export function useFollow(targetUserId: string) {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if current user is following the target user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !targetUserId || user.id === targetUserId) {
        setCheckingStatus(false);
        return;
      }

      const following = await followService.isFollowing(user.id, targetUserId);
      setIsFollowing(following);
      setCheckingStatus(false);
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!user || loading) return;

    setLoading(true);

    // Optimistic update
    setIsFollowing((prev) => !prev);

    try {
      if (isFollowing) {
        const result = await followService.unfollow(user.id, targetUserId);
        if (!result.success) {
          setIsFollowing(true); // Revert on error
        }
      } else {
        const result = await followService.follow(user.id, targetUserId);
        if (!result.success) {
          setIsFollowing(false); // Revert on error
        }
      }
    } catch (err) {
      // Revert on error
      setIsFollowing((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing, loading]);

  return {
    isFollowing,
    loading,
    checkingStatus,
    toggleFollow,
  };
}

export function useFollowers(userId: string, enableRealtime = true) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    const data = await followService.getFollowers(userId);
    if (isMounted.current) {
      setFollowers(data);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const channel = subscribeToFollowers(
      userId,
      (newFollow) => {
        if (isMounted.current) {
          setFollowers((prev) => [newFollow, ...prev]);
        }
      },
      (deletedId) => {
        if (isMounted.current) {
          setFollowers((prev) => prev.filter((f) => f.id !== deletedId));
        }
      }
    );

    return () => {
      unsubscribeFromFollows(channel);
    };
  }, [enableRealtime, userId]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  return { followers, loading, refetch: fetchFollowers };
}

export function useFollowing(userId: string, enableRealtime = true) {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    const data = await followService.getFollowing(userId);
    if (isMounted.current) {
      setFollowing(data);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const channel = subscribeToFollowing(
      userId,
      (newFollow) => {
        if (isMounted.current) {
          setFollowing((prev) => [newFollow, ...prev]);
        }
      },
      (deletedId) => {
        if (isMounted.current) {
          setFollowing((prev) => prev.filter((f) => f.id !== deletedId));
        }
      }
    );

    return () => {
      unsubscribeFromFollows(channel);
    };
  }, [enableRealtime, userId]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  return { following, loading, refetch: fetchFollowing };
}
