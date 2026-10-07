import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { QueueModel } from '../../core/models';
import { useColors } from '../../core/theme/ThemeContext';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  queue: QueueModel;
  position?: number | null;
  onSkip?: (queue: QueueModel) => void;
  onRecall?: (queue: QueueModel) => void;
  onComplete?: (queue: QueueModel) => void;
  isActive?: boolean;
}

/** Baris antrean di dashboard petugas — nomor, nama, badge status, aksi. */
export function QueueListItem({
  queue,
  position,
  onSkip,
  onRecall,
  onComplete,
  isActive = false,
}: Props) {
  const c = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isActive ? c.primaryContainer : c.surface,
          borderColor: isActive ? c.primary : c.cardBorder,
          shadowColor: c.primaryDeep,
        },
      ]}
    >
      {position != null ? (
        <View
          style={[
            styles.seq,
            {
              backgroundColor: isActive ? c.primary : c.surfaceSoft,
              borderColor: isActive ? c.primary : c.outlineVariant,
            },
          ]}
        >
          <Text
            style={[styles.seqText, { color: isActive ? c.onPrimary : c.onSurfaceVariant }]}
          >
            {position}
          </Text>
        </View>
      ) : null}

      <View style={styles.left}>
        <Text
          style={[
            styles.number,
            { color: isActive ? c.onPrimaryContainer : c.onSurface },
          ]}
        >
          {queue.queueNumber}
        </Text>
        <Text
          style={[
            styles.name,
            { color: isActive ? c.onPrimaryContainer : c.onSurfaceVariant },
          ]}
          numberOfLines={1}
        >
          {queue.patientName}
        </Text>
      </View>

      <View style={styles.right}>
        <StatusBadge status={queue.status} size="sm" />

        {queue.status === 'CALLED' || queue.status === 'SERVING' ? (
          <View style={styles.actions}>
            {onRecall ? (
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: c.primary }]}
                onPress={() => onRecall(queue)}
                accessibilityRole="button"
                accessibilityLabel={`Panggil ulang ${queue.queueNumber}`}
              >
                <Text style={[styles.actionText, { color: c.primary }]}>Ulang</Text>
              </TouchableOpacity>
            ) : null}
            {onComplete ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.secondary, borderColor: c.secondary }]}
                onPress={() => onComplete(queue)}
                accessibilityRole="button"
                accessibilityLabel={`Selesaikan ${queue.queueNumber}`}
              >
                <Text style={[styles.actionText, { color: c.onSecondary }]}>Selesai</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {queue.status === 'WAITING' && onSkip ? (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: c.error }]}
            onPress={() => onSkip(queue)}
            accessibilityRole="button"
            accessibilityLabel={`Lewati ${queue.queueNumber}`}
          >
            <Text style={[styles.actionText, { color: c.error }]}>Lewati</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  seq: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  seqText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  left: { flex: 1, minWidth: 0 },
  number: { fontSize: 16, fontWeight: '800', letterSpacing: 0.4, lineHeight: 22 },
  name: { fontSize: 12, marginTop: 1, lineHeight: 16 },
  right: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 32,
    justifyContent: 'center',
  },
  actionText: { fontSize: 11, fontWeight: '700', lineHeight: 14 },
});
