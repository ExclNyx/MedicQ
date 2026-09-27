import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueueModel } from '../../core/models';
import { Colors } from '../../core/constants/colors';
import { StatusBadge } from './StatusBadge';

interface Props {
  queue: QueueModel;
  position: number | null;
  currentServing: QueueModel | undefined;
}

export const QueueCard: React.FC<Props> = ({ queue, position, currentServing }) => {
  const isCalled = queue.status === 'CALLED';
  const isUrgent = position !== null && position <= 2 && queue.status === 'WAITING';

  return (
    <View style={[
      styles.card,
      isCalled && styles.cardCalled,
      isUrgent && !isCalled && styles.cardUrgent,
    ]}>
      {/* Main queue number */}
      <Text style={styles.label}>Nomor Antrean Anda</Text>
      <Text style={[
        styles.queueNumber,
        isCalled && styles.queueNumberCalled,
      ]}>
        {queue.queueNumber}
      </Text>

      <View style={styles.divider} />

      <StatusBadge status={queue.status} />

      {/* Currently serving */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sedang Dilayani</Text>
          <Text style={styles.infoValue}>
            {currentServing?.queueNumber ?? '-'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pasien di Depan</Text>
          <Text style={[styles.infoValue, isUrgent && { color: Colors.warning }]}>
            {position !== null ? position : '-'}
          </Text>
        </View>
      </View>

      {/* Alert messages */}
      {isCalled && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            🔔 Nomor Anda dipanggil! Silakan menuju {queue.serviceName}.
          </Text>
        </View>
      )}
      {!isCalled && position === 0 && (
        <View style={[styles.alertBanner, styles.alertUrgent]}>
          <Text style={styles.alertText}>⚡ Bersiap! Anda berikutnya.</Text>
        </View>
      )}
      {!isCalled && position !== null && position > 0 && position <= 2 && (
        <View style={[styles.alertBanner, styles.alertWarning]}>
          <Text style={[styles.alertText, { color: Colors.grey800 }]}>
            ⏰ Antrean Anda sudah dekat.
          </Text>
        </View>
      )}

      <Text style={styles.serviceName}>Poli: {queue.serviceName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  cardCalled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  cardUrgent: {
    borderColor: Colors.warning,
  },
  label: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 8,
  },
  queueNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  queueNumberCalled: {
    color: Colors.onPrimaryContainer,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 4 },
  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  alertBanner: {
    marginTop: 16,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 10,
    padding: 12,
  },
  alertUrgent: { backgroundColor: Colors.statusCalledBg },
  alertWarning: { backgroundColor: Colors.warningBg },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    textAlign: 'center',
  },
  serviceName: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
