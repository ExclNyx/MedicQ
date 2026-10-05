import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../core/theme/ThemeContext';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Tombol utama — gradasi native + shadow lembut, mendukung dark mode.
 */
export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const c = useColors();
  const inactive = loading || disabled;
  const buttonColors = [c.primaryLight, c.primary, c.primaryDeep] as const;

  return (
    <TouchableOpacity
      style={[
        styles.touch,
        inactive && styles.touchInactive,
        { shadowColor: c.primaryDeep },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      <LinearGradient
        colors={buttonColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={c.onPrimary} />
        ) : (
          <Text style={[styles.text, { color: c.onPrimary }]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    minHeight: 52,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  touchInactive: { opacity: 0.7 },
  gradient: {
    minHeight: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  text: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
