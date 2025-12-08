import { supabase } from '@/lib/supabase';
import { Court, CourtsFilter, Review } from '@/types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const courtsService = {
  // Campos essenciais para listagem (reduz overfetching)
  COURT_LIST_FIELDS: 'id, name, sport, type, city, neighborhood, address, latitude, longitude, rating, total_reviews, is_free, price_per_hour, images, is_indoor, has_lighting',

  // Buscar todas as quadras com filtros (OTIMIZADO: paginação + campos específicos)
  async getCourts(filters?: CourtsFilter, limit = 50, offset = 0): Promise<Court[]> {
    let query = supabase
      .from('courts')
      .select(this.COURT_LIST_FIELDS)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.sport) {
      query = query.eq('sport', filters.sport);
    }

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.is_free !== undefined) {
      query = query.eq('is_free', filters.is_free);
    }

    if (filters?.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as Court[];
  },

  // Buscar quadra por ID
  async getCourtById(id: string): Promise<Court | null> {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar quadras próximas (OTIMIZADO: limite + campos específicos)
  async getNearbyCourts(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 30,
  ): Promise<Court[]> {
    // Cálculo aproximado de bounding box
    const latDelta = radiusKm / 111; // ~111km por grau de latitude
    const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const { data, error } = await supabase
      .from('courts')
      .select(this.COURT_LIST_FIELDS)
      .eq('is_active', true)
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta)
      .order('rating', { ascending: false })
      .limit(limit * 2); // Buscar um pouco mais para ordenar por distância

    if (error) throw error;

    // Ordenar por distância real e limitar
    return ((data || []) as unknown as Court[])
      .sort((a, b) => {
        const distA = calculateDistance(
          latitude,
          longitude,
          a.latitude!,
          a.longitude!,
        );
        const distB = calculateDistance(
          latitude,
          longitude,
          b.latitude!,
          b.longitude!,
        );
        return distA - distB;
      })
      .slice(0, limit);
  },

  // Buscar avaliações de uma quadra
  async getCourtReviews(courtId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        user:profiles(name, avatar_url)
      `,
      )
      .eq('court_id', courtId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Adicionar avaliação
  async addReview(
    courtId: string,
    userId: string,
    rating: number,
    comment?: string,
  ): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        court_id: courtId,
        user_id: userId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar rating médio da quadra
    await updateCourtRating(courtId);

    return data;
  },

  // Buscar por texto
  async searchCourts(searchTerm: string): Promise<Court[]> {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('is_active', true)
      .or(
        `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
      )
      .order('rating', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};

// Função auxiliar para calcular distância (Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Atualizar rating médio da quadra
async function updateCourtRating(courtId: string): Promise<void> {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('court_id', courtId);

  if (data && data.length > 0) {
    const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;

    await supabase
      .from('courts')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: data.length,
      })
      .eq('id', courtId);
  }
}

// ==================== REAL-TIME ====================

// Subscribe to new courts
export function subscribeToCourts(
  onInsert: (court: Court) => void,
  onUpdate?: (court: Court) => void,
  onDelete?: (courtId: string) => void
): RealtimeChannel {
  const channel = supabase
    .channel('courts-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'courts',
      },
      (payload) => {
        onInsert(payload.new as Court);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'courts',
      },
      (payload) => {
        if (onUpdate) onUpdate(payload.new as Court);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'courts',
      },
      (payload) => {
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from courts channel
export function unsubscribeFromCourts(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
