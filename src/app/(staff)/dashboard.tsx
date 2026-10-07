import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueueListItem } from '../../components/staff/QueueListItem';
import { RegistrationItem } from '../../components/staff/RegistrationItem';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StaffHeader } from '../../components/ui/StaffHeader';
import { DEFAULT_SERVICES } from '../../core/constants/services';
import type { QueueModel, RegistrationModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';

type Tab = 'verifications' | 'queues';

// DUMMY DATA — UI demo sebelum Firestore terkoneksi
const pendingRegistrations: RegistrationModel[] = [
  {
    id: 'r1',
    patientId: 'p1',
    patientName: 'Budi Santoso',
    visitDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'REGISTRATION_PENDING',
    complaints: ['Demam', 'Batuk / Pilek'],
    complaintNote: '',
    serviceId: null,
    serviceName: null,
    queueId: null,
    staffId: null,
    isManual: false,
    createdAt: new Date(Date.now() - 8 * 60000),
    updatedAt: new Date(Date.now() - 8 * 60000),
  },
  {
    id: 'r2',
    patientId: 'p2',
    patientName: 'Siti Aminah',
    visitDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'REGISTRATION_PENDING',
    complaints: ['Pusing / Sakit Kepala'],
    complaintNote: '',
    serviceId: null,
    serviceName: null,
    queueId: null,
    staffId: null,
    isManual: true,
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(Date.now() - 15 * 60000),
  },
];

const verifiedRegistrations: RegistrationModel[] = [
  {
    id: 'r3',
    patientId: 'p3',
    patientName: 'Ahmad Dahlan',
    visitDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'VERIFIED',
    complaints: ['Nyeri / Sakit'],
    complaintNote: 'Nyeri perut sejak semalam',
    serviceId: null,
    serviceName: null,
    queueId: null,
    staffId: 'staff1',
    isManual: false,
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(),
  },
];

function makeQueue(
  partial: Partial<QueueModel> & {
    id: string;
    queueNumber: string;
    sequenceNumber: number;
  },
): QueueModel {
  const now = new Date();
  return {
    id: partial.id,
    queueNumber: partial.queueNumber,
    sequenceNumber: partial.sequenceNumber,
    patientId: partial.patientId ?? partial.id,
    patientName: partial.patientName ?? 'Pasien',
    serviceId: partial.serviceId ?? 'poli_umum',
    serviceName: partial.serviceName ?? 'Poli Umum',
    registrationId: partial.registrationId ?? partial.id,
    visitDate: partial.visitDate ?? format(now, 'yyyy-MM-dd'),
    status: partial.status ?? 'WAITING',
    createdAt: partial.createdAt ?? now,
    calledAt: partial.calledAt ?? null,
    servedAt: partial.servedAt ?? null,
    completedAt: partial.completedAt ?? null,
  };
}

export default function StaffDashboardScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('verifications');
  const [serviceId, setServiceId] = useState('poli_umum');

  const todayLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });
  const activeService = DEFAULT_SERVICES.find((s) => s.id === serviceId) ?? DEFAULT_SERVICES[0];

  const currentServing = makeQueue({
    id: 'q1',
    queueNumber: 'A-025',
    sequenceNumber: 25,
    status: 'SERVING',
    patientName: 'Asep Suparman',
    serviceId: 'poli_umum',
    serviceName: 'Poli Umum',
  });

  const waitingQueues: QueueModel[] = [
    makeQueue({ id: 'q2', queueNumber: 'A-026', sequenceNumber: 26, patientName: 'Ratna Sari' }),
    makeQueue({ id: 'q3', queueNumber: 'A-027', sequenceNumber: 27, patientName: 'Andi Wijaya' }),
    makeQueue({ id: 'q4', queueNumber: 'A-028', sequenceNumber: 28, patientName: 'Bambang Setiawan' }),
    makeQueue({ id: 'q5', queueNumber: 'A-029', sequenceNumber: 29, patientName: 'Citra Lestari' }),
  ];

  const nextQueue = waitingQueues[0];

  const notifyDemo = (message: string) => {
    Alert.alert('UI Demo', message);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <StaffHeader title="Dashboard Petugas" subtitle={todayLabel} showBack={false} />

        <View style={styles.body}>
          {/* Tabs */}
          <View
            style={[styles.tabBar, { backgroundColor: c.surface, borderColor: c.cardBorder }]}
            accessibilityRole="tablist"
          >
            {(
              [
                { key: 'verifications' as const, label: 'Verifikasi', count: pendingRegistrations.length },
                { key: 'queues' as const, label: 'Antrean Poli', count: null },
              ]
            ).map((t) => {
              const active = tab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tab, active && { backgroundColor: c.primaryContainer }]}
                  onPress={() => setTab(t.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: active ? c.onPrimaryContainer : c.onSurfaceVariant },
                      active && styles.tabTextActive,
                    ]}
                  >
                    {t.label}
                    {t.count != null ? ` (${t.count})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {tab === 'verifications' ? (
            <View style={styles.tabPanel}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
                    Menunggu Verifikasi
                  </Text>
                  <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>
                    Periksa identitas sebelum buat nomor antrean
                  </Text>
                </View>
              </View>

              <OutlineButton
                label="Pasien Manual"
                icon="person-add-outline"
                onPress={() => router.push('/(staff)/manual-register')}
              />

              <View style={styles.list}>
                {pendingRegistrations.map((reg) => (
                  <RegistrationItem
                    key={reg.id}
                    registration={reg}
                    onVerify={() => router.push('/(staff)/patient-detail')}
                  />
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
                    Menunggu Pilih Poli
                  </Text>
                  <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>
                    Sudah diverifikasi · tetapkan poli tujuan
                  </Text>
                </View>
              </View>

              <View style={styles.list}>
                {verifiedRegistrations.map((reg) => (
                  <RegistrationItem
                    key={reg.id}
                    registration={reg}
                    actionLabel="PILIH POLI"
                    onVerify={() => router.push('/(staff)/complaint-form')}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.tabPanel}>
              {/* Service selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {DEFAULT_SERVICES.map((s) => {
                  const active = s.id === serviceId;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? c.primary : c.surface,
                          borderColor: active ? c.primary : c.outlineVariant,
                        },
                      ]}
                      onPress={() => setServiceId(s.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? c.onPrimary : c.onSurfaceVariant },
                        ]}
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Panel sedang dilayani */}
              <View
                style={[
                  styles.servingCard,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.cardBorder,
                    shadowColor: c.primaryDeep,
                  },
                ]}
              >
                <View style={styles.servingTop}>
                  <View
                    style={[styles.servingIcon, { backgroundColor: c.statusServingBg }]}
                  >
                    <Ionicons name="megaphone-outline" size={22} color={c.statusServing} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.servingLabel, { color: c.onSurfaceVariant }]}>
                      Sedang Dilayani · {activeService.name}
                    </Text>
                    <Text style={[styles.servingNumber, { color: c.primary }]}>
                      {currentServing.queueNumber}
                    </Text>
                    <Text style={[styles.servingName, { color: c.onSurface }]}>
                      {currentServing.patientName}
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  label={
                    nextQueue
                      ? `PANGGIL BERIKUTNYA (${nextQueue.queueNumber})`
                      : 'TIDAK ADA ANTREAN'
                  }
                  disabled={!nextQueue}
                  onPress={() =>
                    notifyDemo(
                      `Memanggil ${nextQueue?.queueNumber} — notifikasi & display TV akan ter-update (butuh Firestore).`,
                    )
                  }
                />

                <View style={styles.actionRow}>
                  <OutlineButton
                    label="Panggil Ulang"
                    icon="refresh-outline"
                    onPress={() => notifyDemo('Panggil ulang (UI Demo).')}
                  />
                  <OutlineButton
                    label="Selesai"
                    icon="checkmark-done-outline"
                    tone="danger"
                    onPress={() => notifyDemo('Tandai selesai (UI Demo).')}
                  />
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
                  Daftar Tunggu ({waitingQueues.length})
                </Text>
                <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>
                  {activeService.name}
                </Text>
              </View>

              <View style={styles.list}>
                {waitingQueues.map((q, index) => (
                  <QueueListItem
                    key={q.id}
                    queue={q}
                    position={index + 1}
                    onSkip={() => notifyDemo(`Lewati ${q.queueNumber} (UI Demo).`)}
                  />
                ))}
              </View>
            </View>
          )}
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
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
    gap: 16,
  },

  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tabTextActive: { fontWeight: '800' },

  tabPanel: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  sectionSub: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  list: { gap: 10 },
  divider: { height: 1, marginVertical: 4 },

  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  servingCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  servingTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  servingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  servingLabel: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  servingNumber: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 48,
    marginTop: 2,
  },
  servingName: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
});
