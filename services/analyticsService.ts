import { supabase } from '@/lib/supabase';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos de eventos para analytics (AARRR Framework)
export type AnalyticsEventType =
  // Acquisition (Aquisição)
  | 'app_open'
  | 'app_close'
  | 'signed_up'
  | 'app_installed'
  // Activation (Ativação)
  | 'screen_view'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'match_created'
  | 'match_joined'
  | 'court_viewed'
  | 'court_favorited'
  | 'court_suggested'
  | 'booking_started'
  | 'booking_created'
  // Retention (Retenção)
  | 'match_completed'
  | 'daily_active'
  | 'weekly_active'
  // Revenue (Receita)
  | 'booking_completed'
  | 'reservation_completed'
  | 'subscription_started'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  // Referral (Referência)
  | 'referral_invite_sent'
  | 'invite_sent'
  | 'invite_accepted'
  | 'referral_accepted'
  | 'profile_shared'
  // Other
  | 'profile_updated'
  | 'achievement_unlocked'
  | 'search_performed'
  | 'filter_applied'
  | 'ranking_viewed';

interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  user_id?: string;
  screen_name?: string;
  properties?: Record<string, any>;
  timestamp: string;
  session_id: string;
}

interface UserSession {
  session_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  screens_viewed: string[];
  events_count: number;
  device_info?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private currentUserId: string | null = null;
  private screensViewed: string[] = [];
  private eventsCount: number = 0;
  private appStateSubscription: any = null;

  // Inicializar analytics
  async initialize(userId?: string): Promise<void> {
    this.currentUserId = userId || null;
    this.startNewSession();

    // Monitorar estado do app (foreground/background)
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this),
    );
  }

  // Iniciar nova sessão
  private startNewSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
    this.screensViewed = [];
    this.eventsCount = 0;

    this.trackEvent('app_open');
  }

  // Encerrar sessão atual
  private async endSession(): Promise<void> {
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    await this.trackEvent('app_close', {
      duration_seconds: duration,
      screens_viewed_count: this.screensViewed.length,
      events_count: this.eventsCount,
    });

    // Salvar sessão no banco
    if (this.currentUserId) {
      await this.saveSession({
        session_id: this.sessionId,
        user_id: this.currentUserId,
        started_at: new Date(this.sessionStartTime).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        screens_viewed: this.screensViewed,
        events_count: this.eventsCount,
      });
    }
  }

  // Handler para mudança de estado do app
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.endSession();
    } else if (nextAppState === 'active') {
      // Verificar se passou muito tempo (>30min) e criar nova sessão
      const timeSinceStart = Date.now() - this.sessionStartTime;
      if (timeSinceStart > 30 * 60 * 1000) {
        this.startNewSession();
      }
    }
  }

  // Atualizar usuário atual
  setUser(userId: string | null): void {
    this.currentUserId = userId;
  }

  // Rastrear evento
  async trackEvent(
    eventType: AnalyticsEventType,
    properties?: Record<string, any>,
  ): Promise<void> {
    this.eventsCount++;

    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: this.currentUserId || undefined,
      properties,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
    };

    // Salvar evento no banco
    try {
      await supabase.from('analytics_events').insert(event);
    } catch (error) {
      console.log('Analytics event not saved (table may not exist):', eventType);
      // Armazenar localmente para sync posterior
      await this.storeEventLocally(event);
    }
  }

  // Rastrear visualização de tela
  async trackScreenView(screenName: string, params?: Record<string, any>): Promise<void> {
    if (!this.screensViewed.includes(screenName)) {
      this.screensViewed.push(screenName);
    }

    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...params,
    });
  }

  // Rastrear partida criada
  async trackMatchCreated(matchId: string, sport: string, playersCount: number): Promise<void> {
    await this.trackEvent('match_created', {
      match_id: matchId,
      sport,
      players_count: playersCount,
    });
  }

  // Rastrear entrada em partida
  async trackMatchJoined(matchId: string, sport: string): Promise<void> {
    await this.trackEvent('match_joined', {
      match_id: matchId,
      sport,
    });
  }

  // Rastrear busca realizada
  async trackSearch(query: string, resultsCount: number, category: string): Promise<void> {
    await this.trackEvent('search_performed', {
      query,
      results_count: resultsCount,
      category,
    });
  }

  // Rastrear filtro aplicado
  async trackFilterApplied(filterType: string, filterValue: any): Promise<void> {
    await this.trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }

  // Salvar sessão no banco
  private async saveSession(session: UserSession): Promise<void> {
    try {
      await supabase.from('user_sessions').insert(session);
    } catch (error) {
      console.log('Session not saved (table may not exist)');
    }
  }

  // Armazenar evento localmente (fallback)
  private async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('pending_analytics_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      await AsyncStorage.setItem('pending_analytics_events', JSON.stringify(events.slice(-100)));
    } catch (error) {
      console.error('Error storing event locally:', error);
    }
  }

  // Sincronizar eventos pendentes
  async syncPendingEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('pending_analytics_events');
      if (!stored) return;

      const events = JSON.parse(stored);
      if (events.length === 0) return;

      await supabase.from('analytics_events').insert(events);
      await AsyncStorage.removeItem('pending_analytics_events');
    } catch (error) {
      console.log('Could not sync pending events');
    }
  }

  // ============ MÉTRICAS DE DASHBOARD ============

  // Obter métricas de retenção
  async getRetentionMetrics(days: number = 30): Promise<{
    dailyActiveUsers: number[];
    weeklyActiveUsers: number[];
    monthlyActiveUsers: number;
    retentionRate: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Usuários ativos diários
      const { data: dailyData } = await supabase
        .from('user_sessions')
        .select('user_id, started_at')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      // Agrupar por dia
      const dailyUsers = new Map<string, Set<string>>();
      dailyData?.forEach((session) => {
        const day = session.started_at.split('T')[0];
        if (!dailyUsers.has(day)) {
          dailyUsers.set(day, new Set());
        }
        dailyUsers.get(day)?.add(session.user_id);
      });

      // Usuários únicos do mês
      const monthlyUsers = new Set(dailyData?.map((s) => s.user_id) || []);

      // Calcular taxa de retenção (usuários que voltaram nos últimos 7 dias)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentUsers = dailyData?.filter(
        (s) => new Date(s.started_at) >= last7Days,
      );
      const recentUniqueUsers = new Set(recentUsers?.map((s) => s.user_id) || []);

      const retentionRate =
        monthlyUsers.size > 0
          ? Math.round((recentUniqueUsers.size / monthlyUsers.size) * 100)
          : 0;

      return {
        dailyActiveUsers: Array.from(dailyUsers.values()).map((s) => s.size),
        weeklyActiveUsers: [], // Implementar se necessário
        monthlyActiveUsers: monthlyUsers.size,
        retentionRate,
      };
    } catch (error) {
      console.error('Error getting retention metrics:', error);
      return {
        dailyActiveUsers: [],
        weeklyActiveUsers: [],
        monthlyActiveUsers: 0,
        retentionRate: 0,
      };
    }
  }

  // Obter métricas de uso
  async getUsageMetrics(): Promise<{
    avgSessionDuration: number;
    avgScreensPerSession: number;
    totalSessions: number;
    mostViewedScreens: { screen: string; count: number }[];
  }> {
    try {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds, screens_viewed')
        .order('started_at', { ascending: false })
        .limit(1000);

      if (!sessions || sessions.length === 0) {
        return {
          avgSessionDuration: 0,
          avgScreensPerSession: 0,
          totalSessions: 0,
          mostViewedScreens: [],
        };
      }

      // Calcular médias
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const totalScreens = sessions.reduce(
        (sum, s) => sum + (s.screens_viewed?.length || 0),
        0,
      );

      // Contar telas mais visitadas
      const screenCounts = new Map<string, number>();
      sessions.forEach((s) => {
        s.screens_viewed?.forEach((screen: string) => {
          screenCounts.set(screen, (screenCounts.get(screen) || 0) + 1);
        });
      });

      const mostViewedScreens = Array.from(screenCounts.entries())
        .map(([screen, count]) => ({ screen, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        avgSessionDuration: Math.round(totalDuration / sessions.length),
        avgScreensPerSession: Math.round(totalScreens / sessions.length),
        totalSessions: sessions.length,
        mostViewedScreens,
      };
    } catch (error) {
      console.error('Error getting usage metrics:', error);
      return {
        avgSessionDuration: 0,
        avgScreensPerSession: 0,
        totalSessions: 0,
        mostViewedScreens: [],
      };
    }
  }

  // Obter métricas de crescimento
  async getGrowthMetrics(): Promise<{
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    totalUsers: number;
    matchesCreated: number;
    bookingsCompleted: number;
    activeSubscribers: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const monthStart = new Date(now.setMonth(now.getMonth() - 1)).toISOString();

    try {
      // Novos usuários
      const { count: usersToday } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      const { count: usersWeek } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekStart);

      const { count: usersMonth } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Partidas criadas este mês
      const { count: matchesCreated } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      // Reservas completadas
      const { count: bookingsCompleted } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', monthStart);

      // Assinantes ativos (PRO)
      const { count: activeSubscribers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription', 'pro');

      return {
        newUsersToday: usersToday || 0,
        newUsersThisWeek: usersWeek || 0,
        newUsersThisMonth: usersMonth || 0,
        totalUsers: totalUsers || 0,
        matchesCreated: matchesCreated || 0,
        bookingsCompleted: bookingsCompleted || 0,
        activeSubscribers: activeSubscribers || 0,
      };
    } catch (error) {
      console.error('Error getting growth metrics:', error);
      return {
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        totalUsers: 0,
        matchesCreated: 0,
        bookingsCompleted: 0,
        activeSubscribers: 0,
      };
    }
  }

  // Obter funil de conversão
  async getConversionFunnel(): Promise<{
    signups: number;
    onboardingCompleted: number;
    firstMatch: number;
    subscription: number;
    conversionRates: {
      signupToOnboarding: number;
      onboardingToMatch: number;
      matchToSubscription: number;
    };
  }> {
    try {
      const { count: signups } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      const { count: onboardingCompleted } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('onboarding_completed', true);

      const { count: firstMatch } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_matches', 0);

      const { count: subscription } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .in('subscription', ['pro', 'plus']);

      const total = signups || 0;
      const onboarding = onboardingCompleted || 0;
      const matched = firstMatch || 0;
      const subscribed = subscription || 0;

      return {
        signups: total,
        onboardingCompleted: onboarding,
        firstMatch: matched,
        subscription: subscribed,
        conversionRates: {
          signupToOnboarding: total > 0 ? Math.round((onboarding / total) * 100) : 0,
          onboardingToMatch: onboarding > 0 ? Math.round((matched / onboarding) * 100) : 0,
          matchToSubscription: matched > 0 ? Math.round((subscribed / matched) * 100) : 0,
        },
      };
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      return {
        signups: 0,
        onboardingCompleted: 0,
        firstMatch: 0,
        subscription: 0,
        conversionRates: {
          signupToOnboarding: 0,
          onboardingToMatch: 0,
          matchToSubscription: 0,
        },
      };
    }
  }

  // ============ AARRR TRACKING METHODS ============

  /**
   * Acquisition: Track user signup
   */
  async trackSignup(userId: string, source: string, referralCode?: string): Promise<void> {
    await this.trackEvent('signed_up', {
      user_id: userId,
      acquisition_source: source,
      referral_code_used: referralCode,
    });
  }

  /**
   * Activation: Track onboarding step
   */
  async trackOnboardingStep(stepName: string, stepNumber: number): Promise<void> {
    await this.trackEvent('onboarding_step_completed', {
      step_name: stepName,
      step_number: stepNumber,
    });
  }

  /**
   * Activation: Track onboarding completion
   */
  async trackOnboardingCompleted(sportsSelected: string[]): Promise<void> {
    await this.trackEvent('onboarding_completed', {
      sports_selected: sportsSelected,
      sports_count: sportsSelected.length,
    });
  }

  /**
   * Retention: Track completed match (North Star Metric)
   */
  async trackMatchCompleted(
    matchId: string,
    participantsCount: number,
    sport: string,
    durationMinutes: number,
  ): Promise<void> {
    await this.trackEvent('match_completed', {
      match_id: matchId,
      participants_count: participantsCount,
      sport,
      duration_minutes: durationMinutes,
    });
  }

  /**
   * Revenue: Track reservation/payment completed
   */
  async trackReservationCompleted(
    reservationId: string,
    matchId: string,
    gmvAmount: number,
    revenueAmount: number,
  ): Promise<void> {
    await this.trackEvent('reservation_completed', {
      reservation_id: reservationId,
      match_id: matchId,
      gmv_amount: gmvAmount,
      revenue_amount: revenueAmount,
    });
  }

  /**
   * Revenue: Track subscription started
   */
  async trackSubscriptionStarted(plan: string, price: number): Promise<void> {
    await this.trackEvent('subscription_started', {
      plan,
      price,
    });
  }

  /**
   * Referral: Track invite sent
   */
  async trackReferralInviteSent(channel: string): Promise<void> {
    await this.trackEvent('referral_invite_sent', {
      channel, // 'whatsapp', 'copy_link', 'sms'
    });
  }

  /**
   * Referral: Track invite accepted
   */
  async trackReferralAccepted(invitingUserId: string): Promise<void> {
    await this.trackEvent('referral_accepted', {
      inviting_user_id: invitingUserId,
    });
  }

  // ============ REVENUE METRICS ============

  /**
   * Get revenue metrics (GMV, Revenue, Take Rate)
   */
  async getRevenueMetrics(): Promise<{
    totalGMV: number;
    totalRevenue: number;
    takeRate: number;
    monthlyGMV: number;
    monthlyRevenue: number;
    avgTransactionValue: number;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      // Total revenue
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('payment_status', 'paid');

      // Monthly revenue
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('payment_status', 'paid')
        .gte('created_at', monthStart);

      const totalGMV = allBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      const monthlyGMV = monthlyBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      // Assume 10% take rate (adjust as needed)
      const takeRate = 0.1;
      const totalRevenue = totalGMV * takeRate;
      const monthlyRevenue = monthlyGMV * takeRate;

      const avgTransactionValue = allBookings && allBookings.length > 0
        ? totalGMV / allBookings.length
        : 0;

      return {
        totalGMV,
        totalRevenue,
        takeRate: takeRate * 100,
        monthlyGMV,
        monthlyRevenue,
        avgTransactionValue,
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return {
        totalGMV: 0,
        totalRevenue: 0,
        takeRate: 10,
        monthlyGMV: 0,
        monthlyRevenue: 0,
        avgTransactionValue: 0,
      };
    }
  }

  /**
   * Get North Star Metric: Matches played per week
   */
  async getNorthStarMetric(): Promise<{
    thisWeek: number;
    lastWeek: number;
    weeklyGrowth: number;
    monthlyTotal: number;
  }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const { count: thisWeek } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('date', weekStart.toISOString().split('T')[0]);

      const { count: lastWeek } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('date', lastWeekStart.toISOString().split('T')[0])
        .lt('date', weekStart.toISOString().split('T')[0]);

      const { count: monthly } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('date', monthStart.toISOString().split('T')[0]);

      const thisWeekCount = thisWeek || 0;
      const lastWeekCount = lastWeek || 0;
      const weeklyGrowth = lastWeekCount > 0
        ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
        : thisWeekCount > 0 ? 100 : 0;

      return {
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        weeklyGrowth,
        monthlyTotal: monthly || 0,
      };
    } catch (error) {
      console.error('Error getting North Star metric:', error);
      return {
        thisWeek: 0,
        lastWeek: 0,
        weeklyGrowth: 0,
        monthlyTotal: 0,
      };
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    this.endSession();
  }
}

export const analyticsService = new AnalyticsService();
