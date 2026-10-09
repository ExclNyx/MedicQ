import { Redirect, Stack } from 'expo-router';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';

function StaffStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="[slug]" />
      <Stack.Screen name="patient-detail" />
      <Stack.Screen name="complaint-form" />
      <Stack.Screen name="manual-register" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function StaffLayout() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  if (user.role !== 'staff') {
    if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
    if (user.role === 'patient') return <Redirect href="/(auth)/patient-access" />;
    return <Redirect href="/(auth)/login" />;
  }

  return <StaffStack />;
}
