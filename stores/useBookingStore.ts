// stores/useBookingStore.ts
import { create } from 'zustand';
import { Court } from '@/types/database.types';

interface BookingState {
  court: Court | null;
  date: Date | null;
  time: string | null;
  duration: number;

  setCourt: (court: Court) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  court: null,
  date: null,
  time: null,
  duration: 1,

  setCourt: (court) => set({ court }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setDuration: (duration) => set({ duration }),
  reset: () => set({ court: null, date: null, time: null, duration: 1 }),
}));
