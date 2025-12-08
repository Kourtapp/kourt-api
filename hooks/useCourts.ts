import { useState, useEffect, useCallback, useRef } from 'react';
import { courtsService } from '@/services/courtsService';
import { Court, CourtsFilter, Review } from '@/types/database.types';

export function useCourts(filters?: CourtsFilter) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  const isMounted = useRef(true);

  // Only update ref if filters actually changed
  const filtersKey = JSON.stringify(filters);

  const fetchCourts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { limit, ...filters } = filtersRef.current || {};
      const data = await courtsService.getCourts(filters, limit);
      if (isMounted.current) {
        setCourts(data);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Erro ao carregar quadras');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
    fetchCourts();
  }, [filtersKey, fetchCourts]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { courts, loading, error, refetch: fetchCourts };
}

export function useCourtDetail(courtId: string) {
  const [court, setCourt] = useState<Court | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourt = useCallback(async () => {
    if (!courtId) return;

    try {
      setLoading(true);
      setError(null);
      const [courtData, reviewsData] = await Promise.all([
        courtsService.getCourtById(courtId),
        courtsService.getCourtReviews(courtId),
      ]);
      setCourt(courtData);
      setReviews(reviewsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar quadra');
    } finally {
      setLoading(false);
    }
  }, [courtId]);

  useEffect(() => {
    fetchCourt();
  }, [fetchCourt]);

  const addReview = async (
    userId: string,
    rating: number,
    comment?: string,
  ) => {
    try {
      const newReview = await courtsService.addReview(
        courtId,
        userId,
        rating,
        comment,
      );
      setReviews((prev) => [newReview, ...prev]);
      // Refetch court to get updated rating
      const updatedCourt = await courtsService.getCourtById(courtId);
      setCourt(updatedCourt);
      return newReview;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao adicionar avaliação');
    }
  };

  return { court, reviews, loading, error, refetch: fetchCourt, addReview };
}

export function useNearbyCourts(
  latitude?: number,
  longitude?: number,
  radiusKm = 10,
) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyCourts = useCallback(async () => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      setError(null);
      const data = await courtsService.getNearbyCourts(
        latitude,
        longitude,
        radiusKm,
      );
      setCourts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar quadras próximas');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm]);

  useEffect(() => {
    fetchNearbyCourts();
  }, [fetchNearbyCourts]);

  return { courts, loading, error, refetch: fetchNearbyCourts };
}

export function useSearchCourts() {
  const [results, setResults] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await courtsService.searchCourts(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
}
