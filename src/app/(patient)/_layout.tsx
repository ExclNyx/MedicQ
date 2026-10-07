import { Stack } from 'expo-router';
import { useColors } from '../../core/theme/ThemeContext';

function PatientStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="register-visit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="queue-status" />
      <Stack.Screen name="history" />
    </Stack>
  );
}

export default function PatientLayout() {
  return <PatientStack />;
}
