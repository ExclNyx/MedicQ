import { Stack } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function PatientLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="home" options={{ title: 'Beranda' }} />
      <Stack.Screen name="register-visit" options={{ title: 'Daftar Kunjungan' }} />
      <Stack.Screen name="queue-status" options={{ title: 'Status Antrean' }} />
      <Stack.Screen name="history" options={{ title: 'Riwayat' }} />
    </Stack>
  );
}
