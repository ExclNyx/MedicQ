import { Stack } from 'expo-router';
import { useColors } from '../../core/theme/ThemeContext';

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
      <Stack.Screen name="patient-detail" />
      <Stack.Screen name="complaint-form" />
      <Stack.Screen name="manual-register" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function StaffLayout() {
  return <StaffStack />;
}
