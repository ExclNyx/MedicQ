import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../core/constants/colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Tombol utama (biru, tinggi 52px) dengan indikator loading. */
export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.button, inactive && styles.buttonInactive]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={Colors.onPrimary} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  buttonInactive: { opacity: 0.7 },
  text: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
