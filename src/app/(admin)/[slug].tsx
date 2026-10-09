import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';

const MODULES: Record<string, { title: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'data-pasien': {
    title: 'Data Pasien',
    description: 'Kelola data pasien MedicQ: cari, tambah, edit, dan hapus data sesuai hak akses.',
    icon: 'people-outline',
  },
  'data-petugas': {
    title: 'Data Petugas',
    description: 'Kelola akun petugas, status aktif/nonaktif, dan informasi petugas.',
    icon: 'id-card-outline',
  },
  'data-dokter': {
    title: 'Data Dokter',
    description: 'Kelola data dokter dan status dokter yang tersedia untuk pelayanan.',
    icon: 'medkit-outline',
  },
  'data-poli': {
    title: 'Data Poli',
    description: 'Kelola daftar poli, informasi poli, dan status aktif/nonaktif.',
    icon: 'business-outline',
  },
  'jadwal-dokter': {
    title: 'Jadwal Dokter',
    description: 'Atur penugasan dokter pada poli, hari, dan jam pelayanan.',
    icon: 'calendar-outline',
  },
  'pengaturan-antrian': {
    title: 'Pengaturan Antrian',
    description: 'Atur prefix nomor, kapasitas, jam buka, dan aturan antrean lainnya.',
    icon: 'options-outline',
  },
  'monitoring-antrian': {
    title: 'Monitoring Antrian',
    description: 'Pantau seluruh antrean dari semua poli secara real-time.',
    icon: 'pulse-outline',
  },
  laporan: {
    title: 'Laporan',
    description: 'Lihat jumlah pasien, jumlah antrean, pasien selesai, waktu pelayanan, dan statistik lainnya.',
    icon: 'bar-chart-outline',
  },
  riwayat: {
    title: 'Riwayat',
    description: 'Lihat histori pendaftaran dan pelayanan pasien.',
    icon: 'time-outline',
  },
  'pengaturan-sistem': {
    title: 'Pengaturan Sistem',
    description: 'Atur informasi fasilitas kesehatan dan konfigurasi aplikasi.',
    icon: 'settings-outline',
  },
  'manajemen-role': {
    title: 'Manajemen Role',
    description: 'Atur hak akses antara admin dan petugas tanpa membuka akses pasien.',
    icon: 'shield-checkmark-outline',
  },
};

export default function AdminModuleScreen() {
  const c = useColors();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const user = useAuthStore((state) => state.user);
  const module = slug ? MODULES[slug] : null;

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.errorTitle, { color: c.onSurface }]}>Modul tidak ditemukan</Text>
        <Text style={[styles.errorText, { color: c.onSurfaceVariant }]}>Kembali ke dashboard admin untuk memilih menu yang tersedia.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}> 
      <StaffHeader title={module.title} subtitle="Modul Administrator" />

      <View style={styles.body}>
        <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
          <View style={[styles.iconBox, { backgroundColor: c.primaryContainer }]}>
            <Ionicons name={module.icon} size={30} color={c.primary} />
          </View>

          <Text style={[styles.title, { color: c.onSurface }]}>{module.title}</Text>
          <Text style={[styles.description, { color: c.onSurfaceVariant }]}>{module.description}</Text>

          <View style={[styles.statusBox, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}>
            <Ionicons name="construct-outline" size={20} color={c.primary} />
            <View style={styles.statusCopy}>
              <Text style={[styles.statusTitle, { color: c.onSurface }]}>Tampilan modul siap</Text>
              <Text style={[styles.statusText, { color: c.onSurfaceVariant }]}>Halaman ini menjadi tempat fitur Firebase untuk modul ini dihubungkan berikutnya.</Text>
            </View>
          </View>

          <Text style={[styles.loggedUser, { color: c.outline }]}>Masuk sebagai {user?.displayName || 'Admin'} · role: admin</Text>
        </View>

        <Text style={[styles.backHint, { color: c.onSurfaceVariant }]} onPress={() => router.replace('/(admin)/dashboard')}>
          ← Kembali ke Dashboard Admin
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  statusBox: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 13, lineHeight: 18, fontWeight: '800' },
  statusText: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  loggedUser: { fontSize: 11, marginTop: 16 },
  backHint: { textAlign: 'center', fontSize: 13, marginTop: 18, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 22, fontWeight: '800' },
  errorText: { marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
