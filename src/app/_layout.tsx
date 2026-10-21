import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider, useColors } from "@/hooks/useMedicQTheme";
import { Stack } from "expo-router";

function AuthSessionSync() {
  useAuth();
  return null;
}

// Komponen ini berada DI DALAM ThemeProvider.
function RootStack() {
  const c = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: c.background,
        },
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
      <RootStack />
    </ThemeProvider>
  );
}
