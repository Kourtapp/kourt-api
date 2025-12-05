import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'system';
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'match';
  match_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  participants?: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  }[];
  unread_count?: number;
}

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Get or create a direct conversation between two users
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      // First, try to find existing conversation
      const { data: existing } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (existing && existing.length > 0) {
        for (const conv of existing) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', userId2)
            .single();

          if (otherParticipant) {
            return conv.conversation_id;
          }
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (convError || !newConv) throw convError;

      // Add participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: newConv.id, user_id: userId1 },
        { conversation_id: newConv.id, user_id: userId2 },
      ]);

      return newConv.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }

  // Get all conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (!participations || participations.length === 0) return [];

      const conversationIds = participations.map(p => p.conversation_id);

      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (!conversations) return [];

      // Fetch participants and last messages for each conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          // Get participants
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              user:profiles(id, name, username, avatar_url)
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', userId);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', userId);

          return {
            ...conv,
            participants: participants?.map((p: any) => p.user) || [],
            last_message: lastMessage || undefined,
            unread_count: count || 0,
          };
        })
      );

      return enrichedConversations;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return [];
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, name, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).reverse();
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' = 'text'
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          type,
        })
        .select(`
          *,
          sender:profiles!sender_id(id, name, username, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }

  // Subscribe to new messages in a conversation
  subscribeToMessages(
    conversationId: string,
    callback: (message: ChatMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(id, name, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();

    this.channels.set(conversationId, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(conversationId);
    };
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export const chatService = new ChatService();
