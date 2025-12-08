// hooks/usePosts.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  PostWithUser,
  CreatePostInput,
  fetchPosts,
  fetchUserPosts,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  checkUserLiked,
  subscribeToNewPosts,
  unsubscribe,
} from '@/services/postsService';
import { RealtimeChannel } from '@supabase/supabase-js';

export function usePosts() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const { user } = useAuthStore();

  // Carregar posts
  const loadPosts = useCallback(async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 0) {
        setLoading(true);
      }

      const data = await fetchPosts(pageNum, 20);

      if (refresh || pageNum === 0) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
      setPage(pageNum);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh
  const refresh = useCallback(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  // Carregar mais
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  }, [loading, hasMore, page, loadPosts]);

  // Criar post
  const create = useCallback(
    async (input: CreatePostInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const newPost = await createPost(user.id, input);
      // O post será adicionado via real-time
      return newPost;
    },
    [user?.id]
  );

  // Deletar post
  const remove = useCallback(async (postId: string) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Like/Unlike
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user?.id) return;

      const isLiked = likedPosts.has(postId);

      // Otimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
            : p
        )
      );

      try {
        if (isLiked) {
          await unlikePost(postId, user.id);
        } else {
          await likePost(postId, user.id);
        }
      } catch {
        // Reverter em caso de erro
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) }
              : p
          )
        );
      }
    },
    [user?.id, likedPosts]
  );

  // Verificar likes do usuário
  useEffect(() => {
    if (!user?.id || posts.length === 0) return;

    const checkLikes = async () => {
      const liked = new Set<string>();
      for (const post of posts) {
        const isLiked = await checkUserLiked(post.id, user.id);
        if (isLiked) liked.add(post.id);
      }
      setLikedPosts(liked);
    };

    checkLikes();
  }, [user?.id, posts.length]);

  // Real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtime = () => {
      channel = subscribeToNewPosts((newPost) => {
        // Adicionar novo post no topo
        setPosts((prev) => {
          // Evitar duplicatas
          if (prev.some((p) => p.id === newPost.id)) return prev;
          return [newPost, ...prev];
        });
      });
    };

    loadPosts();
    setupRealtime();

    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, []);

  return {
    posts,
    loading,
    refreshing,
    error,
    hasMore,
    likedPosts,
    refresh,
    loadMore,
    create,
    remove,
    toggleLike,
  };
}

// Hook para posts de um usuário específico
export function useUserPosts(userId: string) {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchUserPosts(userId);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      load();
    }
  }, [userId]);

  return { posts, loading, error };
}
