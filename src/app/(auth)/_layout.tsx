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
      <Stack.Screen name="complete-profile" options={{ gestureEnabled: false }} />
      <Stack.Screen name="patient-access" options={{ gestureEnabled: false }} />
      <Stack.Screen name="patient-visit-registration" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
