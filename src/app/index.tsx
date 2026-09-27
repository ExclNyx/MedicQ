import { Redirect } from 'expo-router';

export default function Index() {
  // Langsung arahkan ke halaman Login dummy untuk testing UI
  return <Redirect href="/(auth)/login" />;
}
