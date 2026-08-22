import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { useFonts } from "expo-font";

export const geist = {
  regular: "Geist_400Regular",
} as const;

export function useGeistFonts() {
  return useFonts({
    Geist_400Regular,
  });
}
