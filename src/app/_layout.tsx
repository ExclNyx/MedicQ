import * as Network from "expo-network";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider, useColors } from "@/hooks/useMedicQTheme";

function NetworkStatusBanner() {
  const c = useColors();
  const [network, setNetwork] = useState<Awaited<
    ReturnType<typeof Network.getNetworkStateAsync>
  > | null>(null);

  useEffect(() => {
    let active = true;

    const updateNetwork = (
      state: Awaited<ReturnType<typeof Network.getNetworkStateAsync>>,
    ) => {
      if (active) setNetwork(state);
    };

    Network.getNetworkStateAsync()
      .then(updateNetwork)
      .catch(() => {
        if (active) setNetwork(null);
      });

    const subscription = Network.addNetworkStateListener(updateNetwork);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (!network) return null;

  const offline =
    network.isConnected === false ||
    network.isInternetReachable === false ||
    network.type === Network.NetworkStateType.NONE;

  const color = offline ? c.error : c.success;
  const backgroundColor = offline ? c.errorContainer : c.successBg;

  return (
    <View
      style={[styles.networkBanner, { backgroundColor }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
    >
      <View style={[styles.networkDot, { backgroundColor: color }]} />
      <Text style={[styles.networkText, { color }]}>
        {offline
          ? "Offline — Periksa koneksi internet"
          : "Online — Koneksi tersedia"}
      </Text>
    </View>
  );
}

function AuthSessionSync() {
  useAuth();
  return null;
}

function RootStack() {
  const c = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
      <Stack.Screen name="(patient)" options={{ animation: "fade" }} />
      <Stack.Screen name="(staff)" options={{ animation: "fade" }} />
      <Stack.Screen name="(admin)" options={{ animation: "fade" }} />
      <Stack.Screen name="display" options={{ animation: "fade" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthSessionSync />
      <View style={styles.root}>
        <NetworkStatusBanner />
        <View style={styles.content}>
          <RootStack />
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  networkBanner: {
    minHeight: 32,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
