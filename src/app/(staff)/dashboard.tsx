import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StaffHeader } from '../../components/ui/StaffHeader';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { DEFAULT_SERVICES } from '../../core/constants/services';
import type { QueueModel, RegistrationModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';
import { useStaffQueue } from '../../hooks/useStaffQueue';
import { useQueueStore } from '../../stores/queue.store';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';
import { queueService } from '../../services/queue.service';

const MENU_ITEMS = [
  {
    slug: 'pendaftaran',
    title: 'Pendaftaran',
    description: 'Melihat pasien yang mendaftar melalui aplikasi.',
    icon: 'document-text-outline' as const,
    group: 'pelayanan',
  },
  {
    slug: 'registrasi-pasien',
    title: 'Registrasi Pasien',
    description: 'Mendaftarkan pasien yang datang langsung ke fasilitas.',
    icon: 'person-add-outline' as const,
    group: 'pelayanan',
  },
  {
    slug: 'cari-pasien',
    title: 'Cari Pasien',
    description: 'Cari berdasarkan NIK, nama, atau nomor rekam medis.',
    icon: 'search-outline' as const,
    group: 'pasien',
  },
  {
    slug: 'verifikasi-pasien',
    title: 'Verifikasi Pasien',
    description: 'Memastikan identitas dan data pasien sudah benar.',
    icon: 'shield-checkmark-outline' as const,
    group: 'pasien',
  },
  {
    slug: 'keluhan',
    title: 'Keluhan',
    description: 'Mencatat atau mengonfirmasi keluhan pasien.',
    icon: 'chatbox-ellipses-outline' as const,
    group: 'pasien',
  },
  {
    slug: 'pilih-poli',
    title: 'Pilih Poli',
    description: 'Menentukan atau mengonfirmasi poli tujuan pasien.',
    icon: 'business-outline' as const,
    group: 'pasien',
  },
  {
    slug: 'antrian',
    title: 'Antrian',
    description: 'Melihat daftar nomor antrean pada poli yang ditangani.',
    icon: 'list-outline' as const,
    group: 'antrian',
  },
  {
    slug: 'panggil-berikutnya',
    title: 'Panggil Berikutnya',
    description: 'Memanggil nomor berikutnya secara real-time.',
    icon: 'megaphone-outline' as const,
    group: 'antrian',
  },
  {
    slug: 'panggil-ulang',
    title: 'Panggil Ulang',
    description: 'Memanggil kembali pasien yang belum merespons.',
    icon: 'refresh-outline' as const,
    group: 'antrian',
  },
  {
    slug: 'lewati-no-show',
    title: 'Lewati / No Show',
    description: 'Menandai pasien yang tidak hadir ketika dipanggil.',
    icon: 'close-circle-outline' as const,
    group: 'antrian',
  },
  {
    slug: 'riwayat',
    title: 'Riwayat',
    description: 'Melihat riwayat antrean dan pelayanan yang ditangani.',
    icon: 'time-outline' as const,
    group: 'laporan',
  },
] as const;

type MenuGroup = 'pelayanan' | 'pasien' | 'antrian' | 'laporan';

const GROUPS: Array<{ key: MenuGroup; title: string; subtitle: string }> = [
  {
    key: 'pelayanan',
    title: 'Pelayanan Pasien',
    subtitle: 'Pendaftaran dari aplikasi dan kedatangan langsung',
  },
  {
    key: 'pasien',
    title: 'Data & Verifikasi',
    subtitle: 'Periksa identitas, keluhan, dan poli tujuan',
  },
  {
    key: 'antrian',
    title: 'Antrean',
    subtitle: 'Pantau dan kendalikan antrean poli secara real-time',
  },
  {
    key: 'laporan',
    title: 'Riwayat',
    subtitle: 'Lihat pelayanan yang sudah ditangani',
  },
];

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  note: string;
}) {
  const c = useColors();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: c.surface, borderColor: c.cardBorder },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: c.surfaceSoft }]}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <Text style={[styles.statValue, { color: c.onSurface }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.statNote, { color: c.outline }]}>{note}</Text>
    </View>
  );
}

function MenuCard({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const c = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={[
        styles.menuCard,
        {
          backgroundColor: c.surface,
          borderColor: c.cardBorder,
          shadowColor: c.primaryDeep,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.menuRow}>
        <View style={[styles.menuIcon, { backgroundColor: c.primaryContainer }]}>
          <Ionicons name={icon} size={22} color={c.primary} />
        </View>
        <View style={styles.menuCopy}>
          <Text style={[styles.menuTitle, { color: c.onSurface }]}>{title}</Text>
          <Text style={[styles.menuDescription, { color: c.onSurfaceVariant }]}>
            {description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={c.outline} />
      </View>
    </TouchableOpacity>
  );
}

export default function StaffDashboardScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { selectedServiceId, setSelectedServiceId } = useQueueStore();
  const serviceId = selectedServiceId || DEFAULT_SERVICES[0].id;

  const {
    pendingRegistrations,
    verifiedRegistrations,
    currentServing,
    waitingQueues,
    services,
    staffServiceQueues,
  } = useStaffQueue(serviceId);

  const [expanded, setExpanded] = useState<MenuGroup | null>('pelayanan');
  const activeService =
    services.find((s) => s.id === serviceId) ||
    DEFAULT_SERVICES.find((s) => s.id === serviceId) ||
    DEFAULT_SERVICES[0];

  const todayLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });
  const nextQueue = waitingQueues[0];

  const handleCallNext = async () => {
    if (!nextQueue) return;
    try {
      await queueService.callQueue(nextQueue.id, activeService.id);
    } catch (e: any) {
      Alert.alert('Gagal memanggil', e?.message || 'Terjadi kesalahan.');
    }
  };

  const handleRecall = async () => {
    if (!currentServing) return;
    try {
      await queueService.recallQueue(currentServing.id, activeService.id);
    } catch (e: any) {
      Alert.alert('Gagal memanggil ulang', e?.message || 'Terjadi kesalahan.');
    }
  };

  const handleSkip = async () => {
    if (!currentServing) return;
    try {
      await queueService.skipQueue(currentServing.id);
    } catch (e: any) {
      Alert.alert('Gagal melewati antrean', e?.message || 'Terjadi kesalahan.');
    }
  };

  const signOut = async () => {
    await authService.signOut();
    useAuthStore.getState().setUser(null);
    router.replace('/(auth)/login');
  };

  const right = (
    <View style={styles.headerRight}>
      <ThemeToggle />
      <TouchableOpacity onPress={signOut} style={styles.headerIconButton}>
        <Ionicons name="log-out-outline" size={20} color={c.onPrimary} />
      </TouchableOpacity>
    </View>
  );

  const goToMenu = (slug: string) => {
    if (slug === 'pendaftaran') {
      router.push('/(staff)/dashboard');
      return;
    }
    router.push(`/(staff)/${slug}`);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 34 + insets.bottom }]}
      >
        <StaffHeader title="Dashboard Petugas" subtitle={todayLabel} showBack={false} right={right}>
          <Text style={[styles.greeting, { color: c.onPrimaryMuted }]}>Halo,</Text>
          <Text style={[styles.headerTitle, { color: c.onPrimary }]}>
            {user?.displayName || 'Petugas MedicQ'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: c.onPrimaryMuted }]}>
            Kelola pelayanan dan antrean pasien
          </Text>
        </StaffHeader>

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <View style={styles.flex}>
              <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Ringkasan Hari Ini</Text>
              <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>Data yang tersambung langsung ke Firestore.</Text>
            </View>
            <View style={[styles.staffBadge, { backgroundColor: c.primaryContainer }]}>
              <Ionicons name="medkit-outline" size={15} color={c.primary} />
              <Text style={[styles.staffBadgeText, { color: c.onPrimaryContainer }]}>PETUGAS</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon="document-text-outline" label="Pendaftaran masuk" value={String(pendingRegistrations.length)} note="Menunggu verifikasi" />
            <StatCard icon="people-outline" label="Sudah diverifikasi" value={String(verifiedRegistrations.length)} note="Siap diarahkan" />
            <StatCard icon="time-outline" label="Menunggu antrean" value={String(waitingQueues.length)} note={activeService.name} />
            <StatCard icon="pulse-outline" label="Sedang aktif" value={currentServing?.queueNumber ?? '—'} note={currentServing?.patientName ?? 'Belum ada'} />
          </View>

          <View style={[styles.quickCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <View style={styles.quickHeader}>
              <View style={[styles.quickIcon, { backgroundColor: c.statusServingBg }]}>
                <Ionicons name="megaphone-outline" size={20} color={c.statusServing} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.quickTitle, { color: c.onSurface }]}>Kontrol Antrean</Text>
                <Text style={[styles.quickSub, { color: c.onSurfaceVariant }]}>{activeService.name} · {staffServiceQueues.length} data hari ini</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {DEFAULT_SERVICES.map((service) => {
                const active = service.id === serviceId;
                return (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => setSelectedServiceId(service.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? c.primary : c.surfaceSoft,
                        borderColor: active ? c.primary : c.outlineVariant,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? c.onPrimary : c.onSurfaceVariant }]}>{service.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.currentNumber, { color: c.primary }]}>
              {currentServing?.queueNumber ?? '---'}
            </Text>
            <Text style={[styles.currentName, { color: c.onSurface }]}>
              {currentServing?.patientName ?? 'Belum ada pasien yang dipanggil'}
            </Text>

            <PrimaryButton
              label={nextQueue ? `PANGGIL BERIKUTNYA (${nextQueue.queueNumber})` : 'TIDAK ADA ANTREAN'}
              disabled={!nextQueue}
              onPress={handleCallNext}
            />

            <View style={styles.actionRow}>
              <OutlineButton label="Panggil Ulang" icon="refresh-outline" disabled={!currentServing} onPress={handleRecall} />
              <OutlineButton label="Lewati / No Show" icon="close-circle-outline" tone="danger" disabled={!currentServing} onPress={handleSkip} />
            </View>
          </View>

          {GROUPS.map((group) => {
            const isOpen = expanded === group.key;
            const items = MENU_ITEMS.filter((item) => item.group === group.key);
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
                      <MenuCard
                        key={item.slug}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        onPress={() => goToMenu(item.slug)}
                      />
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
  body: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  flexGrow: { flexGrow: 1 },
  greeting: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  headerTitle: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  sectionSub: { fontSize: 13, lineHeight: 19, marginTop: 3 },
  staffBadge: { minHeight: 34, paddingHorizontal: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', minWidth: 150, flexGrow: 1, borderRadius: 18, borderWidth: 1, padding: 16 },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 25, lineHeight: 30, fontWeight: '800' },
  statLabel: { fontSize: 13, lineHeight: 18, marginTop: 2, fontWeight: '600' },
  statNote: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  quickCard: { borderRadius: 22, padding: 18, borderWidth: 1, gap: 12 },
  quickHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 15, fontWeight: '800' },
  quickSub: { fontSize: 12, marginTop: 3 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, minHeight: 40, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '600' },
  currentNumber: { fontSize: 40, lineHeight: 48, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  currentName: { fontSize: 15, lineHeight: 20, fontWeight: '600', marginTop: -6 },
  actionRow: { flexDirection: 'row', gap: 10 },
  group: { gap: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chevronCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuList: { gap: 12 },
  menuCard: { borderRadius: 18, borderWidth: 1, padding: 16, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, minWidth: 0 },
  menuTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  menuDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
});
