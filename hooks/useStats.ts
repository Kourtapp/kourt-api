import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
  sportDistribution: { sport: string; count: number }[];
  weeklyProgress: { week: string; matches: number }[];
  recentMatches: {
    id: string;
    date: string;
    sport: string;
    won: boolean;
    score: string | null;
  }[];
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile for basic stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_matches, wins, streak, xp, level')
          .eq('id', userId)
          .single();

        // Fetch match history for recent matches and distribution
        const { data: matchPlayers } = await supabase
          .from('match_players')
          .select(
            `
            match_id,
            team,
            match:matches(id, date, sport, score, winner_team, status)
          `,
          )
          .eq('user_id', userId)
          .order('match_id', { ascending: false })
          .limit(50);

        // Calculate statistics
        const matches = (matchPlayers || [])
          .filter((mp: any) => mp.match?.status === 'completed')
          .map((mp: any) => ({
            ...mp.match,
            won: mp.match.winner_team === mp.team,
          }));

        const totalMatches = profile?.total_matches || matches.length;
        const wins = profile?.wins || matches.filter((m: any) => m.won).length;
        const losses = totalMatches - wins;
        const winRate =
          totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

        // Sport distribution
        const sportCounts: Record<string, number> = {};
        matches.forEach((m: any) => {
          sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1;
        });
        const sportDistribution = Object.entries(sportCounts).map(
          ([sport, count]) => ({
            sport,
            count,
          }),
        );

        // Weekly progress (last 8 weeks)
        const weeklyProgress: { week: string; matches: number }[] = [];
        for (let i = 7; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - i * 7);

          const count = matches.filter((m: any) => {
            const matchDate = new Date(m.date);
            return matchDate >= weekStart && matchDate <= weekEnd;
          }).length;

          weeklyProgress.push({
            week: `S${8 - i}`,
            matches: count,
          });
        }

        // Recent matches
        const recentMatches = matches.slice(0, 10).map((m: any) => ({
          id: m.id,
          date: m.date,
          sport: m.sport,
          won: m.won,
          score: m.score,
        }));

        setStats({
          totalMatches,
          wins,
          losses,
          winRate,
          currentStreak: profile?.streak || 0,
          bestStreak: 0, // Would need separate tracking
          xp: profile?.xp || 0,
          level: profile?.level || 1,
          sportDistribution,
          weeklyProgress,
          recentMatches,
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
}
