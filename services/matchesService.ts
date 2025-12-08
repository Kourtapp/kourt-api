import { supabase } from '@/lib/supabase';
import {
  Match,
  MatchPlayer,
  CreateMatchInput,
  MatchesFilter,
} from '@/types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const matchesService = {
  // Campos para listagem de partidas (OTIMIZADO)
  MATCH_LIST_SELECT: `
    id, title, sport, date, start_time, status, level,
    current_players, max_players, is_public, location_name,
    organizer:profiles!organizer_id(id, name, avatar_url),
    court:courts(id, name, city)
  `,

  // Buscar partidas com filtros (OTIMIZADO: paginação + campos reduzidos)
  async getMatches(filters?: MatchesFilter, limit = 30, offset = 0): Promise<Match[]> {
    let query = supabase
      .from('matches')
      .select(this.MATCH_LIST_SELECT)
      .in('status', ['open', 'full'])
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (filters?.sport) {
      query = query.eq('sport', filters.sport);
    }

    if (filters?.level && filters.level !== 'any') {
      query = query.or(`level.eq.${filters.level},level.eq.any`);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    if (filters?.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as Match[];
  },

  // Buscar partida por ID
  async getMatchById(id: string): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        organizer:profiles!organizer_id(id, name, avatar_url, level, rating),
        court:courts(id, name, address, latitude, longitude),
        players:match_players(
          id, team, status, position, points_scored, mvp,
          user:profiles(id, name, avatar_url, level)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar nova partida
  async createMatch(
    input: CreateMatchInput,
    organizerId: string,
  ): Promise<Match> {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        ...input,
        organizer_id: organizerId,
        current_players: 1,
      })
      .select()
      .single();

    if (matchError) throw matchError;

    // Adicionar organizador como jogador
    await supabase.from('match_players').insert({
      match_id: match.id,
      user_id: organizerId,
      team: 1,
      status: 'confirmed',
    });

    return match;
  },

  // Entrar em uma partida
  async joinMatch(
    matchId: string,
    userId: string,
    team?: number,
  ): Promise<MatchPlayer> {
    // Verificar se já está na partida
    const { data: existing } = await supabase
      .from('match_players')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new Error('Você já está nesta partida');
    }

    // Verificar se há vagas
    const { data: match } = await supabase
      .from('matches')
      .select('current_players, max_players, requires_approval')
      .eq('id', matchId)
      .single();

    if (!match || match.current_players >= match.max_players) {
      throw new Error('Partida cheia');
    }

    // Adicionar jogador
    const { data: player, error } = await supabase
      .from('match_players')
      .insert({
        match_id: matchId,
        user_id: userId,
        team: team || 1,
        status: match.requires_approval ? 'pending' : 'confirmed',
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar contagem de jogadores (se confirmado)
    if (!match.requires_approval) {
      const newCount = match.current_players + 1;
      await supabase
        .from('matches')
        .update({
          current_players: newCount,
          status: newCount >= match.max_players ? 'full' : 'open',
        })
        .eq('id', matchId);
    }

    return player;
  },

  // Sair de uma partida
  async leaveMatch(matchId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', userId);

    if (error) throw error;

    // Atualizar contagem de jogadores
    const { data: match } = await supabase
      .from('matches')
      .select('current_players')
      .eq('id', matchId)
      .single();

    if (match) {
      await supabase
        .from('matches')
        .update({
          current_players: Math.max(1, match.current_players - 1),
          status: 'open',
        })
        .eq('id', matchId);
    }
  },

  // Cancelar partida (organizador)
  async cancelMatch(matchId: string, organizerId: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'cancelled' })
      .eq('id', matchId)
      .eq('organizer_id', organizerId);

    if (error) throw error;
  },

  // Buscar partidas do usuário
  async getUserMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('match_players')
      .select(
        `
        match:matches(
          *,
          organizer:profiles!organizer_id(id, name, avatar_url),
          court:courts(id, name, address)
        )
      `,
      )
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data?.map((d: any) => d.match).filter(Boolean) || []) as Match[];
  },

  // Atualizar placar (após partida)
  async updateScore(
    matchId: string,
    score: Record<string, any>,
    winnerTeam?: number,
  ): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        score,
        winner_team: winnerTeam,
        status: 'completed',
      })
      .eq('id', matchId);

    if (error) throw error;
  },
};

// ==================== REAL-TIME ====================

// Subscribe to match updates
export function subscribeToMatches(
  onInsert: (match: Match) => void,
  onUpdate?: (match: Match) => void,
  onDelete?: (matchId: string) => void
): RealtimeChannel {
  const channel = supabase
    .channel('matches-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
      },
      async (payload) => {
        // Fetch the full match with relations
        const { data } = await supabase
          .from('matches')
          .select(`
            *,
            organizer:profiles!organizer_id(id, name, avatar_url),
            court:courts(id, name, city)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onInsert(data as Match);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
      },
      async (payload) => {
        if (onUpdate) {
          // Fetch the full match with relations
          const { data } = await supabase
            .from('matches')
            .select(`
              *,
              organizer:profiles!organizer_id(id, name, avatar_url),
              court:courts(id, name, city)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            onUpdate(data as Match);
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'matches',
      },
      (payload) => {
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();

  return channel;
}

// Subscribe to a specific match updates
export function subscribeToMatch(
  matchId: string,
  onUpdate: (match: Partial<Match>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        onUpdate(payload.new as Partial<Match>);
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from matches channel
export function unsubscribeFromMatches(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
