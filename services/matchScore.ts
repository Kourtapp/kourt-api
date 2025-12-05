// services/matchScore.ts
import { supabase } from '@/lib/supabase';

export interface MatchScore {
  id: string;
  match_id: string;
  team_a_score: number;
  team_b_score: number;
  team_a_sets: number;
  team_b_sets: number;
  current_set: number;
  sets_history: SetScore[];
  status: 'not_started' | 'in_progress' | 'paused' | 'finished';
  started_at: string | null;
  finished_at: string | null;
  winner_team: 'a' | 'b' | null;
  updated_at: string;
}

export interface SetScore {
  set_number: number;
  team_a: number;
  team_b: number;
  winner: 'a' | 'b';
}

export interface ScoreUpdate {
  team: 'a' | 'b';
  action: 'add' | 'remove';
  points?: number;
}

/**
 * Busca ou cria o placar de uma partida
 */
export async function getMatchScore(
  matchId: string,
): Promise<MatchScore | null> {
  try {
    // Buscar placar existente
    const { data, error } = await supabase
      .from('match_scores')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching match score:', error);
      return null;
    }

    if (data) {
      return data as MatchScore;
    }

    // Criar placar se não existir
    const { data: newScore, error: createError } = await supabase
      .from('match_scores')
      .insert({
        match_id: matchId,
        team_a_score: 0,
        team_b_score: 0,
        team_a_sets: 0,
        team_b_sets: 0,
        current_set: 1,
        sets_history: [],
        status: 'not_started',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating match score:', createError);
      return null;
    }

    return newScore as MatchScore;
  } catch (error) {
    console.error('Exception in getMatchScore:', error);
    return null;
  }
}

/**
 * Atualiza o placar (adiciona/remove ponto)
 */
export async function updateMatchScore(
  matchId: string,
  update: ScoreUpdate,
): Promise<{ success: boolean; score?: MatchScore; error?: string }> {
  try {
    // Buscar placar atual
    const { data: current, error: fetchError } = await supabase
      .from('match_scores')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Placar não encontrado' };
    }

    let newScore = { ...current };
    const points = update.points || 1;

    if (update.action === 'add') {
      if (update.team === 'a') {
        newScore.team_a_score += points;
      } else {
        newScore.team_b_score += points;
      }
    } else {
      if (update.team === 'a') {
        newScore.team_a_score = Math.max(0, newScore.team_a_score - points);
      } else {
        newScore.team_b_score = Math.max(0, newScore.team_b_score - points);
      }
    }

    // Atualizar no banco
    const { data: updated, error: updateError } = await supabase
      .from('match_scores')
      .update({
        team_a_score: newScore.team_a_score,
        team_b_score: newScore.team_b_score,
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, score: updated as MatchScore };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Inicia a partida
 */
export async function startMatch(
  matchId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('match_scores')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Atualizar status da partida
    await supabase
      .from('matches')
      .update({ status: 'in_progress' })
      .eq('id', matchId);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Pausa/Retoma a partida
 */
export async function togglePauseMatch(
  matchId: string,
  isPaused: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('match_scores')
      .update({
        status: isPaused ? 'paused' : 'in_progress',
      })
      .eq('match_id', matchId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Finaliza um set
 */
export async function finishSet(
  matchId: string,
  winnerTeam: 'a' | 'b',
): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar placar atual
    const { data: current, error: fetchError } = await supabase
      .from('match_scores')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Placar não encontrado' };
    }

    // Adicionar set ao histórico
    const newSetHistory: SetScore[] = [
      ...(current.sets_history || []),
      {
        set_number: current.current_set,
        team_a: current.team_a_score,
        team_b: current.team_b_score,
        winner: winnerTeam,
      },
    ];

    // Atualizar contagem de sets
    const newTeamASets =
      winnerTeam === 'a' ? current.team_a_sets + 1 : current.team_a_sets;
    const newTeamBSets =
      winnerTeam === 'b' ? current.team_b_sets + 1 : current.team_b_sets;

    const { error: updateError } = await supabase
      .from('match_scores')
      .update({
        sets_history: newSetHistory,
        team_a_sets: newTeamASets,
        team_b_sets: newTeamBSets,
        team_a_score: 0,
        team_b_score: 0,
        current_set: current.current_set + 1,
      })
      .eq('match_id', matchId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Finaliza a partida
 */
export async function finishMatch(
  matchId: string,
  winnerTeam: 'a' | 'b',
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('match_scores')
      .update({
        status: 'finished',
        winner_team: winnerTeam,
        finished_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Atualizar status da partida
    await supabase
      .from('matches')
      .update({
        status: 'completed',
        winner_team: winnerTeam,
      })
      .eq('id', matchId);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Inscreve-se para atualizações em tempo real do placar
 */
export function subscribeToScoreUpdates(
  matchId: string,
  onUpdate: (score: MatchScore) => void,
) {
  const channel = supabase
    .channel(`match_score_${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_scores',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as MatchScore);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
