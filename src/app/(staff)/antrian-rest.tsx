import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StaffHeader } from '@/components/ui/StaffHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_SERVICES } from '@/constants/poli-options';
import { useAsyncQueues } from '@/hooks/useAsyncQueues';
import { useColors } from '@/hooks/useMedicQTheme';
import { useQueueStore } from '@/hooks/useQueueStore';

export default function AsyncQueueScreen() {
  const c = useColors();
  const { selectedServiceId, setSelectedServiceId } = useQueueStore();
  const serviceId = selectedServiceId || DEFAULT_SERVICES[0].id;
  const [name, setName] = useState('');

  const { queues, loading, refreshing, saving, busyId, error, refresh, addQueue, changeStatus } =
    useAsyncQueues(serviceId);

  const handleAdd = async () => {
    const ok = await addQueue(name);
    if (ok) setName('');
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />}
      >
        <StaffHeader title="Antrean (REST API)" subtitle="Async fetch: GET · POST · PATCH" />

        <View style={styles.body}>
          {/* Pilih poli */}
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
                      backgroundColor: active ? c.primary : c.surface,
                      borderColor: active ? c.primary : c.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? c.onPrimary : c.onSurfaceVariant }]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 03 Tambah antrean (POST) */}
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: c.onSurface }]}>Tambah Antrean Manual</Text>
            <Text style={[styles.cardSub, { color: c.onSurfaceVariant }]}>
              POST · pasien tanpa aplikasi langsung masuk antrean.
            </Text>
            <View style={styles.formRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleAdd}
                placeholder="Nama pasien..."
                placeholderTextColor={c.outline}
                returnKeyType="done"
                editable={!saving}
                style={[
                  styles.input,
                  { color: c.onSurface, borderColor: c.outlineVariant, backgroundColor: c.surfaceSoft },
                ]}
              />
            </View>
            <PrimaryButton label="+ Tambah" onPress={handleAdd} loading={saving} />
          </View>

          {/* 06 Refresh */}
          <View style={styles.listHeader}>
            <View style={styles.flex}>
              <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Daftar Antrean Hari Ini</Text>
              <Text style={[styles.cardSub, { color: c.onSurfaceVariant }]}>
                GET · {queues.length} data. Tarik ke bawah untuk memuat ulang.
              </Text>
            </View>
            <TouchableOpacity
              onPress={refresh}
              disabled={loading || refreshing}
              style={[styles.reloadBtn, { borderColor: c.primary, opacity: loading || refreshing ? 0.5 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Muat ulang data"
            >
              <Ionicons name="refresh-outline" size={18} color={c.primary} />
              <Text style={[styles.reloadText, { color: c.primary }]}>Reload</Text>
            </TouchableOpacity>
          </View>

          {/* 02 Loading indicator */}
          {loading ? (
            <View style={[styles.stateCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={[styles.stateText, { color: c.onSurfaceVariant }]}>Mengambil data dari server...</Text>
            </View>
          ) : null}

          {/* 05 Tampilan error (selain Alert) */}
          {!loading && error ? (
            <View style={[styles.stateCard, { backgroundColor: c.errorContainer, borderColor: c.error }]}>
              <Ionicons name="warning-outline" size={26} color={c.error} />
              <Text style={[styles.stateText, { color: c.error }]}>{error}</Text>
              <OutlineButton label="Coba Lagi" icon="refresh-outline" onPress={refresh} />
            </View>
          ) : null}

          {!loading && !error && queues.length === 0 ? (
            <View style={[styles.stateCard, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
              <Ionicons name="file-tray-outline" size={30} color={c.outline} />
              <Text style={[styles.stateText, { color: c.onSurfaceVariant }]}>
                Belum ada antrean untuk poli ini hari ini.
              </Text>
            </View>
          ) : null}

          {/* 01 Tampilkan data API + 04 Ubah status (PATCH) */}
          {!loading
            ? queues.map((queue) => {
                const done = queue.status === 'COMPLETED';
                const busy = busyId === queue.id;
                return (
                  <View
                    key={queue.id}
                    style={[styles.item, { backgroundColor: c.surface, borderColor: c.cardBorder }]}
                  >
                    <TouchableOpacity
                      onPress={() => changeStatus(queue, done ? 'WAITING' : 'COMPLETED')}
                      disabled={busy}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done, busy }}
                      accessibilityLabel={`Tandai ${queue.queueNumber} ${done ? 'belum selesai' : 'selesai'}`}
                      style={styles.checkWrap}
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color={c.primary} />
                      ) : (
                        <Ionicons
                          name={done ? 'checkmark-circle' : 'ellipse-outline'}
                          size={28}
                          color={done ? c.success : c.outline}
                        />
                      )}
                    </TouchableOpacity>

                    <View style={styles.flex}>
                      <Text
                        style={[
                          styles.number,
                          { color: done ? c.outline : c.primary, textDecorationLine: done ? 'line-through' : 'none' },
                        ]}
                      >
                        {queue.queueNumber}
                      </Text>
                      <Text style={[styles.patient, { color: c.onSurface }]} numberOfLines={1}>
                        {queue.patientName}
                      </Text>
                      <StatusBadge status={queue.status} size="sm" />
                    </View>

                    {queue.status === 'WAITING' ? (
                      <TouchableOpacity
                        onPress={() => changeStatus(queue, 'CALLED')}
                        disabled={busy}
                        style={[styles.callBtn, { backgroundColor: c.primary, opacity: busy ? 0.5 : 1 }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Panggil ${queue.queueNumber}`}
                      >
                        <Ionicons name="megaphone-outline" size={16} color={c.onPrimary} />
                        <Text style={[styles.callText, { color: c.onPrimary }]}>Panggil</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })
            : null}

          <OutlineButton
            label="Kembali ke Dashboard"
            icon="chevron-back"
            onPress={() => router.replace('/(staff)/dashboard')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  body: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, minHeight: 40, justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 12, lineHeight: 18 },
  formRow: { flexDirection: 'row' },
  input: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', lineHeight: 23 },
  reloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, minHeight: 40 },
  reloadText: { fontSize: 13, fontWeight: '800' },
  stateCard: { borderRadius: 18, borderWidth: 1, padding: 22, alignItems: 'center', justifyContent: 'center', gap: 10 },
  stateText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  item: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  patient: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 12 },
  callText: { fontSize: 13, fontWeight: '800' },
});
