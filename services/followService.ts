import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const followService = {
  // Follow a user
  async follow(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Você já segue este usuário' };
        }
        throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Follow error:', err);
      return { success: false, error: err.message || 'Erro ao seguir usuário' };
    }
  },

  // Unfollow a user
  async unfollow(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error('Unfollow error:', err);
      return { success: false, error: err.message || 'Erro ao deixar de seguir' };
    }
  },

  // Check if user is following another user
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  },

  // Get followers of a user
  async getFollowers(userId: string, limit = 50): Promise<{ id: string; profile: any }[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower:profiles!follower_id(id, name, username, avatar_url, level)
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((f: any) => ({ id: f.id, profile: f.follower })) || [];
    } catch (err) {
      console.error('Get followers error:', err);
      return [];
    }
  },

  // Get users that a user is following
  async getFollowing(userId: string, limit = 50): Promise<{ id: string; profile: any }[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          following:profiles!following_id(id, name, username, avatar_url, level)
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((f: any) => ({ id: f.id, profile: f.following })) || [];
    } catch (err) {
      console.error('Get following error:', err);
      return [];
    }
  },

  // Get mutual follows (friends)
  async getMutualFollows(userId: string): Promise<string[]> {
    try {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      const followingIds = new Set(following?.map(f => f.following_id) || []);
      const followerIds = followers?.map(f => f.follower_id) || [];

      return followerIds.filter(id => followingIds.has(id));
    } catch (err) {
      console.error('Get mutual follows error:', err);
      return [];
    }
  },
};

// ==================== REAL-TIME ====================

export function subscribeToFollowers(
  userId: string,
  onInsert: (follow: any) => void,
  onDelete?: (followId: string) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`followers-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('follows')
          .select(`id, follower:profiles!follower_id(id, name, username, avatar_url, level)`)
          .eq('id', payload.new.id)
          .single();
        if (data) onInsert({ id: data.id, profile: (data as any).follower });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToFollowing(
  userId: string,
  onInsert: (follow: any) => void,
  onDelete?: (followId: string) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`following-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `follower_id=eq.${userId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('follows')
          .select(`id, following:profiles!following_id(id, name, username, avatar_url, level)`)
          .eq('id', payload.new.id)
          .single();
        if (data) onInsert({ id: data.id, profile: (data as any).following });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'follows',
        filter: `follower_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromFollows(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
