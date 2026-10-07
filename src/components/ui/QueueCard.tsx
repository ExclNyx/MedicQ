import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../../core/theme/ThemeContext';
import { QueueModel } from '../../core/models';
import { StatusBadge } from './StatusBadge';

interface Props {
  queue: QueueModel;
  position: number | null;
  currentServing: QueueModel | undefined;
}

/**
 * Kartu antrean utama pasien.
 * Lebar mengikuti parent (body) — tanpa margin sendiri,
 * radius/padding disamakan dengan kartu di AuthScreen.
 */
export function QueueCard({ queue, position, currentServing }: Props) {
  const c = useColors();
  const isCalled = queue.status === 'CALLED';
  const isUrgent = position !== null && position <= 2 && queue.status === 'WAITING';

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
      <Text style={[styles.label, { color: c.onSurfaceVariant }]}>
        Nomor Antrean Anda
      </Text>
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
          <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>
            Sedang Dilayani
          </Text>
          <Text style={[styles.infoValue, { color: c.onSurface }]}>
            {currentServing?.queueNumber ?? '—'}
          </Text>
        </View>
        <View style={[styles.infoSep, { backgroundColor: c.outlineVariant }]} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: c.onSurfaceVariant }]}>
            Pasien di Depan
          </Text>
          <Text
            style={[
              styles.infoValue,
              { color: isUrgent ? c.warning : c.onSurface },
            ]}
          >
            {position !== null ? position : '—'}
          </Text>
        </View>
      </View>

      {isCalled && (
        <View
          style={[styles.alertBanner, { backgroundColor: c.onPrimary }]}
          accessibilityRole="alert"
        >
          <Text style={[styles.alertText, { color: c.primary }]}>
            Nomor Anda dipanggil! Silakan menuju {queue.serviceName}.
          </Text>
        </View>
      )}
      {!isCalled && position === 0 && (
        <View
          style={[styles.alertBanner, { backgroundColor: c.statusCalledBg }]}
          accessibilityRole="alert"
        >
          <Text style={[styles.alertText, { color: c.statusCalled }]}>
            Bersiap! Anda berikutnya.
          </Text>
        </View>
      )}
      {!isCalled && position !== null && position > 0 && position <= 2 && (
        <View
          style={[styles.alertBanner, { backgroundColor: c.warningBg }]}
          accessibilityRole="alert"
        >
          <Text style={[styles.alertText, { color: c.onSurface }]}>
            Antrean Anda sudah dekat — mohon tetap di ruang tunggu.
          </Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: c.outlineVariant }]}>
        <Text style={[styles.serviceName, { color: c.onSurfaceVariant }]}>
          Poli: {queue.serviceName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  queueNumber: {
    fontSize: 52,
    fontWeight: '800',
    textAlign: 'center',
    alignSelf: 'stretch',
    letterSpacing: 2,
    lineHeight: 62,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  badgeRow: { alignItems: 'center' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  infoItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4, minWidth: 0 },
  infoSep: { width: 1, height: 36, marginTop: 8 },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  infoValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  alertBanner: {
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
