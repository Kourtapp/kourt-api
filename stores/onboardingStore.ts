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

    // Ensure we have the latest user session
    let user = useAuthStore.getState().user;
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user || null;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    try {
      // Prepare data
      const profileData = {
        sports: selectedSports,
        sport_levels: sportLevels,
        play_frequency: playFrequency,
        preferred_schedule: preferredSchedule,
        goals: goals,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      // If update failed (likely no profile), create it
      if (updateError) {
        console.log('Profile update failed, trying insert...', updateError.message);

        const { error: insertError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          ...profileData
        });

        if (insertError) {
          console.error('Error creating/upserting profile:', insertError);
          throw insertError;
        }
      }

      // Refresh profile in auth store to reflect changes in UI
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
