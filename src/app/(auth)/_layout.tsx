import { Stack } from 'expo-router';
import { useColors } from '../../core/theme/ThemeContext';

export default function AuthLayout() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* Langkah terakhir pendaftaran: tidak bisa kembali dengan swipe (iOS) */}
      <Stack.Screen name="complete-profile" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
