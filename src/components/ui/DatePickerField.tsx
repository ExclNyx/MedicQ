import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../core/theme/ThemeContext';

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** Senin = 0 … Minggu = 6 (kalender Indonesia). */
const WEEKDAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** DD-MM-YYYY → Date; null bila tidak valid. */
function parseDdMmYyyy(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  if (year < 1900 || date > new Date()) return null;
  return date;
}

function formatDdMmYyyy(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Index hari Senin=0 utk tanggal 1 di bulan tersebut. */
function mondayIndexFirstDay(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Minggu
  return jsDay === 0 ? 6 : jsDay - 1;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DatePickerFieldProps {
  label: string;
  /** Nilai form dalam DD-MM-YYYY; kosong = belum dipilih. */
  value: string;
  onChange: (date: Date) => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Batas maksimum (default: hari ini). */
  maximumDate?: Date;
}

/**
 * Kolom tanggal lahir + kalender modal murni React Native (Expo Go friendly).
 */
export function DatePickerField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = 'Ketuk untuk memilih tanggal',
  disabled = false,
  maximumDate,
}: DatePickerFieldProps) {
  const c = useColors();
  const max = maximumDate ?? new Date();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseDdMmYyyy(value), [value]);

  const [viewYear, setViewYear] = useState(() => (selected ?? max).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? max).getMonth());

  const openPicker = () => {
    if (disabled) return;
    const base = selected ?? max;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  };

  const canGoNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    return next <= new Date(max.getFullYear(), max.getMonth(), 1);
  };

  const goPrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev.getFullYear() < 1900) return;
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  };

  const goNextMonth = () => {
    if (!canGoNextMonth()) return;
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const selectDay = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    onChange(picked);
    setOpen(false);
  };

  const leading = mondayIndexFirstDay(viewYear, viewMonth);
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.onSurfaceVariant }]}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.box,
          {
            backgroundColor: c.surface,
            borderColor: error ? c.error : c.outlineVariant,
          },
        ]}
        onPress={openPicker}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `${label} ${value}, ketuk untuk mengubah` : `${label}, ketuk untuk memilih`
        }
      >
        <Text
          style={[
            styles.valueText,
            { color: value ? c.onSurface : c.outline },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={c.primary} />
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.error, { color: c.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: c.surface,
                borderColor: c.cardBorder,
                shadowColor: c.primaryDeep,
              },
            ]}
            accessibilityRole="dialog"
            accessibilityLabel="Pilih tanggal"
          >
            <View style={styles.monthHeader}>
              <TouchableOpacity
                onPress={goPrevMonth}
                style={styles.monthNav}
                accessibilityRole="button"
                accessibilityLabel="Bulan sebelumnya"
              >
                <Ionicons name="chevron-back" size={22} color={c.primary} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: c.onSurface }]}>
                {MONTHS_ID[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={goNextMonth}
                style={[styles.monthNav, !canGoNextMonth() && styles.monthNavDisabled]}
                disabled={!canGoNextMonth()}
                accessibilityRole="button"
                accessibilityLabel="Bulan berikutnya"
              >
                <Ionicons name="chevron-forward" size={22} color={c.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS_ID.map((d) => (
                <Text key={d} style={[styles.weekday, { color: c.onSurfaceVariant }]}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (day == null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const date = new Date(viewYear, viewMonth, day);
                const isSelected = selected != null && isSameDay(date, selected);
                const isToday = isSameDay(date, new Date());
                const isFuture = date > max;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isToday && { borderWidth: 1.5, borderColor: c.primary },
                      isSelected && { backgroundColor: c.primary },
                    ]}
                    onPress={() => selectDay(day)}
                    disabled={isFuture}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: isFuture }}
                    accessibilityLabel={`${day} ${MONTHS_ID[viewMonth]} ${viewYear}`}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: isSelected
                            ? c.onPrimary
                            : isFuture
                              ? c.outlineVariant
                              : isToday
                                ? c.primary
                                : c.onSurface,
                          fontWeight: isSelected || isToday ? '700' : '500',
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: c.surfaceSoft }]}
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Tutup kalender"
            >
              <Text style={[styles.closeButtonText, { color: c.primary }]}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  valueText: { flex: 1, fontSize: 15 },
  error: { fontSize: 12, marginTop: 6, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 6 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthNav: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  monthNavDisabled: { opacity: 0.3 },
  monthTitle: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: { fontSize: 14 },
  closeButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 14, fontWeight: '700' },
});
