import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../../core/theme/ThemeContext';
import type { ColorKey } from '../../core/constants/colors';
import type { QueueStatus } from '../../core/models';

interface Props {
  status: QueueStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  QueueStatus,
  { label: string; colorKey: ColorKey; bgKey: ColorKey }
> = {
  WAITING: { label: 'Menunggu', colorKey: 'statusWaiting', bgKey: 'statusWaitingBg' },
  CALLED: { label: 'Dipanggil', colorKey: 'statusCalled', bgKey: 'statusCalledBg' },
  SERVING: { label: 'Dilayani', colorKey: 'statusServing', bgKey: 'statusServingBg' },
  COMPLETED: { label: 'Selesai', colorKey: 'statusCompleted', bgKey: 'statusCompletedBg' },
  SKIPPED: { label: 'Dilewati', colorKey: 'statusSkipped', bgKey: 'statusSkippedBg' },
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const c = useColors();
  const cfg = STATUS_CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c[cfg.bgKey] },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[styles.label, { color: c[cfg.colorKey] }, isSmall && styles.labelSm]}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 3 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  labelSm: { fontSize: 11, lineHeight: 15 },
});
