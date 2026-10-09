import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useColors } from '../../core/theme/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';

const MENU_ITEMS = [
  {
    slug: 'dashboard',
    title: 'Dashboard',
    description: 'Ringkasan kondisi fasilitas, pelayanan, dan statistik hari ini.',
    icon: 'grid-outline' as const,
    group: 'utama',
  },
  {
    slug: 'data-pasien',
    title: 'Data Pasien',
    description: 'Melihat, mencari, menambah, mengedit, dan menghapus data pasien.',
    icon: 'people-outline' as const,
    group: 'manajemen',
  },
  {
    slug: 'data-petugas',
    title: 'Data Petugas',
    description: 'Membuat akun petugas serta mengaktifkan atau menonaktifkannya.',
    icon: 'id-card-outline' as const,
    group: 'manajemen',
  },
  {
    slug: 'data-dokter',
    title: 'Data Dokter',
    description: 'Mengelola profil dokter dan status aktif pelayanan.',
    icon: 'medkit-outline' as const,
    group: 'manajemen',
  },
  {
    slug: 'data-poli',
    title: 'Data Poli',
    description: 'Mengelola poli, status aktif, dan informasi pelayanan.',
    icon: 'business-outline' as const,
    group: 'manajemen',
  },
  {
    slug: 'jadwal-dokter',
    title: 'Jadwal Dokter',
    description: 'Mengatur dokter, poli, hari, dan jam pelayanan.',
    icon: 'calendar-outline' as const,
    group: 'operasional',
  },
  {
    slug: 'pengaturan-antrian',
    title: 'Pengaturan Antrian',
    description: 'Mengatur prefix, kapasitas, jam buka, dan aturan nomor antrian.',
    icon: 'options-outline' as const,
    group: 'operasional',
  },
  {
    slug: 'monitoring-antrian',
    title: 'Monitoring Antrian',
    description: 'Memantau seluruh antrean dari semua poli secara real-time.',
    icon: 'pulse-outline' as const,
    group: 'operasional',
  },
  {
    slug: 'laporan',
    title: 'Laporan',
    description: 'Melihat statistik pasien, antrean, waktu pelayanan, dan hasil layanan.',
    icon: 'bar-chart-outline' as const,
    group: 'laporan',
  },
  {
    slug: 'riwayat',
    title: 'Riwayat',
    description: 'Melihat histori pendaftaran dan pelayanan pasien.',
    icon: 'time-outline' as const,
    group: 'laporan',
  },
  {
    slug: 'pengaturan-sistem',
    title: 'Pengaturan Sistem',
    description: 'Mengatur informasi fasilitas kesehatan dan konfigurasi aplikasi.',
    icon: 'settings-outline' as const,
    group: 'sistem',
  },
  {
    slug: 'manajemen-role',
    title: 'Manajemen Role',
    description: 'Mengatur hak akses antara admin dan petugas.',
    icon: 'shield-checkmark-outline' as const,
    group: 'sistem',
  },
] as const;

type MenuItem = (typeof MENU_ITEMS)[number];
type MenuGroup = MenuItem['group'];

const GROUPS: Array<{ key: MenuGroup; title: string; subtitle: string }> = [
  { key: 'manajemen', title: 'Manajemen Data', subtitle: 'Kelola data utama fasilitas kesehatan' },
  { key: 'operasional', title: 'Operasional', subtitle: 'Atur pelayanan dan antrean harian' },
  { key: 'laporan', title: 'Laporan & Riwayat', subtitle: 'Pantau hasil dan histori pelayanan' },
  { key: 'sistem', title: 'Sistem & Akses', subtitle: 'Atur konfigurasi dan hak akses' },
];

function StatCard({ icon, label, value, note }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; note: string }) {
  const c = useColors();

  return (
    <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
      <View style={[styles.statIcon, { backgroundColor: c.surfaceSoft }]}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <Text style={[styles.statValue, { color: c.onSurface }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.statNote, { color: c.outline }]}>{note}</Text>
    </View>
  );
}

function MenuCard({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const c = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={[styles.menuCard, { backgroundColor: c.surface, borderColor: c.cardBorder, shadowColor: c.primaryDeep }]}
    >
      <View style={styles.menuRow}>
        <View style={[styles.menuIcon, { backgroundColor: c.primaryContainer }]}>
          <Ionicons name={item.icon} size={22} color={c.primary} />
        </View>

        <View style={styles.menuCopy}>
          <Text style={[styles.menuTitle, { color: c.onSurface }]}>{item.title}</Text>
          <Text style={[styles.menuDescription, { color: c.onSurfaceVariant }]}>{item.description}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={c.outline} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [expanded, setExpanded] = useState<MenuGroup | null>('manajemen');
  const todayLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });

  const goToMenu = (item: MenuItem) => {
    if (item.slug === 'dashboard') return;
    router.push(`/(admin)/${item.slug}`);
  };

  const signOut = async () => {
    await authService.signOut();
    useAuthStore.getState().setUser(null);
    router.replace('/(auth)/login');
  };

  const right = (
    <View style={styles.headerRight}>
      <ThemeToggle />
      <TouchableOpacity
        onPress={signOut}
        style={styles.headerIconButton}
        accessibilityRole="button"
        accessibilityLabel="Keluar"
      >
        <Ionicons name="log-out-outline" size={20} color={c.onPrimary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 36 + insets.bottom }]}
      >
        <StaffHeader
          title="Dashboard Admin"
          subtitle={todayLabel}
          showBack={false}
          right={right}
        >
          <Text style={[styles.greeting, { color: c.onPrimaryMuted }]}>Halo,</Text>
          <Text style={[styles.headerTitle, { color: c.onPrimary }]}> {user?.displayName || 'Admin MedicQ'}</Text>
          <Text style={[styles.headerSubtitle, { color: c.onPrimaryMuted }]}>Pusat kendali administrasi MedicQ</Text>
        </StaffHeader>

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <View style={styles.flex}>
              <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Ringkasan Hari Ini</Text>
              <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>Data live akan mengambil nilai langsung dari Firestore.</Text>
            </View>
            <View style={[styles.adminBadge, { backgroundColor: c.primaryContainer }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color={c.primary} />
              <Text style={[styles.adminBadgeText, { color: c.onPrimaryContainer }]}>ADMIN</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon="people-outline" label="Pasien hari ini" value="—" note="Menunggu data" />
            <StatCard icon="list-outline" label="Antrean aktif" value="—" note="Semua poli" />
            <StatCard icon="business-outline" label="Poli aktif" value="—" note="Konfigurasi" />
            <StatCard icon="medkit-outline" label="Dokter aktif" value="—" note="Jadwal hari ini" />
          </View>

          <View
            style={[styles.infoCard, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}
          >
            <View style={[styles.infoIcon, { backgroundColor: c.primaryContainer }]}>
              <Ionicons name="information-circle-outline" size={20} color={c.primary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={[styles.infoTitle, { color: c.onSurface }]}>Kontrol administrasi terpusat</Text>
              <Text style={[styles.infoText, { color: c.onSurfaceVariant }]}>Pilih modul di bawah untuk mengelola data dan konfigurasi fasilitas kesehatan.</Text>
            </View>
          </View>

          {GROUPS.map((group) => {
            const items = MENU_ITEMS.filter((item) => item.group === group.key);
            const isOpen = expanded === group.key;

            return (
              <View key={group.key} style={styles.group}>
                <TouchableOpacity
                  onPress={() => setExpanded(isOpen ? null : group.key)}
                  style={styles.groupHeader}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <View style={styles.flex}>
                    <Text style={[styles.sectionTitle, { color: c.onSurface }]}>{group.title}</Text>
                    <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>{group.subtitle}</Text>
                  </View>
                  <View style={[styles.chevronCircle, { backgroundColor: c.surface }]}>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={c.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>

                {isOpen ? (
                  <View style={styles.menuList}>
                    {items.map((item) => (
                      <MenuCard key={item.slug} item={item} onPress={() => goToMenu(item)} />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  greeting: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  headerTitle: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  sectionSub: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  adminBadge: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 25, lineHeight: 30, fontWeight: '800' },
  statLabel: { fontSize: 13, lineHeight: 18, marginTop: 2, fontWeight: '600' },
  statNote: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  infoCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: { flex: 1 },
  infoTitle: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  infoText: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  group: { gap: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chevronCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: { gap: 12 },
  menuCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: { flex: 1 },
  menuTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  menuDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
});
