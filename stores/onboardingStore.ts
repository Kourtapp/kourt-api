import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface OnboardingState {
  selectedSports: string[];
  sportLevels: Record<string, string>;
  playFrequency: string;
  preferredSchedule: string[];
  goals: string[];
  isCompleted: boolean;

  setSports: (sports: string[]) => void;
  setLevels: (levels: Record<string, string>) => void;
  setFrequency: (frequency: string) => void;
  setPreferredSchedule: (schedule: string[]) => void;
  setGoals: (goals: string[]) => void;
  completeOnboarding: () => Promise<void>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  selectedSports: [],
  sportLevels: {},
  playFrequency: '',
  preferredSchedule: [],
  goals: [],
  isCompleted: false,

  setSports: (sports) => set({ selectedSports: sports }),

  setLevels: (levels) => set({ sportLevels: levels }),

  setFrequency: (frequency) => set({ playFrequency: frequency }),

  setPreferredSchedule: (schedule) => set({ preferredSchedule: schedule }),

  setGoals: (goals) => set({ goals }),

  completeOnboarding: async () => {
    const { selectedSports, sportLevels, playFrequency, preferredSchedule, goals } = get();
    const user = useAuthStore.getState().user;

    if (!user) return;

    try {
      // First, try to update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          sports: selectedSports,
          sport_levels: sportLevels,
          play_frequency: playFrequency,
          preferred_schedule: preferredSchedule,
          goals: goals,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // If update failed (profile doesn't exist), create it
      if (updateError) {
        console.log('Profile not found, creating new profile...');
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          sports: selectedSports,
          sport_levels: sportLevels,
          play_frequency: playFrequency,
          preferred_schedule: preferredSchedule,
          goals: goals,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
      }

      // Refresh profile in auth store
      await useAuthStore.getState().refreshProfile();
      set({ isCompleted: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  reset: () =>
    set({
      selectedSports: [],
      sportLevels: {},
      playFrequency: '',
      preferredSchedule: [],
      goals: [],
      isCompleted: false,
    }),
}));
