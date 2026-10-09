import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '../../components/ui/OutlineButton';
import { PatientHeader } from '../../components/ui/PatientHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { registrationService } from '../../services/registration.service';

const STEPS = [
  {
    icon: 'document-attach-outline' as const,
    title: 'Daftar kunjungan',
    text: 'Konfirmasi kehadiran kamu untuk hari ini.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Verifikasi petugas',
    text: 'Datang ke receptionist/petugas untuk cek identitas.',
  },
  {
    icon: 'chatbox-ellipses-outline' as const,
    title: 'Keluhan dan poli',
    text: 'Sampaikan keluhan agar petugas menentukan poli tujuan.',
  },
  {
    icon: 'ticket-outline' as const,
    title: 'Nomor antrean',
    text: 'Nomor antrean otomatis muncul setelah poli ditentukan.',
  },
];

export default function PatientVisitRegistrationScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      await registrationService.createRegistration({
        patientId: user.uid,
        patientName: user.displayName,
      });
      Alert.alert(
        'Pendaftaran Berhasil',
        'Pendaftaran sudah masuk. Silakan datang ke receptionist/petugas untuk verifikasi identitas, menyampaikan keluhan, dan mendapatkan poli serta nomor antrean.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Tidak dapat membuat pendaftaran hari ini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}> 
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <PatientHeader title="Daftar Kunjungan" subtitle="Sebelum mendapatkan nomor antrean" />

        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.cardBorder, shadowColor: c.primaryDeep }]}> 
            <View style={[styles.icon, { backgroundColor: c.primaryContainer }]}> 
              <Ionicons name="calendar-outline" size={26} color={c.primary} />
            </View>
            <Text style={[styles.title, { color: c.onSurface }]}>Daftar untuk hari ini</Text>
            <Text style={[styles.desc, { color: c.onSurfaceVariant }]}>Pendaftaran ini belum membuat nomor antrean. Nomor baru diterbitkan setelah petugas memverifikasi identitas, mencatat keluhan, dan menentukan poli.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.cardBorder }]}> 
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Alur kunjungan</Text>
            <View style={styles.steps}>
              {STEPS.map((step, index) => (
                <View key={step.title} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View style={[styles.stepIcon, { backgroundColor: c.surfaceSoft }]}>
                      <Ionicons name={step.icon} size={18} color={c.primary} />
                    </View>
                    {index < STEPS.length - 1 ? <View style={[styles.line, { backgroundColor: c.outlineVariant }]} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.stepTitle, { color: c.onSurface }]}>{step.title}</Text>
                    <Text style={[styles.stepText, { color: c.onSurfaceVariant }]}>{step.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.tip, { backgroundColor: c.surfaceSoft, borderLeftColor: c.primary }]}> 
            <Ionicons name="card-outline" size={18} color={c.primary} />
            <Text style={[styles.tipText, { color: c.onSurfaceVariant }]}>Bawa KTP atau identitas resmi saat datang agar proses verifikasi lebih cepat.</Text>
          </View>

          <PrimaryButton label="YA, DAFTAR SEKARANG" onPress={handleSubmit} loading={loading} />
          <OutlineButton label="Batal" tone="danger" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 20, marginTop: -40, gap: 16 },
  card: { borderRadius: 24, padding: 22, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800' },
  desc: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  steps: { marginTop: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepRail: { width: 26, alignItems: 'center' },
  stepIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, height: 24, borderRadius: 1 },
  flex: { flex: 1 },
  stepTitle: { fontSize: 14, lineHeight: 20, fontWeight: '800', paddingTop: 5 },
  stepText: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  tip: { borderRadius: 18, borderLeftWidth: 4, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
