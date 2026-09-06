import type { UserSettings } from "@common/types";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {},
      setSettings: (settings) => set({ settings }),
      isHydrated: false,
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "kaitai-settings",
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
);
