import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../core/theme/ThemeContext";

const ICON: Record<string, "sunny" | "moon" | "phone-portrait"> = {
  system: "phone-portrait",
  light: "sunny",
  dark: "moon",
};

const LABEL: Record<string, string> = {
  system: "Tema mengikuti sistem",
  light: "Mode terang",
  dark: "Mode gelap",
};

/** Tombol ganti tema: system → light → dark → system. */
export function ThemeToggle() {
  const { mode, isDark, cycleMode } = useTheme();
  const name = ICON[mode] ?? "phone-portrait";

  return (
    <TouchableOpacity
      onPress={cycleMode}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={`${LABEL[mode] ?? mode}. Ketuk untuk ganti tema.`}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={name} size={20} color={isDark ? "#BBDEFB" : "#FFFFFF"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
