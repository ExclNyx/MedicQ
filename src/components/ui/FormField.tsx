import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import { Colors } from '../../core/constants/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
  /** Pesan error; kalau ada, border jadi merah */
  error?: string | null;
  /** Petunjuk kecil di bawah kolom (disembunyikan saat ada error) */
  hint?: string;
}

/**
 * Kolom isian dengan label, border biru saat fokus, border merah saat error.
 * Kalau `secureTextEntry` diberikan, tombol Lihat/Sembunyikan muncul otomatis.
 */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, error, hint, multiline, secureTextEntry, onFocus, onBlur, style, ...inputProps },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.box,
          multiline && styles.boxMulti,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.inputMulti, style]}
          placeholderTextColor={Colors.outline}
          accessibilityLabel={label}
          multiline={multiline}
          secureTextEntry={isPassword ? hidden : false}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden((prev) => !prev)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'}
          >
            <Text style={styles.toggleText}>{hidden ? 'Lihat' : 'Sembunyikan'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  boxMulti: { alignItems: 'flex-start' },
  boxFocused: { borderColor: Colors.primary },
  boxError: { borderColor: Colors.error },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  inputMulti: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  toggle: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  toggleText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  error: { fontSize: 12, color: Colors.error, marginTop: 6 },
  hint: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 6 },
});
