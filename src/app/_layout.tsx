import { Stack } from 'expo-router';
import { Colors } from '../core/constants/colors';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(patient)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(staff)" options={{ animation: 'fade' }} />
      <Stack.Screen name="display" options={{ animation: 'fade' }} />
    </Stack>
  );
}
