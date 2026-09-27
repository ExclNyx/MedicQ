import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueueStatus } from '../../core/models';
import { Colors } from '../../core/constants/colors';

interface Props {
  status: QueueStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<QueueStatus, { label: string; color: string; bg: string }> = {
  WAITING: { label: 'Menunggu', color: Colors.statusWaiting, bg: Colors.statusWaitingBg },
  CALLED: { label: 'Dipanggil', color: Colors.statusCalled, bg: Colors.statusCalledBg },
  SERVING: { label: 'Dilayani', color: Colors.statusServing, bg: Colors.statusServingBg },
  COMPLETED: { label: 'Selesai', color: Colors.statusCompleted, bg: Colors.statusCompletedBg },
  SKIPPED: { label: 'Dilewati', color: Colors.statusSkipped, bg: Colors.statusSkippedBg },
};

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.label, { color: cfg.color }, isSmall && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 13, fontWeight: '600' },
  labelSm: { fontSize: 11 },
});
