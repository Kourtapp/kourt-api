import { supabase } from '@/lib/supabase';
import { Booking, CreateBookingInput } from '@/types/database.types';

export const bookingsService = {
  // Criar nova reserva
  async createBooking(
    input: CreateBookingInput,
    userId: string,
  ): Promise<Booking> {
    // 1. Obter informações da quadra e da arena
    const { data: court } = await supabase
      .from('courts')
      .select('arena_id')
      .eq('id', input.court_id)
      .single();

    if (court?.arena_id) {
      // 2. Verificar horário da Arena
      const date = new Date(input.date);
      const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)

      // Busca agendamento específico para a data ou recorrente para o dia da semana
      const { data: schedule } = await supabase
        .from('arena_schedules')
        .select('*')
        .eq('arena_id', court.arena_id)
        .or(`specific_date.eq.${input.date},day_of_week.eq.${dayOfWeek}`)
        .order('specific_date', { ascending: false }) // Prioriza data específica se houver
        .limit(1)
        .single();

      // Se houver regra de horário configurada
      if (schedule) {
        if (schedule.is_closed) {
          throw new Error('A arena está fechada neste dia.');
        }

        const bookingStart = input.start_time; // HH:MM:00
        const bookingEnd = input.end_time;

        const openTime = schedule.open_time;
        const closeTime = schedule.close_time;

        if (bookingStart < openTime || bookingEnd > closeTime) {
          throw new Error(`Horário indisponível. A arena funciona das ${openTime.slice(0, 5)} às ${closeTime.slice(0, 5)}.`);
        }
      }
    }

    // 3. Verificar conflitos de reservas existentes
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', input.court_id)
      .eq('date', input.date)
      .neq('status', 'cancelled')
      .or(`start_time.lt.${input.end_time},end_time.gt.${input.start_time}`);

    if (existing && existing.length > 0) {
      throw new Error('Horário já reservado por outro jogador.');
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
    // 1. Buscar informações da quadra/arena
    const { data: court } = await supabase.from('courts').select('arena_id').eq('id', courtId).single();

    let openTime = 6;
    let closeTime = 23;
    let isClosed = false;

    if (court?.arena_id) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      const { data: schedule } = await supabase
        .from('arena_schedules')
        .select('*')
        .eq('arena_id', court.arena_id)
        .or(`specific_date.eq.${date},day_of_week.eq.${dayOfWeek}`)
        .order('specific_date', { ascending: false })
        .limit(1)
        .single();

      if (schedule) {
        if (schedule.is_closed) isClosed = true;
        openTime = parseInt(schedule.open_time.split(':')[0]);
        closeTime = parseInt(schedule.close_time.split(':')[0]);
      }
    }

    if (isClosed) return [];

    // 2. Buscar reservas existentes
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('court_id', courtId)
      .eq('date', date)
      .neq('status', 'cancelled');

    // 3. Gerar slots possíveis baseado no horário de funcionamento
    const allSlots: string[] = [];
    for (let hour = openTime; hour < closeTime; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // 4. Filtrar slots ocupados
    const bookedSlots = new Set<string>();
    bookings?.forEach((booking) => {
      const start = parseInt(booking.start_time.split(':')[0]);
      const end = parseInt(booking.end_time.split(':')[0]); // Assumindo hora cheia para MVP
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
