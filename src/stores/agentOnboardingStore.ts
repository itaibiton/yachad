import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlightFormState, FlightStop } from "@/shared/components/flights/FlightFormFields";

export interface OnboardingProfile {
  phone: string;
  whatsappNumber: string;
  country: string;
  companyName: string;
  websiteUrl: string;
}

export interface PendingFlight {
  form: FlightFormState;
  stops: FlightStop[];
}

interface AgentOnboardingState {
  currentStep: number;
  direction: 1 | -1;
  profile: OnboardingProfile;
  pendingFlights: PendingFlight[];

  goNext: () => void;
  goBack: () => void;
  setStep: (step: number) => void;
  setProfile: (updates: Partial<OnboardingProfile>) => void;
  addFlight: (flight: PendingFlight) => void;
  removeFlight: (index: number) => void;
  reset: () => void;
}

const initialProfile: OnboardingProfile = {
  phone: "",
  whatsappNumber: "",
  country: "",
  companyName: "",
  websiteUrl: "",
};

export const useAgentOnboardingStore = create<AgentOnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      direction: 1,
      profile: { ...initialProfile },
      pendingFlights: [],

      goNext: () =>
        set((s) => ({ currentStep: s.currentStep + 1, direction: 1 })),
      goBack: () =>
        set((s) => ({ currentStep: s.currentStep - 1, direction: -1 })),
      setStep: (step) =>
        set((s) => ({
          currentStep: step,
          direction: step > s.currentStep ? 1 : -1,
        })),
      setProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),
      addFlight: (flight) =>
        set((s) => ({ pendingFlights: [...s.pendingFlights, flight] })),
      removeFlight: (index) =>
        set((s) => ({
          pendingFlights: s.pendingFlights.filter((_, i) => i !== index),
        })),
      reset: () =>
        set({
          currentStep: 0,
          direction: 1,
          profile: { ...initialProfile },
          pendingFlights: [],
        }),
    }),
    {
      name: "yachad-agent-onboarding",
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
