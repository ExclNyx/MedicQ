import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { registrationRepository } from '../../repositories/registration.repository';

export default function PatientLayout() {
  const c = useColors();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasPatientAccess, setHasPatientAccess] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user?.uid) {
      setCheckingAccess(false);
      setHasPatientAccess(false);
      return;
    }

    setCheckingAccess(true);
    const unsub = registrationRepository.listenPatientToday(
      user.uid,
      (registration) => {
        // Pasien baru boleh membuka area pasien setelah nomor antrean diterbitkan.
        const allowed = Boolean(registration?.queueId && registration.status !== 'CANCELLED');
        setHasPatientAccess(allowed);
        setCheckingAccess(false);
      },
      (error) => {
        console.warn('[MedicQ] Tidak dapat memeriksa akses pasien:', error.message);
        setHasPatientAccess(false);
        setCheckingAccess(false);
      },
    );

    return () => unsub();
  }, [isInitialized, user?.uid]);

  if (!isInitialized || checkingAccess) {
    return (
      <View style={[styles.loader, { backgroundColor: c.background }]}> 
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'patient') {
    if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
    if (user.role === 'staff') return <Redirect href="/(staff)/dashboard" />;
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasPatientAccess) {
    return <Redirect href="/(auth)/patient-access" />;
  }

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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
