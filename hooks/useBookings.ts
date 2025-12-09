import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingsService, subscribeToBookings, unsubscribeFromBookings } from '@/services/bookingsService';
import { Booking, CreateBookingInput } from '@/types/database.types';

export function useBookings(userId: string | undefined, status?: string, enableRealtime = true) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await bookingsService.getUserBookings(userId, status);
      if (isMounted.current) setBookings(data);
    } catch (err: any) {
      if (isMounted.current) setError(err.message || 'Erro ao carregar reservas');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const channel = subscribeToBookings(
      userId,
      (newBooking) => {
        if (isMounted.current) {
          setBookings((prev) => [newBooking, ...prev]);
        }
      },
      (updatedBooking) => {
        if (isMounted.current) {
          setBookings((prev) =>
            prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
          );
        }
      },
      (deletedId) => {
        if (isMounted.current) {
          setBookings((prev) => prev.filter((b) => b.id !== deletedId));
        }
      }
    );

    return () => {
      unsubscribeFromBookings(channel);
    };
  }, [enableRealtime, userId]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  return { bookings, loading, error, refetch: fetchBookings };
}

export function useBookingDetail(bookingId: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await bookingsService.getBookingById(bookingId);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar reserva');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const cancelBooking = async (
    userId: string,
    reason?: string,
  ): Promise<void> => {
    try {
      await bookingsService.cancelBooking(bookingId, userId, reason);
      await fetchBooking(); // Refresh data
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao cancelar reserva');
    }
  };

  return { booking, loading, error, refetch: fetchBooking, cancelBooking };
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (input: CreateBookingInput): Promise<Booking> => {
      try {
        setLoading(true);
        setError(null);
        const booking = await bookingsService.createBooking(
          input,
          input.user_id,
        );
        return booking;
      } catch (err: any) {
        const message = err.message || 'Erro ao criar reserva';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createBooking, loading, error };
}

export function useAvailableSlots(courtId: string, date: string) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!courtId || !date) {
      setSlots([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await bookingsService.getAvailableSlots(courtId, date);
      setSlots(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  }, [courtId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, error, refetch: fetchSlots };
}

export function useConfirmPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = useCallback(
    async (
      bookingId: string,
      paymentId: string,
      paymentMethod: string,
    ): Promise<Booking> => {
      try {
        setLoading(true);
        setError(null);
        const booking = await bookingsService.confirmPayment(
          bookingId,
          paymentId,
          paymentMethod,
        );
        return booking;
      } catch (err: any) {
        const message = err.message || 'Erro ao confirmar pagamento';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { confirmPayment, loading, error };
}
