import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MatchPhoto {
  uri: string;
  type: 'photo' | 'video';
}

interface PlayerData {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  team: 'A' | 'B';
}

interface RegisterMatchData {
  // Step 1 - Photos
  photos: MatchPhoto[];
  addKourtBranding: boolean;

  // Step 2 - Sport and Location
  sport: string;
  courtId: string | null;
  courtName: string;
  courtDetectedByGPS: boolean;
  date: Date;
  time: string;
  duration: number; // in minutes

  // Step 3 - Result
  result: 'win' | 'loss' | 'draw' | null;
  score: { teamA: number[]; teamB: number[] }; // Array of sets
  players: PlayerData[];

  // Step 4 - Metrics
  intensity: number; // 1-5
  effort: number; // 1-5
  feeling: 'bad' | 'neutral' | 'good' | 'great' | null;
  acesWinners: number;
  unforcedErrors: number;
  notes: string;

  // Visibility
  visibility: 'public' | 'friends' | 'private';
  silentActivity: boolean; // Don't post to feed

  // Apple Watch data (optional)
  appleWatchData?: {
    avgBPM: number;
    calories: number;
    distance: number;
  };
}

interface RegisterMatchContextType {
  data: RegisterMatchData;
  updateData: (updates: Partial<RegisterMatchData>) => void;
  addPhoto: (photo: MatchPhoto) => void;
  removePhoto: (index: number) => void;
  addPlayer: (player: PlayerData) => void;
  removePlayer: (playerId: string) => void;
  addSet: () => void;
  updateSetScore: (setIndex: number, team: 'teamA' | 'teamB', score: number) => void;
  reset: () => void;
}

const initialData: RegisterMatchData = {
  photos: [],
  addKourtBranding: true,
  sport: 'BeachTennis',
  courtId: null,
  courtName: '',
  courtDetectedByGPS: false,
  date: new Date(),
  time: '18:00',
  duration: 60,
  result: null,
  score: { teamA: [0], teamB: [0] },
  players: [],
  intensity: 3,
  effort: 3,
  feeling: null,
  acesWinners: 0,
  unforcedErrors: 0,
  notes: '',
  visibility: 'public',
  silentActivity: false,
};

const RegisterMatchContext = createContext<RegisterMatchContextType | null>(null);

export function RegisterMatchProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterMatchData>(initialData);

  const updateData = (updates: Partial<RegisterMatchData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const addPhoto = (photo: MatchPhoto) => {
    setData(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  };

  const removePhoto = (index: number) => {
    setData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const addPlayer = (player: PlayerData) => {
    setData(prev => ({
      ...prev,
      players: [...prev.players, player],
    }));
  };

  const removePlayer = (playerId: string) => {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId),
    }));
  };

  const addSet = () => {
    setData(prev => ({
      ...prev,
      score: {
        teamA: [...prev.score.teamA, 0],
        teamB: [...prev.score.teamB, 0],
      },
    }));
  };

  const updateSetScore = (setIndex: number, team: 'teamA' | 'teamB', score: number) => {
    setData(prev => {
      const newScore = { ...prev.score };
      newScore[team] = [...newScore[team]];
      newScore[team][setIndex] = score;
      return { ...prev, score: newScore };
    });
  };

  const reset = () => {
    setData(initialData);
  };

  return (
    <RegisterMatchContext.Provider
      value={{
        data,
        updateData,
        addPhoto,
        removePhoto,
        addPlayer,
        removePlayer,
        addSet,
        updateSetScore,
        reset,
      }}
    >
      {children}
    </RegisterMatchContext.Provider>
  );
}

export function useRegisterMatch() {
  const context = useContext(RegisterMatchContext);
  if (!context) {
    throw new Error('useRegisterMatch must be used within RegisterMatchProvider');
  }
  return context;
}
