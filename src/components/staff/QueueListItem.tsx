import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QueueModel } from '../../core/models';
import { Colors } from '../../core/constants/colors';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  queue: QueueModel;
  onSkip?: (queue: QueueModel) => void;
  onRecall?: (queue: QueueModel) => void;
  onComplete?: (queue: QueueModel) => void;
  isActive?: boolean;
}

export const QueueListItem: React.FC<Props> = ({
  queue,
  onSkip,
  onRecall,
  onComplete,
  isActive,
}) => (
  <View style={[styles.card, isActive && styles.cardActive]}>
    <View style={styles.left}>
      <Text style={[styles.number, isActive && styles.numberActive]}>
        {queue.queueNumber}
      </Text>
      <Text style={styles.name}>{queue.patientName}</Text>
    </View>
    <View style={styles.right}>
      <StatusBadge status={queue.status} size="sm" />
      {(queue.status === 'CALLED' || queue.status === 'SERVING') && (
        <View style={styles.actions}>
          {onRecall && (
            <TouchableOpacity style={[styles.actionBtn, styles.recallBtn]} onPress={() => onRecall(queue)}>
              <Text style={styles.actionText}>Panggil Ulang</Text>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => onComplete(queue)}>
              <Text style={styles.actionText}>Selesai</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {queue.status === 'WAITING' && onSkip && (
        <TouchableOpacity style={[styles.actionBtn, styles.skipBtn]} onPress={() => onSkip(queue)}>
          <Text style={[styles.actionText, { color: Colors.error }]}>Lewati</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceVariant,
  },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
  number: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  numberActive: { color: Colors.primary },
  name: { fontSize: 12, color: Colors.onSurfaceVariant },
  actions: { flexDirection: 'row', gap: 6, marginTop: 4 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  recallBtn: { borderColor: Colors.primary },
  completeBtn: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  skipBtn: { borderColor: Colors.error },
  actionText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
});
