import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import type { RegistrationModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';
import { registrationRepository } from '../../repositories/registration.repository';
import { patientService } from '../../services/patient.service';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';

export default function PatientAccessScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const [registration, setRegistration] = useState<RegistrationModel | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const routedToPatientHome = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    const uid = authService.getCurrentUser()?.uid ?? user?.uid;
    if (!uid) {
      setCheckingProfile(false);
      setLoadingRegistration(false);
      return;
    }

    let active = true;
    routedToPatientHome.current = false;

    void patientService
      .getProfile(uid)
      .then((profile) => {
        if (!active) return;
        if (!profile) {
          router.replace('/(auth)/complete-profile');
          return;
        }
        setCheckingProfile(false);
      })
      .catch(() => {
        if (active) setCheckingProfile(false);
      });

    const unsub = registrationRepository.listenPatientToday(
      uid,
      (reg) => {
        if (!active) return;
        setRegistrationError(null);
        setRegistration(reg);
        setLoadingRegistration(false);

        if (reg?.queueId && reg.status !== 'CANCELLED') {
          // Snapshot bisa terpanggil berulang; navigasikan hanya sekali.
          if (!routedToPatientHome.current) {
            routedToPatientHome.current = true;
            router.replace('/(patient)/home');
          }
        } else {
          routedToPatientHome.current = false;
        }
      },
      (error) => {
        if (!active) return;
        const code = (error as Error & { code?: string }).code;
        setRegistration(null);
        setLoadingRegistration(false);
        setRegistrationError(
          code === 'failed-precondition'
            ? 'Index Firestore untuk registrations belum aktif. Buka Firestore → Indexes dan tunggu status Enabled.'
            : code === 'permission-denied'
              ? 'Firestore menolak akses. Periksa Firestore Rules dan role pada users/{uid}.'
              : 'Status pendaftaran tidak dapat dimuat. Periksa koneksi dan konfigurasi Firebase.',
        );
      },
    );

    return () => {
      active = false;
      unsub();
    };
  }, [isInitialized, user?.uid]);

  const logout = async () => {
    await authService.signOut();
    useAuthStore.getState().setUser(null);
    router.replace('/(auth)/login');
  };

  const goRegisterVisit = () => {
    router.push('/(auth)/patient-visit-registration');
  };

  useEffect(() => {
    if (!isInitialized || !user || user.role === 'patient') return;
    if (user.role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else if (user.role === 'staff') {
      router.replace('/(staff)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isInitialized, user?.role]);

  if (isInitialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role && user.role !== 'patient') {
    return <View style={[styles.loader, { backgroundColor: c.background }]}><ActivityIndicator size="large" color={c.primary} /></View>;
  }

  if (!isInitialized || checkingProfile || loadingRegistration) {
    return (
      <View style={[styles.loader, { backgroundColor: c.background }]}> 
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loaderText, { color: c.onSurfaceVariant }]}>Memeriksa status kunjungan…</Text>
      </View>
    );
  }

  const status = registration?.status ?? 'NONE';
  const isPending = status === 'REGISTRATION_PENDING';
  const isVerified = status === 'VERIFIED';
  const isCancelled = status === 'CANCELLED';

  let icon: keyof typeof Ionicons.glyphMap = 'calendar-outline';
  let title = 'Belum Mendaftar Kunjungan';
  let description = 'Daftar kunjungan terlebih dahulu. Setelah itu datang ke meja pendaftaran agar petugas dapat memverifikasi identitas, mencatat keluhan, dan menentukan poli.';
  let badge = 'BELUM TERDAFTAR';

  if (isPending) {
    icon = 'time-outline';
    title = 'Menunggu Verifikasi Petugas';
    description = 'Pendaftaran kamu sudah masuk. Silakan menuju receptionist/petugas untuk verifikasi identitas dan menyampaikan keluhan.';
    badge = 'MENUNGGU';
  } else if (isVerified) {
    icon = 'shield-checkmark-outline';
    title = 'Identitas Sudah Diverifikasi';
    description = 'Data kamu sudah benar. Petugas sedang menentukan poli dan membuat nomor antrean.';
    badge = 'TERVERIFIKASI';
  } else if (isCancelled) {
    icon = 'refresh-circle-outline';
    title = 'Pendaftaran Dibatalkan';
    description = 'Pendaftaran hari ini dibatalkan. Kamu masih bisa membuat pendaftaran baru.';
    badge = 'DIBATALKAN';
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}> 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <PatientHeader
          title="Akses Pasien"
          subtitle="Status kunjungan hari ini"
          showBack={false}
          right={
            <View style={styles.headerActions}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={logout}
                style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.14)' }]}
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
          <Text style={[styles.subtitle, { color: c.onPrimaryMuted }]}>Akses halaman pasien dibuka setelah nomor antrean diterbitkan.</Text>
        </PatientHeader>

        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.cardBorder, shadowColor: c.primaryDeep }]}>
            <View style={[styles.iconCircle, { backgroundColor: c.surfaceSoft }]}> 
              <Ionicons name={icon} size={30} color={c.primary} />
            </View>

            <View style={[styles.badge, { backgroundColor: c.primaryContainer }]}> 
              <Ionicons name="information-circle-outline" size={14} color={c.primary} />
              <Text style={[styles.badgeText, { color: c.onPrimaryContainer }]}>{badge}</Text>
            </View>

            <Text style={[styles.title, { color: c.onSurface }]}>{title}</Text>
            <Text style={[styles.description, { color: c.onSurfaceVariant }]}>{description}</Text>

            {registrationError ? (
              <View style={[styles.registrationInfo, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}>
                <Text style={[styles.infoValue, { color: c.statusSkipped }]}>{registrationError}</Text>
              </View>
            ) : null}

            {registration ? (
              <View style={[styles.registrationInfo, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Tanggal</Text>
                  <Text style={[styles.infoValue, { color: c.onSurface }]}>{registration.visitDate}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Status</Text>
                  <Text style={[styles.infoValue, { color: c.primary }]}>
                    {registration.status === 'REGISTRATION_PENDING'
                      ? 'Menunggu verifikasi'
                      : registration.status === 'VERIFIED'
                        ? 'Terverifikasi'
                        : registration.status === 'CANCELLED'
                          ? 'Dibatalkan'
                          : registration.status}
                  </Text>
                </View>
                {registration.serviceName ? (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Poli</Text>
                    <Text style={[styles.infoValue, { color: c.onSurface }]}>{registration.serviceName}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {(isPending || isVerified) ? (
              <View style={styles.steps}>
                {[
                  { label: 'Daftar kunjungan', done: true },
                  { label: 'Verifikasi petugas', done: isVerified },
                  { label: 'Keluhan + poli + nomor antrean', done: false },
                ].map((step, index) => (
                  <View key={step.label} style={styles.stepRow}>
                    <View style={styles.stepRail}>
                      <View style={[styles.stepDot, { backgroundColor: step.done ? c.primary : c.surface, borderColor: step.done ? c.primary : c.outlineVariant }]}> 
                        {step.done ? <Ionicons name="checkmark" size={12} color={c.onPrimary} /> : <Text style={[styles.stepNumber, { color: c.onSurfaceVariant }]}>{index + 1}</Text>}
                      </View>
                      {index < 2 ? <View style={[styles.stepLine, { backgroundColor: step.done ? c.primary : c.outlineVariant }]} /> : null}
                    </View>
                    <Text style={[styles.stepText, { color: step.done ? c.onSurface : c.onSurfaceVariant }]}>{step.label}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {!registration || isCancelled ? (
              <View style={styles.ctaBlock}>
                <PrimaryButton
                  label="DAFTAR KUNJUNGAN"
                  onPress={goRegisterVisit}
                />
                <Text style={[styles.ctaHint, { color: c.onSurfaceVariant }]}>Setelah mendaftar, datang ke receptionist/petugas untuk verifikasi.</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.tipCard, { backgroundColor: c.surfaceSoft, borderLeftColor: c.primary }]}>
            <Ionicons name="lock-closed-outline" size={18} color={c.primary} />
            <Text style={[styles.tipText, { color: c.onSurfaceVariant }]}>Halaman antrean pasien belum dibuka sebelum petugas menerbitkan nomor antrean. Ini mencegah pasien masuk lebih awal tanpa proses verifikasi.</Text>
          </View>

          <OutlineButton label="Keluar dari akun" icon="log-out-outline" tone="danger" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  loaderText: { fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  name: { fontSize: 26, fontWeight: '800', lineHeight: 34 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  body: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 20, marginTop: -40, gap: 16 },
  card: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  iconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  description: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  registrationInfo: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 18, gap: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 12, fontWeight: '800', textAlign: 'right', flex: 1 },
  steps: { width: '100%', marginTop: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepRail: { width: 24, alignItems: 'center' },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 11, fontWeight: '700' },
  stepLine: { width: 2, height: 22, borderRadius: 1 },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20, paddingTop: 2, fontWeight: '600' },
  ctaBlock: { width: '100%', gap: 9, marginTop: 20 },
  ctaHint: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  tipCard: { borderRadius: 18, padding: 14, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
