import { supabase } from '@/lib/supabase';
import { Booking, CreateBookingInput } from '@/types/database.types';

export const bookingsService = {
  // Criar nova reserva
  async createBooking(
    input: CreateBookingInput,
    userId: string,
  ): Promise<Booking> {
    // Verificar disponibilidade
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', input.court_id)
      .eq('date', input.date)
      .neq('status', 'cancelled')
      .or(`start_time.lt.${input.end_time},end_time.gt.${input.start_time}`);

    if (existing && existing.length > 0) {
      throw new Error('Horário não disponível');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...input,
        user_id: userId,
        status: 'pending',
        payment_status: 'pending',
      })
      .select(
        `
        *,
        court:courts(id, name, address, images)
      `,
      )
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar reservas do usuário
  async getUserBookings(userId: string, status?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        court:courts(id, name, address, images, sport)
      `,
      )
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Buscar reserva por ID
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        court:courts(id, name, address, images, sport, latitude, longitude),
        user:profiles(id, name, email, phone)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Cancelar reserva
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason,
      })
      .eq('id', bookingId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Confirmar pagamento
  async confirmPayment(
    bookingId: string,
    paymentId: string,
    paymentMethod: string,
  ): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: paymentId,
        payment_method: paymentMethod,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar horários disponíveis para uma quadra em uma data
  async getAvailableSlots(courtId: string, date: string): Promise<string[]> {
    // Buscar reservas existentes
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('court_id', courtId)
      .eq('date', date)
      .neq('status', 'cancelled');

    // Gerar todos os slots possíveis (6h às 23h)
    const allSlots: string[] = [];
    for (let hour = 6; hour < 23; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Filtrar slots ocupados
    const bookedSlots = new Set<string>();
    bookings?.forEach((booking) => {
      const start = parseInt(booking.start_time.split(':')[0]);
      const end = parseInt(booking.end_time.split(':')[0]);
      for (let h = start; h < end; h++) {
        bookedSlots.add(`${h.toString().padStart(2, '0')}:00`);
      }
    });

    return allSlots.filter((slot) => !bookedSlots.has(slot));
  },

  // Buscar reservas de uma quadra (para donos)
  async getCourtBookings(courtId: string, date?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        user:profiles(id, name, phone, avatar_url)
      `,
      )
      .eq('court_id', courtId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};
