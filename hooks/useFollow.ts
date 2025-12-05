import { useState, useEffect, useCallback } from 'react';
import { followService } from '@/services/followService';
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

export function useFollowers(userId: string) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    const data = await followService.getFollowers(userId);
    setFollowers(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return { followers, loading, refetch: fetchFollowers };
}

export function useFollowing(userId: string) {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    const data = await followService.getFollowing(userId);
    setFollowing(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  return { following, loading, refetch: fetchFollowing };
}
