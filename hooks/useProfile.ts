import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services/profileService';
import {
  Profile,
  ProfileUpdate,
  Achievement,
  UserAchievement,
  Challenge,
  UserChallenge,
} from '@/types/database.types';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: ProfileUpdate): Promise<Profile> => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const updatedProfile = await profileService.updateProfile(
        userId,
        updates,
      );
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar perfil');
    }
  };

  const updateAvatar = async (avatarUri: string): Promise<string> => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const avatarUrl = await profileService.updateAvatar(userId, avatarUri);
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      return avatarUrl;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar avatar');
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateAvatar,
  };
}

export function useCompleteOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = useCallback(
    async (
      userId: string,
      data: {
        sports: string[];
        sport_levels: Record<string, string>;
        play_frequency: string;
        goals: string[];
      },
    ): Promise<Profile> => {
      try {
        setLoading(true);
        setError(null);
        const profile = await profileService.completeOnboarding(userId, data);
        return profile;
      } catch (err: any) {
        const message = err.message || 'Erro ao completar onboarding';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { completeOnboarding, loading, error };
}

export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<
    (UserAchievement & { achievement: Achievement })[]
  >([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const all = await profileService.getAllAchievements();
      setAllAchievements(all);

      if (userId) {
        const userAchievements =
          await profileService.getUserAchievements(userId);
        setAchievements(userAchievements);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conquistas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlockedIds = new Set(achievements.map((a) => a.achievement_id));

  return {
    achievements,
    allAchievements,
    unlockedIds,
    loading,
    error,
    refetch: fetchAchievements,
  };
}

export function useChallenges(userId: string | undefined) {
  const [userChallenges, setUserChallenges] = useState<
    (UserChallenge & { challenge: Challenge })[]
  >([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const available = await profileService.getAvailableChallenges();
      setAvailableChallenges(available);

      if (userId) {
        const userChalls = await profileService.getUserChallenges(userId);
        setUserChallenges(userChalls);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar desafios');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const startChallenge = async (
    challengeId: string,
  ): Promise<UserChallenge> => {
    if (!userId) throw new Error('Usuário não autenticado');

    try {
      const userChallenge = await profileService.startChallenge(
        userId,
        challengeId,
      );
      await fetchChallenges(); // Refresh
      return userChallenge;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao iniciar desafio');
    }
  };

  const startedIds = new Set(userChallenges.map((c) => c.challenge_id));

  return {
    userChallenges,
    availableChallenges,
    startedIds,
    loading,
    error,
    refetch: fetchChallenges,
    startChallenge,
  };
}

export function useAddXP() {
  const [loading, setLoading] = useState(false);

  const addXP = useCallback(
    async (userId: string, amount: number): Promise<Profile> => {
      try {
        setLoading(true);
        const profile = await profileService.addXP(userId, amount);
        return profile;
      } catch (err: any) {
        throw new Error(err.message || 'Erro ao adicionar XP');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { addXP, loading };
}
