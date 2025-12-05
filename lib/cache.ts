// Cache simples em memória com TTL
// Reduz chamadas repetidas à API

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutos padrão

  // Buscar do cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Salvar no cache
  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  // Buscar ou executar função
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlMs);
    return data;
  }

  // Invalidar chave específica
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Invalidar por prefixo (ex: 'rankings:*')
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
  }

  // Verificar tamanho do cache
  size(): number {
    return this.cache.size;
  }
}

// Instância global do cache
export const memoryCache = new MemoryCache();

// TTLs pré-definidos para diferentes tipos de dados
export const CACHE_TTL = {
  RANKINGS: 15 * 60 * 1000,      // 15 minutos - rankings mudam pouco
  PROFILE: 5 * 60 * 1000,        // 5 minutos - perfil pode mudar
  COURTS_LIST: 10 * 60 * 1000,   // 10 minutos - lista de quadras
  COURT_DETAIL: 5 * 60 * 1000,   // 5 minutos - detalhe de quadra
  ACHIEVEMENTS: 30 * 60 * 1000,  // 30 minutos - achievements raramente mudam
  MATCHES_LIST: 2 * 60 * 1000,   // 2 minutos - partidas são mais dinâmicas
};

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  rankings: (sport: string, period: string) => `rankings:${sport}:${period}`,
  profile: (userId: string) => `profile:${userId}`,
  courts: (filters: string) => `courts:${filters}`,
  court: (courtId: string) => `court:${courtId}`,
  achievements: () => 'achievements:all',
  userAchievements: (userId: string) => `achievements:${userId}`,
};
