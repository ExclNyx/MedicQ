import { Stack, router } from 'expo-router';
import { Colors } from '../../core/constants/colors';
import { TouchableOpacity, Text } from 'react-native';

export default function StaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
        headerRight: () => (
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginRight: 16 }}>
            <Text style={{ color: Colors.onPrimary, fontWeight: '600' }}>Keluar</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Petugas' }} />
      <Stack.Screen name="patient-detail" options={{ title: 'Verifikasi Pasien' }} />
      <Stack.Screen name="complaint-form" options={{ title: 'Keluhan & Poli' }} />
      <Stack.Screen name="manual-register" options={{ title: 'Registrasi Manual' }} />
    </Stack>
  );
}
