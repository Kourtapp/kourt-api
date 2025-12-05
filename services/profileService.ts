import { supabase } from '@/lib/supabase';
import {
  Profile,
  ProfileUpdate,
  Achievement,
  UserAchievement,
  Challenge,
  UserChallenge,
} from '@/types/database.types';

export const profileService = {
  // Buscar perfil do usuário
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar perfil
  async updateProfile(
    userId: string,
    updates: ProfileUpdate,
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Completar onboarding
  async completeOnboarding(
    userId: string,
    data: {
      sports: string[];
      sport_levels: Record<string, string>;
      play_frequency: string;
      goals: string[];
    },
  ): Promise<Profile> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        xp: 50, // XP bônus por completar onboarding
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Verificar conquistas de boas-vindas
    await checkAchievements(userId);

    return profile;
  },

  // Atualizar avatar
  async updateAvatar(userId: string, avatarUri: string): Promise<string> {
    const fileName = `${userId}-${Date.now()}.jpg`;

    // Converter URI para blob (em React Native)
    const response = await fetch(avatarUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Atualizar perfil com novo avatar
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    return publicUrl;
  },

  // Adicionar XP
  async addXP(userId: string, amount: number): Promise<Profile> {
    const profile = await profileService.getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    let newXPToNext = profile.xp_to_next_level;

    // Verificar level up
    while (newXP >= newXPToNext) {
      newXP -= newXPToNext;
      newLevel++;
      newXPToNext = Math.floor(newXPToNext * 1.5); // Aumenta 50% por nível
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        xp_to_next_level: newXPToNext,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar streak
  async updateStreak(userId: string): Promise<number> {
    const profile = await profileService.getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        streak: profile.streak + 1,
      })
      .eq('id', userId)
      .select('streak')
      .single();

    if (error) throw error;
    return data.streak;
  },

  // Buscar conquistas do usuário
  async getUserAchievements(
    userId: string,
  ): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievement:achievements(*)
      `,
      )
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar todas as conquistas
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Buscar desafios ativos do usuário
  async getUserChallenges(
    userId: string,
  ): Promise<(UserChallenge & { challenge: Challenge })[]> {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(
        `
        *,
        challenge:challenges(*)
      `,
      )
      .eq('user_id', userId)
      .eq('completed', false);

    if (error) throw error;
    return data || [];
  },

  // Buscar desafios disponíveis
  async getAvailableChallenges(): Promise<Challenge[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now);

    if (error) throw error;
    return data || [];
  },

  // Iniciar desafio
  async startChallenge(
    userId: string,
    challengeId: string,
  ): Promise<UserChallenge> {
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar progresso do desafio
  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
  ): Promise<UserChallenge> {
    // Buscar o desafio para saber o target
    const { data: challenge } = await supabase
      .from('challenges')
      .select('target_count, xp_reward')
      .eq('id', challengeId)
      .single();

    const completed = progress >= (challenge?.target_count || 0);

    const { data, error } = await supabase
      .from('user_challenges')
      .update({
        progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();

    if (error) throw error;

    // Se completou, dar XP
    if (completed && challenge?.xp_reward) {
      await profileService.addXP(userId, challenge.xp_reward);
    }

    return data;
  },
};

// Verificar e desbloquear conquistas
async function checkAchievements(userId: string): Promise<void> {
  const profile = await profileService.getProfile(userId);
  if (!profile) return;

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(
    userAchievements?.map((ua) => ua.achievement_id) || [],
  );

  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    const condition = achievement.condition as { type: string; count: number };
    let shouldUnlock = false;

    switch (condition.type) {
      case 'matches':
        shouldUnlock = profile.total_matches >= condition.count;
        break;
      case 'wins':
        shouldUnlock = profile.wins >= condition.count;
        break;
      case 'streak':
        shouldUnlock = profile.streak >= condition.count;
        break;
    }

    if (shouldUnlock) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // Dar XP da conquista
      if (achievement.xp_reward) {
        await profileService.addXP(userId, achievement.xp_reward);
      }
    }
  }
}
