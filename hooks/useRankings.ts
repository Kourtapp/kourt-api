import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface RankingEntry {
  id: string;
  user_id: string;
  sport: string;
  points: number;
  wins: number;
  losses: number;
  rank_position: number;
  user?: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useRankings(sport: string) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    if (!sport) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rankings')
        .select(
          `
          *,
          user:profiles(id, name, username, avatar_url)
        `,
        )
        .eq('sport', sport)
        .order('points', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      // Add rank position
      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank_position: index + 1,
      }));

      setRankings(rankedData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, refetch: fetchRankings };
}

export function useMyRanking(userId: string | undefined, sport: string) {
  const [ranking, setRanking] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !sport) {
      setRanking(null);
      setLoading(false);
      return;
    }

    const fetchMyRanking = async () => {
      try {
        setLoading(true);

        // Get user's ranking
        const { data: myRank } = await supabase
          .from('rankings')
          .select('*')
          .eq('user_id', userId)
          .eq('sport', sport)
          .single();

        if (myRank) {
          // Get position
          const { count } = await supabase
            .from('rankings')
            .select('id', { count: 'exact', head: true })
            .eq('sport', sport)
            .gt('points', myRank.points);

          setRanking({
            ...myRank,
            rank_position: (count || 0) + 1,
          });
        } else {
          setRanking(null);
        }
      } catch {
        setRanking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRanking();
  }, [userId, sport]);

  return { ranking, loading };
}

export function useUpdateRanking() {
  const [loading, setLoading] = useState(false);

  const updateAfterMatch = useCallback(
    async (winnerId: string, loserId: string, sport: string): Promise<void> => {
      setLoading(true);

      try {
        // Get current rankings
        const { data: winnerRank } = await supabase
          .from('rankings')
          .select('*')
          .eq('user_id', winnerId)
          .eq('sport', sport)
          .single();

        const { data: loserRank } = await supabase
          .from('rankings')
          .select('*')
          .eq('user_id', loserId)
          .eq('sport', sport)
          .single();

        // Initialize if not exists
        const winnerPoints = winnerRank?.points || 1000;
        const loserPoints = loserRank?.points || 1000;

        // Simple ELO calculation
        const K = 32;
        const expectedWinner =
          1 / (1 + Math.pow(10, (loserPoints - winnerPoints) / 400));
        const expectedLoser =
          1 / (1 + Math.pow(10, (winnerPoints - loserPoints) / 400));

        const newWinnerPoints = Math.round(
          winnerPoints + K * (1 - expectedWinner),
        );
        const newLoserPoints = Math.round(
          loserPoints + K * (0 - expectedLoser),
        );

        // Update winner
        await supabase.from('rankings').upsert({
          user_id: winnerId,
          sport,
          points: newWinnerPoints,
          wins: (winnerRank?.wins || 0) + 1,
          losses: winnerRank?.losses || 0,
          updated_at: new Date().toISOString(),
        });

        // Update loser
        await supabase.from('rankings').upsert({
          user_id: loserId,
          sport,
          points: Math.max(0, newLoserPoints),
          wins: loserRank?.wins || 0,
          losses: (loserRank?.losses || 0) + 1,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error updating rankings:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateAfterMatch, loading };
}
