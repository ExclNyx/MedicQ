import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../../core/theme/ThemeContext';
import { QueueModel } from '../../core/models';
import { StatusBadge } from './StatusBadge';

interface Props {
  queue: QueueModel;
  position: number | null;
  currentServing: QueueModel | null;
  aheadQueues?: QueueModel[];
}

export function QueueCard({ queue, position, currentServing, aheadQueues = [] }: Props) {
  const c = useColors();
  const isCalled = queue.status === 'CALLED';
  const isCompleted = queue.status === 'COMPLETED';
  const isUrgent = position !== null && position <= 2 && queue.status === 'WAITING';
  const hasBeenSkipped = (queue.skipCount ?? 0) > 0 && queue.status === 'WAITING';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: isCalled ? c.primary : c.cardBorder,
          shadowColor: c.primaryDeep,
        },
        isCalled && { backgroundColor: c.primaryContainer },
        isUrgent && !isCalled && { borderColor: c.warning },
      ]}
    >
      <Text style={[styles.label, { color: c.onSurfaceVariant }]}>Nomor Antrean Anda</Text>
      <Text
        style={[
          styles.queueNumber,
          { color: isCalled ? c.onPrimaryContainer : c.primary },
        ]}
      >
        {queue.queueNumber}
      </Text>

      <View style={[styles.divider, { backgroundColor: c.outlineVariant }]} />

      <View style={styles.badgeRow}>
        <StatusBadge status={queue.status} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Sedang Dilayani</Text>
          <Text style={[styles.infoValue, { color: c.onSurface }]}>
            {currentServing?.queueNumber ?? '—'}
          </Text>
        </View>
        <View style={[styles.infoSep, { backgroundColor: c.outlineVariant }]} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>Pasien di Depan</Text>
          <Text style={[styles.infoValue, { color: isUrgent ? c.warning : c.onSurface }]}>
            {position !== null ? position : '—'}
          </Text>
        </View>
      </View>

      {aheadQueues.length > 0 && !isCompleted ? (
        <View style={[styles.aheadBox, { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant }]}> 
          <Text style={[styles.aheadTitle, { color: c.onSurfaceVariant }]}>Antrean sebelum Anda</Text>
          <View style={styles.aheadRow}>
            {aheadQueues.map((item) => (
              <View key={item.id} style={[styles.aheadChip, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}> 
                <Text style={[styles.aheadChipText, { color: c.onSurface }]}>{item.queueNumber}</Text>
              </View>
            ))}
            {position !== null && position > aheadQueues.length ? (
              <Text style={[styles.moreAhead, { color: c.onSurfaceVariant }]}>+{position - aheadQueues.length}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {isCalled ? (
        <View style={[styles.alertBanner, { backgroundColor: c.onPrimary }]} accessibilityRole="alert">
          <Ionicons name="megaphone-outline" size={17} color={c.primary} />
          <Text style={[styles.alertText, { color: c.primary }]}>Nomor Anda sedang dilayani. Silakan menuju {queue.serviceName}.</Text>
        </View>
      ) : null}

      {!isCalled && !isCompleted && position === 0 ? (
        <View style={[styles.alertBanner, { backgroundColor: c.statusCalledBg }]} accessibilityRole="alert">
          <Text style={[styles.alertText, { color: c.statusCalled }]}>Bersiap! Anda berikutnya.</Text>
        </View>
      ) : null}

      {!isCalled && !isCompleted && position !== null && position > 0 && position <= 2 ? (
        <View style={[styles.alertBanner, { backgroundColor: c.warningBg }]} accessibilityRole="alert">
          <Text style={[styles.alertText, { color: c.onSurface }]}>Antrean Anda sudah dekat — mohon tetap di ruang tunggu.</Text>
        </View>
      ) : null}

      {hasBeenSkipped ? (
        <View style={[styles.skipBanner, { backgroundColor: c.warningBg, borderColor: c.warning }]} accessibilityRole="alert">
          <Ionicons name="time-outline" size={17} color={c.warning} />
          <Text style={[styles.skipText, { color: c.onSurface }]}>Nomor Anda sempat dilewati karena belum merespons. Nomor tetap sama dan sekarang kembali ke belakang antrean; Anda tidak perlu mengambil nomor baru.</Text>
        </View>
      ) : null}

      {isCompleted ? (
        <View style={[styles.doneBanner, { backgroundColor: c.successBg, borderColor: c.success }]} accessibilityRole="alert">
          <Ionicons name="checkmark-circle-outline" size={17} color={c.success} />
          <Text style={[styles.doneText, { color: c.onSurface }]}>Pelayanan untuk nomor ini sudah selesai.</Text>
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: c.outlineVariant }]}> 
        <Text style={[styles.serviceName, { color: c.onSurfaceVariant }]}>Poli: {queue.serviceName}</Text>
        {(queue.skipCount ?? 0) > 0 ? (
          <Text style={[styles.skipCount, { color: c.outline }]}>Pernah dilewati {queue.skipCount}×</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', alignSelf: 'stretch', borderRadius: 24, padding: 24, borderWidth: 1, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  label: { fontSize: 14, lineHeight: 20, textAlign: 'center', alignSelf: 'stretch', marginBottom: 8 },
  queueNumber: { fontSize: 52, fontWeight: '800', textAlign: 'center', alignSelf: 'stretch', letterSpacing: 2, lineHeight: 62 },
  divider: { height: 1, marginVertical: 16 },
  badgeRow: { alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  infoItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4, minWidth: 0 },
  infoSep: { width: 1, height: 36, marginTop: 8 },
  infoLabel: { fontSize: 12, lineHeight: 16, marginBottom: 4, textAlign: 'center', alignSelf: 'stretch' },
  infoValue: { fontSize: 22, lineHeight: 28, fontWeight: '700', textAlign: 'center', alignSelf: 'stretch' },
  aheadBox: { marginTop: 16, borderRadius: 15, borderWidth: 1, padding: 12 },
  aheadTitle: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  aheadRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  aheadChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  aheadChipText: { fontSize: 12, fontWeight: '800' },
  moreAhead: { fontSize: 11, fontWeight: '700' },
  alertBanner: { marginTop: 16, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  alertText: { flex: 1, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 19 },
  skipBanner: { marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  skipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  doneBanner: { marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneText: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, alignItems: 'center' },
  serviceName: { fontSize: 13, lineHeight: 18, textAlign: 'center', alignSelf: 'stretch' },
  skipCount: { fontSize: 10, marginTop: 3 },
});
