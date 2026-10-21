import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useMedicQTheme";

interface Props {
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ message = "Memuat..." }) => {
  const c = useColors();
  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.message, { color: c.onSurface }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    minWidth: 160,
  },
  message: {
    fontSize: 14,
  },
});
