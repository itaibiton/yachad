import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  selectedCountry: string | null;
  hasCompletedOnboarding: boolean;
  sidebarCollapsed: boolean;
  setSelectedCountry: (country: string) => void;
  completeOnboarding: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCountry: null,
      hasCompletedOnboarding: false,
      sidebarCollapsed: false,
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: "yachad-app-state" }
  )
);
