import { Ionicons } from "@expo/vector-icons";
import * as Network from "expo-network";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useMedicQTheme";

export function NetworkStatusBanner() {
  const c = useColors();
  const network = Network.useNetworkState();

  const hasStatus =
    typeof network.isConnected === "boolean" ||
    typeof network.isInternetReachable === "boolean";

  if (!hasStatus) {
    return null;
  }

  const isOffline =
    network.isConnected === false || network.isInternetReachable === false;

  const color = isOffline ? c.error : c.success;
  const backgroundColor = isOffline ? c.errorContainer : c.successBg;

  return (
    <View
      style={[styles.banner, { backgroundColor }]}
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isOffline ? "cloud-offline-outline" : "wifi-outline"}
        size={17}
        color={color}
      />

      <Text style={[styles.text, { color }]}>
        {isOffline
          ? "Offline — Periksa koneksi internet"
          : "Online — Koneksi tersedia"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
