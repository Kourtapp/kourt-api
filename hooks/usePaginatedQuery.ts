import { useState, useCallback, useEffect, useRef } from 'react';

// Example usage hook for courts
import { supabase } from '@/lib/supabase';
import { Court } from '@/types/database.types';

interface PaginatedQueryOptions<T> {
  fetchFn: (page: number, pageSize: number) => Promise<T[]>;
  pageSize?: number;
  enabled?: boolean;
}

interface PaginatedQueryResult<T> {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePaginatedQuery<T>({
  fetchFn,
  pageSize = 20,
  enabled = true,
}: PaginatedQueryOptions<T>): PaginatedQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);

  const fetchData = useCallback(
    async (page: number, isRefresh = false) => {
      if (isLoadingRef.current && !isRefresh) return;

      try {
        isLoadingRef.current = true;

        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const newData = await fetchFn(page, pageSize);

        if (isRefresh || page === 1) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }

        setHasMore(newData.length === pageSize);
        pageRef.current = page;
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [fetchFn, pageSize],
  );

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(1);
    }
  }, [enabled]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    await fetchData(1, true);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await fetchData(pageRef.current + 1);
  }, [fetchData, hasMore]);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  };
}

export function usePaginatedCourts(sport?: string) {
  const fetchCourts = useCallback(
    async (page: number, pageSize: number): Promise<Court[]> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .range(from, to);

      if (sport) {
        query = query.eq('sport', sport);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    [sport],
  );

  return usePaginatedQuery<Court>({
    fetchFn: fetchCourts,
    pageSize: 20,
  });
}
