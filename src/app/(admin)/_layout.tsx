import { Redirect, Stack } from 'expo-router';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';

export default function AdminLayout() {
  const c = useColors();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'admin') {
    if (user.role === 'staff') {
      return <Redirect href="/(staff)/dashboard" />;
    }
    if (user.role === 'patient') {
      return <Redirect href="/(auth)/patient-access" />;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="[slug]" />
    </Stack>
  );
}
