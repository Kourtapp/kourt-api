// stores/useCoachStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CoachState {
  hasSeenTutorial: boolean;
  currentStep: number;
  isActive: boolean;

  checkTutorialStatus: () => Promise<void>;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => Promise<void>;
  completeTutorial: () => Promise<void>;
}

const COACH_STORAGE_KEY = 'kourt_coach_completed';

export const useCoachStore = create<CoachState>((set, get) => ({
  hasSeenTutorial: false,
  currentStep: 0,
  isActive: false,

  checkTutorialStatus: async () => {
    try {
      const completed = await AsyncStorage.getItem(COACH_STORAGE_KEY);
      set({ hasSeenTutorial: completed === 'true' });
    } catch {
      set({ hasSeenTutorial: false });
    }
  },

  startTutorial: () => {
    set({ isActive: true, currentStep: 0 });
  },

  nextStep: () => {
    const { currentStep } = get();
    set({ currentStep: currentStep + 1 });
  },

  skipTutorial: async () => {
    await AsyncStorage.setItem(COACH_STORAGE_KEY, 'true');
    set({ isActive: false, hasSeenTutorial: true });
  },

  completeTutorial: async () => {
    await AsyncStorage.setItem(COACH_STORAGE_KEY, 'true');
    set({ isActive: false, hasSeenTutorial: true });
  },
}));
