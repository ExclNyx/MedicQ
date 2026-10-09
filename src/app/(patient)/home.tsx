import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '../../components/ui/OutlineButton';
import { PatientHeader } from '../../components/ui/PatientHeader';
import { QueueCard } from '../../components/ui/QueueCard';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { usePatientQueue } from '../../hooks/usePatientQueue';
import { authService } from '../../services/auth.service';

export default function PatientHomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { myRegistration, myQueue, position, currentServing, aheadQueues, isLoading, error } = usePatientQueue(user?.uid);
  const [refreshHint, setRefreshHint] = useState(false);

  const todayLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  const logout = async () => {
    await authService.signOut();
    useAuthStore.getState().setUser(null);
    router.replace('/(auth)/login');
  };

  const statusTitle = myQueue?.status === 'CALLED'
    ? 'Sedang Dilayani'
    : myQueue?.status === 'COMPLETED'
      ? 'Pelayanan Selesai'
      : myQueue?.status === 'WAITING'
        ? 'Menunggu Antrean'
        : 'Status Antrean';

  const statusDescription = myQueue?.status === 'CALLED'
    ? 'Nomor kamu sudah dipanggil. Segera menuju poli tujuan.'
    : myQueue?.status === 'COMPLETED'
      ? 'Nomor antrean ini sudah selesai dilayani. Terima kasih.'
      : (myQueue?.skipCount ?? 0) > 0
        ? 'Nomor kamu kembali menunggu di belakang antrean setelah sebelumnya tidak merespons panggilan.'
        : 'Pantau nomor yang sedang dilayani dan jumlah pasien yang berada di depan kamu.';

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.onSurfaceVariant }]}>Memuat nomor antrean…</Text>
      </View>
    );
  }

  if (!myQueue) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: c.background, paddingHorizontal: 24 }]}>
        <Ionicons name={error ? 'alert-circle-outline' : 'ticket-outline'} size={38} color={c.primary} />
        <Text style={[styles.statusTitle, { color: c.onSurface, textAlign: 'center', marginTop: 12 }]}>
          {error ? 'Antrean belum dapat dimuat' : 'Nomor antrean belum tersedia'}
        </Text>
        <Text style={[styles.loadingText, { color: c.onSurfaceVariant, textAlign: 'center' }]}>
          {error ?? 'Kembali ke halaman akses pasien dan pastikan petugas sudah menerbitkan nomor antrean.'}
        </Text>
        <OutlineButton
          label="Kembali ke Akses Pasien"
          icon="chevron-back"
          onPress={() => router.replace('/(auth)/patient-access')}
        />
      </View>
    );
  }

  const queueForDisplay = myQueue;

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <PatientHeader
          title=""
          showBack={false}
          right={
            <View style={styles.headerButtons}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={logout}
                style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.14)' }]}
                accessibilityRole="button"
                accessibilityLabel="Keluar"
              >
                <Ionicons name="log-out-outline" size={20} color={c.onPrimary} />
              </TouchableOpacity>
            </View>
          }
        >
          <Text style={[styles.greeting, { color: c.onPrimaryMuted }]}>Halo,</Text>
          <Text style={[styles.name, { color: c.onPrimary }]}>{user?.displayName || 'Pasien'}</Text>
          <Text style={[styles.date, { color: c.onPrimaryMuted }]}>{todayLabel}</Text>
        </PatientHeader>

        <View style={styles.body}>
          <View style={[styles.statusCard, { backgroundColor: c.surface, borderColor: c.cardBorder, shadowColor: c.primaryDeep }]}> 
            <View style={[styles.statusIcon, { backgroundColor: myQueue?.status === 'CALLED' ? c.primaryContainer : c.surfaceSoft }]}> 
              <Ionicons
                name={myQueue?.status === 'CALLED' ? 'megaphone-outline' : myQueue?.status === 'COMPLETED' ? 'checkmark-circle-outline' : 'time-outline'}
                size={25}
                color={myQueue?.status === 'CALLED' ? c.primary : myQueue?.status === 'COMPLETED' ? c.success : c.primary}
              />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.statusTitle, { color: c.onSurface }]}>{statusTitle}</Text>
              <Text style={[styles.statusDescription, { color: c.onSurfaceVariant }]}>{statusDescription}</Text>
            </View>
          </View>

          <QueueCard
            queue={queueForDisplay}
            position={position}
            currentServing={currentServing}
            aheadQueues={aheadQueues}
          />

          <View style={[styles.liveCard, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}> 
            <View style={[styles.liveIcon, { backgroundColor: c.primaryContainer }]}> 
              <Ionicons name="radio-outline" size={19} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.liveTitle, { color: c.onSurface }]}>Antrean real-time</Text>
              <Text style={[styles.liveText, { color: c.onSurfaceVariant }]}>Data berubah otomatis saat petugas memanggil, memanggil ulang, atau menyelesaikan antrean.</Text>
            </View>
          </View>

          {myRegistration?.serviceName ? (
            <View style={[styles.polIcard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}> 
              <View style={[styles.smallIcon, { backgroundColor: c.surfaceSoft }]}> 
                <Ionicons name="business-outline" size={19} color={c.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.smallLabel, { color: c.onSurfaceVariant }]}>Poli tujuan</Text>
                <Text style={[styles.smallValue, { color: c.onSurface }]}>{myRegistration.serviceName}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.quickRow, { backgroundColor: c.surface, borderColor: c.cardBorder }]}
            onPress={() => router.push('/(patient)/queue-status')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: c.surfaceSoft }]}> 
              <Ionicons name="list-outline" size={20} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.quickTitle, { color: c.onSurface }]}>Detail Antrean</Text>
              <Text style={[styles.quickSub, { color: c.onSurfaceVariant }]}>Lihat urutan dan status terbaru</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickRow, { backgroundColor: c.surface, borderColor: c.cardBorder }]}
            onPress={() => router.push('/(patient)/history')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: c.surfaceSoft }]}> 
              <Ionicons name="time-outline" size={20} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.quickTitle, { color: c.onSurface }]}>Riwayat Kunjungan</Text>
              <Text style={[styles.quickSub, { color: c.onSurfaceVariant }]}>Lihat kunjungan sebelumnya</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.onSurfaceVariant} />
          </TouchableOpacity>

          <OutlineButton
            label={refreshHint ? 'Data diperbarui otomatis' : 'Status terus diperbarui real-time'}
            icon="sync-outline"
            onPress={() => setRefreshHint(true)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  name: { fontSize: 26, fontWeight: '800', marginTop: 2, lineHeight: 34 },
  date: { fontSize: 13, lineHeight: 18, marginTop: 6, flexShrink: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 20, marginTop: -40, gap: 14 },
  statusCard: { borderRadius: 22, padding: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  statusIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  statusDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  flex: { flex: 1, minWidth: 0 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13 },
  liveCard: { borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  liveIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  liveTitle: { fontSize: 13, fontWeight: '800' },
  liveText: { fontSize: 11, lineHeight: 17, marginTop: 2 },
  polIcard: { borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1 },
  smallIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  smallLabel: { fontSize: 11 },
  smallValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  quickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 15, borderWidth: 1 },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 14, fontWeight: '800', lineHeight: 19 },
  quickSub: { fontSize: 11, lineHeight: 16, marginTop: 2 },
});
