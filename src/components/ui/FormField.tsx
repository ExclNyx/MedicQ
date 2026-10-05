import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import { useColors } from '../../core/theme/ThemeContext';
import { useScrollToFocusedInput } from './AuthScreen';

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
  const c = useColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;
  const scrollToFocusedInput = useScrollToFocusedInput();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.onSurfaceVariant }]}>{label}</Text>

      <View
        style={[
          styles.box,
          multiline && styles.boxMulti,
          {
            backgroundColor: c.surface,
            borderColor: error ? c.error : focused ? c.primary : c.outlineVariant,
          },
        ]}
      >
        {/* inputProps di bawah dulu, handler custom di atas supaya tidak tertimpa */}
        <TextInput
          ref={ref}
          {...inputProps}
          style={[
            styles.input,
            multiline && styles.inputMulti,
            { color: c.onSurface },
            style,
          ]}
          placeholderTextColor={c.outline}
          accessibilityLabel={label}
          multiline={multiline}
          secureTextEntry={isPassword ? hidden : false}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
            try {
              scrollToFocusedInput();
            } catch {
              // abaikan bila measure gagal — keyboard tetap boleh terbuka
            }
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden((prev) => !prev)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'}
          >
            <Text style={[styles.toggleText, { color: c.primary }]}>
              {hidden ? 'Lihat' : 'Sembunyikan'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.error, { color: c.error }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
  },
  boxMulti: { alignItems: 'flex-start' },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputMulti: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  toggle: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  toggleText: { fontSize: 13, fontWeight: '700' },
  error: { fontSize: 12, marginTop: 6, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 6 },
});
