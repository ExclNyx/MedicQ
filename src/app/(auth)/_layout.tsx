import { Stack } from 'expo-router';
import { Colors } from '../../core/constants/colors';

// Semua layar di folder (auth) menggambar header-nya sendiri (lihat AuthScreen),
// jadi header bawaan navigasi dimatikan supaya tampilannya seragam dengan login.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* Langkah terakhir pendaftaran: tidak bisa kembali dengan swipe (iOS) */}
      <Stack.Screen name="complete-profile" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
