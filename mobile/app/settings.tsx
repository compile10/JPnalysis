import { ActivityIndicator, ScrollView, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRawCSSTheme } from "@/hooks/use-raw-css-theme";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsScreen() {
  const { isHydrated } = useSettingsStore();
  const tintColor = useRawCSSTheme("primary");

  if (!isHydrated) {
    return (
      <ThemedView
        className="flex-1 items-center justify-center gap-4 pb-24"
        edges={["left", "right"]}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText className="text-muted-foreground">
          Loading settings...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" edges={["left", "right"]}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mb-6 mt-5">
          <ThemedText type="subtitle" className="mb-2">
            General
          </ThemedText>
          <ThemedText className="text-sm opacity-70">
            More settings are coming soon.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
