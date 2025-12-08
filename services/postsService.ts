// services/postsService.ts
import { supabase } from '@/lib/supabase';
import { Post, PostComment } from '@/types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PostWithUser extends Omit<Post, 'user'> {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CreatePostInput {
  type: 'match_result' | 'achievement' | 'photo' | 'text';
  content?: string;
  photo_url?: string;
  match_id?: string;
  sport?: string;
  result?: 'victory' | 'defeat' | 'draw';
  score?: string;
  venue?: string;
  duration?: string;
  xp_earned?: number;
  metrics?: Record<string, string>;
}

// Buscar posts do feed (com paginação)
export async function fetchPosts(
  page: number = 0,
  limit: number = 20
): Promise<PostWithUser[]> {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles!user_id (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return data as PostWithUser[];
}

// Buscar posts de um usuário específico
export async function fetchUserPosts(
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<PostWithUser[]> {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles!user_id (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }

  return data as PostWithUser[];
}

// Criar post
export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      type: input.type,
      content: input.content || null,
      photo_url: input.photo_url || null,
      match_id: input.match_id || null,
      sport: input.sport || null,
      result: input.result || null,
      score: input.score || null,
      venue: input.venue || null,
      duration: input.duration || null,
      xp_earned: input.xp_earned || 0,
      metrics: input.metrics || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
}

// Deletar post
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Dar like em post
export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').insert({
    post_id: postId,
    user_id: userId,
  });

  if (error && error.code !== '23505') {
    // Ignora erro de duplicata
    console.error('Error liking post:', error);
    throw error;
  }
}

// Remover like
export async function unlikePost(
  postId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

// Verificar se usuário deu like
export async function checkUserLiked(
  postId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking like:', error);
    return false;
  }

  return !!data;
}

// Buscar comentários de um post
export async function fetchPostComments(
  postId: string
): Promise<(PostComment & { user: { id: string; name: string | null; avatar_url: string | null } })[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      user:profiles!user_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return data as any;
}

// Adicionar comentário
export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<PostComment> {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
}

// Deletar comentário
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// ==================== REAL-TIME ====================

// Subscrever para novos posts
export function subscribeToNewPosts(
  onNewPost: (post: PostWithUser) => void
): RealtimeChannel {
  const channel = supabase
    .channel('posts-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      },
      async (payload) => {
        // Buscar o post com os dados do usuário
        const { data } = await supabase
          .from('posts')
          .select(`
            *,
            user:profiles!user_id (
              id,
              name,
              username,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onNewPost(data as PostWithUser);
        }
      }
    )
    .subscribe();

  return channel;
}

// Subscrever para atualizações de um post específico (likes, comments)
export function subscribeToPostUpdates(
  postId: string,
  onUpdate: (post: Partial<Post>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`post-${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`,
      },
      (payload) => {
        onUpdate(payload.new as Partial<Post>);
      }
    )
    .subscribe();

  return channel;
}

// Cancelar subscription
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
