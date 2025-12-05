import { useState, useEffect, useCallback, useRef } from 'react';
import { matchesService } from '@/services/matchesService';
import {
  Match,
  MatchPlayer,
  CreateMatchInput,
  MatchesFilter,
} from '@/types/database.types';

export function useMatches(filters?: MatchesFilter) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  const isMounted = useRef(true);

  // Only update ref if filters actually changed
  const filtersKey = JSON.stringify(filters);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchesService.getMatches(filtersRef.current);
      if (isMounted.current) {
        setMatches(data);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Erro ao carregar partidas');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
    fetchMatches();
  }, [filtersKey, fetchMatches]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { matches, loading, error, refetch: fetchMatches };
}

export function useMatchDetail(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await matchesService.getMatchById(matchId);
      setMatch(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partida');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const joinMatch = async (
    userId: string,
    team?: number,
  ): Promise<MatchPlayer> => {
    try {
      const player = await matchesService.joinMatch(matchId, userId, team);
      await fetchMatch(); // Refresh data
      return player;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao entrar na partida');
    }
  };

  const leaveMatch = async (userId: string): Promise<void> => {
    try {
      await matchesService.leaveMatch(matchId, userId);
      await fetchMatch(); // Refresh data
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao sair da partida');
    }
  };

  return { match, loading, error, refetch: fetchMatch, joinMatch, leaveMatch };
}

export function useUserMatches(userId: string | undefined) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!userId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await matchesService.getUserMatches(userId);
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar suas partidas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, error, refetch: fetchMatches };
}

export function useCreateMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMatch = useCallback(
    async (input: CreateMatchInput, organizerId: string): Promise<Match> => {
      try {
        setLoading(true);
        setError(null);
        const match = await matchesService.createMatch(input, organizerId);
        return match;
      } catch (err: any) {
        const message = err.message || 'Erro ao criar partida';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createMatch, loading, error };
}

export function useCancelMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelMatch = useCallback(
    async (matchId: string, organizerId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await matchesService.cancelMatch(matchId, organizerId);
      } catch (err: any) {
        const message = err.message || 'Erro ao cancelar partida';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { cancelMatch, loading, error };
}

export function useJoinMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinMatch = useCallback(
    async (
      matchId: string,
      userId: string,
      team?: number,
    ): Promise<MatchPlayer> => {
      try {
        setLoading(true);
        setError(null);
        const player = await matchesService.joinMatch(matchId, userId, team);
        return player;
      } catch (err: any) {
        const message = err.message || 'Erro ao entrar na partida';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { joinMatch, loading, error };
}

export function useLeaveMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaveMatch = useCallback(
    async (matchId: string, userId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await matchesService.leaveMatch(matchId, userId);
      } catch (err: any) {
        const message = err.message || 'Erro ao sair da partida';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { leaveMatch, loading, error };
}
