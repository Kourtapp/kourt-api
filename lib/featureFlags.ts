// Feature flags para controlar funcionalidades do app
// Flags desabilitadas ainda estão em desenvolvimento

export const FEATURES = {
  // Funcionalidades de assinatura Premium
  SUBSCRIPTIONS: true,

  // Sistema de seguidores
  FOLLOWERS: false,

  // Estatísticas avançadas de jogador
  ADVANCED_STATS: false,

  // Programa de indicação
  REFERRALS: false,

  // Sistema de conquistas/achievements
  ACHIEVEMENTS: false,

  // Clubes e comunidades
  CLUBS: false,

  // Sistema de XP e níveis
  XP_SYSTEM: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
