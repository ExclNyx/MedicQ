import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '../../core/theme/ThemeContext';

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  /** 'primary' untuk aksi sekunder, 'danger' untuk batal/hapus. */
  tone?: 'primary' | 'danger';
  disabled?: boolean;
}

/** Tombol sekunder — outline lembut, selaras dengan PrimaryButton. */
export function OutlineButton({
  label,
  onPress,
  icon,
  tone = 'primary',
  disabled = false,
}: OutlineButtonProps) {
  const c = useColors();
  const accent = tone === 'danger' ? c.error : c.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: accent, backgroundColor: c.surface },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <View style={styles.inner}>
        {icon ? <Ionicons name={icon} size={18} color={accent} /> : null}
        <Text style={[styles.label, { color: accent }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  disabled: { opacity: 0.55 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    flexShrink: 1,
    textAlign: 'center',
  },
});
