import { Stack } from 'expo-router';
import { ThemeProvider, useColors } from '../core/theme/ThemeContext';

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
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(patient)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(staff)" options={{ animation: 'fade' }} />
      <Stack.Screen name="display" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
