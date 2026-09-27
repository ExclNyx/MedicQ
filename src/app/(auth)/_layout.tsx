import { Stack } from 'expo-router';
import { Colors } from '../../core/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Masuk', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Daftar Akun Baru' }} />
      <Stack.Screen name="complete-profile" options={{ title: 'Lengkapi Data Diri' }} />
    </Stack>
  );
}
