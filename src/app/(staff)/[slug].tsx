import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { RegistrationItem } from '../../components/staff/RegistrationItem';
import { QueueListItem } from '../../components/staff/QueueListItem';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { DEFAULT_SERVICES } from '../../core/constants/services';
import type { PatientModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { useQueueStore } from '../../stores/queue.store';
import { useStaffQueue } from '../../hooks/useStaffQueue';
import { authService } from '../../services/auth.service';
import { patientService } from '../../services/patient.service';
import { queueService } from '../../services/queue.service';
import { registrationService } from '../../services/registration.service';

const MODULES: Record<
  string,
  { title: string; description: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pendaftaran: {
    title: 'Pendaftaran',
    description: 'Pasien yang mendaftar melalui aplikasi akan muncul di sini secara real-time.',
    icon: 'document-text-outline',
  },
  'registrasi-pasien': {
    title: 'Registrasi Pasien',
    description: 'Daftarkan pasien yang datang langsung ke puskesmas.',
    icon: 'person-add-outline',
  },
  'cari-pasien': {
    title: 'Cari Pasien',
    description: 'Cari berdasarkan NIK, nama, atau nomor rekam medis.',
    icon: 'search-outline',
  },
  'verifikasi-pasien': {
    title: 'Verifikasi Pasien',
    description: 'Periksa data identitas dan lanjutkan ke keluhan serta poli.',
    icon: 'shield-checkmark-outline',
  },
  keluhan: {
    title: 'Keluhan',
    description: 'Pilih keluhan pasien dan lanjutkan proses penentuan poli.',
    icon: 'chatbox-ellipses-outline',
  },
  'pilih-poli': {
    title: 'Pilih Poli',
    description: 'Tentukan poli tujuan dan buat nomor antrean.',
    icon: 'business-outline',
  },
  antrian: {
    title: 'Antrian',
    description: 'Pantau antrean poli yang sedang ditangani.',
    icon: 'list-outline',
  },
  'panggil-berikutnya': {
    title: 'Panggil Berikutnya',
    description: 'Panggil nomor antrean berikutnya.',
    icon: 'megaphone-outline',
  },
  'panggil-ulang': {
    title: 'Panggil Ulang',
    description: 'Panggil kembali pasien yang belum merespons.',
    icon: 'refresh-outline',
  },
  'lewati-no-show': {
    title: 'Lewati / No Show',
    description: 'Tandai antrean berikutnya sebagai tidak hadir.',
    icon: 'close-circle-outline',
  },
  riwayat: {
    title: 'Riwayat',
    description: 'Riwayat antrean dan pelayanan pada poli yang dipilih.',
    icon: 'time-outline',
  },
};

function SearchResultCard({ patient }: { patient: PatientModel }) {
  const c = useColors();
  return (
    <View style={[styles.resultCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
      <View style={[styles.resultIcon, { backgroundColor: c.primaryContainer }]}>
        <Ionicons name="person-outline" size={22} color={c.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.resultName, { color: c.onSurface }]}>{patient.fullName}</Text>
        <Text style={[styles.resultMeta, { color: c.onSurfaceVariant }]}>NIK: {maskNik(patient.nik)}</Text>
        <Text style={[styles.resultMeta, { color: c.onSurfaceVariant }]}>RM: {patient.medicalRecordNumber ?? `RM-${patient.id.slice(-8).toUpperCase()}`}</Text>
        <Text style={[styles.resultStatus, { color: patient.isVerified ? c.success : c.warning }]}>
          {patient.isVerified ? 'Terverifikasi' : 'Belum diverifikasi'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push(`/(staff)/patient-detail?id=${patient.id}`)}
        style={[styles.detailButton, { borderColor: c.primary }]}
      >
        <Text style={[styles.detailButtonText, { color: c.primary }]}>Buka</Text>
      </TouchableOpacity>
    </View>
  );
}

function maskNik(nik: string) {
  if (nik.length < 4) return '****';
  return `${'*'.repeat(Math.max(0, nik.length - 4))}${nik.slice(-4)}`;
}

export default function StaffModuleScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const module = MODULES[slug];
  const user = useAuthStore((state) => state.user);
  const { selectedServiceId, setSelectedServiceId } = useQueueStore();
  const serviceId = selectedServiceId || DEFAULT_SERVICES[0].id;
  const { pendingRegistrations, verifiedRegistrations, currentServing, waitingQueues, staffServiceQueues } = useStaffQueue(serviceId);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PatientModel[]>([]);
  const activeService = DEFAULT_SERVICES.find((s) => s.id === serviceId) ?? DEFAULT_SERVICES[0];

  const logout = async () => {
    await authService.signOut();
    useAuthStore.getState().setUser(null);
    router.replace('/(auth)/login');
  };

  const doSearch = async () => {
    const term = search.trim();
    if (!term) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      setResults(await patientService.search(term));
    } catch (e: any) {
      Alert.alert('Gagal mencari pasien', e?.message || 'Terjadi kesalahan.');
    } finally {
      setSearching(false);
    }
  };

  const goManualRegister = () => router.push('/(staff)/manual-register');

  const openRegistration = (regId: string, patientId: string) =>
    router.push(`/(staff)/patient-detail?id=${patientId}&regId=${regId}`);

  const openComplaint = (regId: string) =>
    router.push(`/(staff)/complaint-form?regId=${regId}`);

  const callNext = async () => {
    try {
      const next = await queueService.callNext(activeService.id);
      if (!next) Alert.alert('Antrean kosong', 'Tidak ada pasien yang sedang menunggu.');
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Tidak dapat memanggil antrean.');
    }
  };

  const recall = async () => {
    if (!currentServing) return;
    try {
      await queueService.recallQueue(currentServing.id, activeService.id);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Tidak dapat memanggil ulang.');
    }
  };

  const skip = async () => {
    if (!currentServing) return;
    try {
      await queueService.skipQueue(currentServing.id);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Tidak dapat melewati antrean.');
    }
  };

  const completedOrSkipped = useMemo(
    () => staffServiceQueues.filter((q) => q.status === 'COMPLETED' || q.status === 'SKIPPED'),
    [staffServiceQueues],
  );

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.errorTitle, { color: c.onSurface }]}>Menu tidak ditemukan</Text>
        <Text style={[styles.errorText, { color: c.onSurfaceVariant }]}>Kembali ke Dashboard Petugas.</Text>
      </View>
    );
  }

  const renderBody = () => {
    if (slug === 'registrasi-pasien') {
      return (
        <View style={styles.stack}>
          <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <View style={[styles.heroIcon, { backgroundColor: c.primaryContainer }]}>
              <Ionicons name="person-add-outline" size={28} color={c.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Registrasi Pasien Manual</Text>
            <Text style={[styles.cardDescription, { color: c.onSurfaceVariant }]}>Data pasien, lalu data pendaftaran, akan langsung disimpan ke Firestore collection <Text style={{ fontWeight: '800' }}>patients</Text> dan <Text style={{ fontWeight: '800' }}>registrations</Text>.</Text>
            <PrimaryButton label="REGISTRASI PASIEN" onPress={goManualRegister} />
          </View>
        </View>
      );
    }

    if (slug === 'cari-pasien') {
      return (
        <View style={styles.stack}>
          <View style={[styles.searchCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Cari Pasien</Text>
            <Text style={[styles.cardDescription, { color: c.onSurfaceVariant }]}>NIK, nama, atau nomor rekam medis.</Text>
            <View style={[styles.searchBox, { borderColor: c.outlineVariant, backgroundColor: c.surfaceSoft }]}>
              <Ionicons name="search-outline" size={20} color={c.outline} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={doSearch}
                placeholder="Contoh: 9171..., Budi, RM-..."
                placeholderTextColor={c.outline}
                style={[styles.searchInput, { color: c.onSurface }]}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={doSearch} disabled={searching}>
                {searching ? <ActivityIndicator color={c.primary} /> : <Ionicons name="arrow-forward-circle" size={24} color={c.primary} />}
              </TouchableOpacity>
            </View>
          </View>
          {results.map((patient) => <SearchResultCard key={patient.id} patient={patient} />)}
          {!searching && search.trim() && results.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
              <Ionicons name="search-outline" size={30} color={c.outline} />
              <Text style={[styles.emptyTitle, { color: c.onSurface }]}>Pasien tidak ditemukan</Text>
              <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>Coba periksa NIK, nama, atau nomor rekam medis.</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (slug === 'pendaftaran' || slug === 'verifikasi-pasien') {
      const list = pendingRegistrations;
      return (
        <View style={styles.stack}>
          <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <Text style={[styles.bigNumber, { color: c.primary }]}>{list.length}</Text>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Menunggu Verifikasi</Text>
            <Text style={[styles.cardDescription, { color: c.onSurfaceVariant }]}>Daftar ini memperbarui otomatis dari Firestore.</Text>
          </View>
          {list.map((reg) => (
            <RegistrationItem
              key={reg.id}
              registration={reg}
              onVerify={() => openRegistration(reg.id, reg.patientId)}
            />
          ))}
          {list.length === 0 ? <Empty label="Tidak ada pendaftaran yang menunggu." /> : null}
        </View>
      );
    }

    if (slug === 'keluhan' || slug === 'pilih-poli') {
      return (
        <View style={styles.stack}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Sudah Terverifikasi</Text>
          <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>Pilih pasien untuk mencatat keluhan dan menentukan poli.</Text>
          {verifiedRegistrations.map((reg) => (
            <RegistrationItem
              key={reg.id}
              registration={reg}
              actionLabel={slug === 'keluhan' ? 'KELOLA' : 'PILIH POLI'}
              onVerify={() => openComplaint(reg.id)}
            />
          ))}
          {verifiedRegistrations.length === 0 ? <Empty label="Belum ada pasien yang siap diproses." /> : null}
        </View>
      );
    }

    if (slug === 'antrian' || slug === 'panggil-berikutnya' || slug === 'panggil-ulang' || slug === 'lewati-no-show') {
      return (
        <View style={styles.stack}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {DEFAULT_SERVICES.map((service) => {
              const active = service.id === serviceId;
              return (
                <TouchableOpacity key={service.id} onPress={() => setSelectedServiceId(service.id)} style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.outlineVariant }]}>
                  <Text style={[styles.chipText, { color: active ? c.onPrimary : c.onSurfaceVariant }]}>{service.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.servingCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <Text style={[styles.cardLabel, { color: c.onSurfaceVariant }]}>Sedang Dilayani · {activeService.name}</Text>
            <Text style={[styles.servingNumber, { color: c.primary }]}>{currentServing?.queueNumber ?? '---'}</Text>
            <Text style={[styles.currentName, { color: c.onSurface }]}>{currentServing?.patientName ?? 'Belum ada pasien'}</Text>

            {slug === 'panggil-berikutnya' ? <PrimaryButton label="PANGGIL BERIKUTNYA" disabled={!waitingQueues.length} onPress={callNext} /> : null}
            {slug === 'panggil-ulang' ? <PrimaryButton label="PANGGIL ULANG" disabled={!currentServing} onPress={recall} /> : null}
            {slug === 'lewati-no-show' ? <OutlineButton label="LEWATI / NO SHOW" icon="close-circle-outline" tone="danger" disabled={!currentServing} onPress={skip} /> : null}
          </View>

          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Daftar Tunggu ({waitingQueues.length})</Text>
          {waitingQueues.map((queue, index) => <QueueListItem key={queue.id} queue={queue} position={index + 1} onSkip={skip} />)}
          {slug === 'antrian' && waitingQueues.length === 0 ? <Empty label="Tidak ada antrean menunggu." /> : null}
        </View>
      );
    }

    if (slug === 'riwayat') {
      return (
        <View style={styles.stack}>
          <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <Text style={[styles.bigNumber, { color: c.primary }]}>{completedOrSkipped.length}</Text>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Riwayat Hari Ini · {activeService.name}</Text>
            <Text style={[styles.cardDescription, { color: c.onSurfaceVariant }]}>Selesai dan no-show yang sudah tercatat di Firestore.</Text>
          </View>
          {completedOrSkipped.map((queue) => <QueueListItem key={queue.id} queue={queue} />)}
          {completedOrSkipped.length === 0 ? <Empty label="Belum ada riwayat untuk poli ini hari ini." /> : null}
        </View>
      );
    }

    return (
      <View style={styles.stack}>
        <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
          <View style={[styles.heroIcon, { backgroundColor: c.primaryContainer }]}>
            <Ionicons name={module.icon} size={28} color={c.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: c.onSurface }]}>{module.title}</Text>
          <Text style={[styles.cardDescription, { color: c.onSurfaceVariant }]}>{module.description}</Text>
          <Text style={[styles.note, { color: c.outline }]}>Modul ini menggunakan Firebase/Firestore melalui service dan repository MedicQ yang sama.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <StaffHeader title={module.title} subtitle="Modul Petugas" right={undefined} />
        <View style={styles.body}>
          {renderBody()}
          <OutlineButton label="Kembali ke Dashboard" icon="chevron-back" onPress={() => router.replace('/(staff)/dashboard')} />
          <Text style={[styles.footerUser, { color: c.outline }]}>Masuk sebagai {user?.displayName ?? 'Petugas'} · role: staff</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  const c = useColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
      <Ionicons name="file-tray-outline" size={30} color={c.outline} />
      <Text style={[styles.emptyTitle, { color: c.onSurface }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  body: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 12 },
  heroCard: { borderRadius: 22, borderWidth: 1, padding: 22, gap: 8 },
  heroIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  cardDescription: { fontSize: 13, lineHeight: 20 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  bigNumber: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
  searchCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 10 },
  searchBox: { minHeight: 52, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 14, paddingVertical: 12 },
  resultCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 15, fontWeight: '800' },
  resultMeta: { fontSize: 12, marginTop: 2 },
  resultStatus: { fontSize: 11, marginTop: 4, fontWeight: '700' },
  detailButton: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 },
  detailButtonText: { fontSize: 12, fontWeight: '800' },
  emptyCard: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', lineHeight: 23 },
  sectionSub: { fontSize: 12, lineHeight: 18 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, minHeight: 40, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '600' },
  servingCard: { borderRadius: 22, borderWidth: 1, padding: 20, gap: 8 },
  cardLabel: { fontSize: 12, fontWeight: '700' },
  servingNumber: { fontSize: 42, lineHeight: 50, fontWeight: '800', letterSpacing: 2 },
  currentName: { fontSize: 15, lineHeight: 20, fontWeight: '600', marginBottom: 8 },
  footerUser: { textAlign: 'center', fontSize: 11, marginTop: 4 },
  errorTitle: { fontSize: 22, fontWeight: '800' },
  errorText: { marginTop: 8, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
