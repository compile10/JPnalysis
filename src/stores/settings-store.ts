import type { UserSettings } from "@common/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export type SettingsState = { settings: UserSettings };
export type SettingsActions = { setSettings: (settings: UserSettings) => void };
export type SettingsStore = SettingsState & SettingsActions;
export const defaultSettingsState: SettingsState = { settings: {} };

export const createSettingsStore = (
  initState: SettingsState = defaultSettingsState,
) => {
  return createStore<SettingsStore>()(
    persist(
      (set) => ({ ...initState, setSettings: (settings) => set({ settings }) }),
      {
        name: "kaitai-settings",
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        partialize: (state) => ({ settings: state.settings }),
      },
    ),
  );
};
