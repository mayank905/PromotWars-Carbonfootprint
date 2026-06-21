import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      budget: 15.0, // kg CO2e per day
      spent: 0.0,
      worldScore: 100, // 0-100 score for world health
      entries: [],
      addEntry: (entry) => set((state) => {
        const newSpent = state.spent + entry.carbon_kg;
        const newWorldScore = Math.max(0, Math.min(100, state.worldScore + entry.world_impact));
        return {
          spent: newSpent,
          worldScore: newWorldScore,
          entries: [entry, ...state.entries]
        }
      }),
      removeEntry: (id) => set((state) => {
        const entry = state.entries.find(e => e.id === id);
        if (!entry) return state;
        const newSpent = Math.max(0, state.spent - entry.carbon_kg);
        const newWorldScore = Math.max(0, Math.min(100, state.worldScore - entry.world_impact));
        return {
          spent: newSpent,
          worldScore: newWorldScore,
          entries: state.entries.filter(e => e.id !== id)
        }
      }),
      updateEntry: (id, updatedEntry) => set((state) => {
        const oldEntry = state.entries.find(e => e.id === id);
        if (!oldEntry) return state;
        const carbonDiff = updatedEntry.carbon_kg - oldEntry.carbon_kg;
        const impactDiff = updatedEntry.world_impact - oldEntry.world_impact;
        
        return {
          spent: Math.max(0, state.spent + carbonDiff),
          worldScore: Math.max(0, Math.min(100, state.worldScore + impactDiff)),
          entries: state.entries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
        }
      }),
      resetDaily: () => set({ spent: 0, entries: [] })
    }),
    {
      name: 'ecosphere-storage-v2',
    }
  )
)
