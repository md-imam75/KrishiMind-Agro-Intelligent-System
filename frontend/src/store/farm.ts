import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FarmProfile, Plot } from '@/types';

interface FarmState {
  profile: FarmProfile | null;
  plots: Plot[];
  setProfile: (profile: FarmProfile) => void;
  setPlots: (plots: Plot[]) => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      profile: null,
      plots: [],
      setProfile: (profile) => set({ profile }),
      setPlots: (plots) => set({ plots }),
    }),
    { name: 'km-farm' }
  )
);
