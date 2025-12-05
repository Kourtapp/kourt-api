import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'system';
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export function useMatchChat(matchId: string, userId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select(
          `
          *,
          user:profiles(id, name, avatar_url)
        `,
        )
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!matchId) return;

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          // Fetch the new message with user data
          const { data } = await supabase
            .from('chat_messages')
            .select(
              `
              *,
              user:profiles(id, name, avatar_url)
            `,
            )
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!matchId || !userId || !content.trim()) return;

      try {
        const { error: sendError } = await supabase
          .from('chat_messages')
          .insert({
            match_id: matchId,
            user_id: userId,
            content: content.trim(),
            type: 'text',
          });

        if (sendError) throw sendError;
      } catch (err: any) {
        setError(err.message || 'Erro ao enviar mensagem');
        throw err;
      }
    },
    [matchId, userId],
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        // Get matches where user is a player
        const { data: matchPlayers } = await supabase
          .from('match_players')
          .select(
            `
            match:matches(
              id,
              title,
              sport,
              date,
              organizer:profiles!matches_organizer_id_fkey(id, name, avatar_url)
            )
          `,
          )
          .eq('user_id', userId)
          .eq('status', 'confirmed');

        // Get last message for each match
        const matchesWithMessages = await Promise.all(
          (matchPlayers || []).map(async (mp: any) => {
            const { data: lastMessage } = await supabase
              .from('chat_messages')
              .select('content, created_at')
              .eq('match_id', mp.match.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...mp.match,
              lastMessage: lastMessage?.content || 'Sem mensagens',
              lastMessageAt: lastMessage?.created_at || mp.match.date,
            };
          }),
        );

        setConversations(
          matchesWithMessages.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          ),
        );
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  return { conversations, loading };
}
