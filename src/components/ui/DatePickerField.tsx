import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const WEEKDAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MIN_YEAR = 1900;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseDdMmYyyy(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value || '');
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (year < MIN_YEAR || date > todayEnd) return null;
  return date;
}

function formatDdMmYyyy(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function mondayIndexFirstDay(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay();
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

function endOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (date: Date) => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Tanggal lahir — kalender inline sederhana (tanpa Modal, tanpa icon font di panel).
 * Navigasi: bulan ‹ ›, tahun bisa diketik / ‹ ›, grid hari per baris minggu.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = 'Pilih tanggal lahir',
  disabled = false,
}: DatePickerFieldProps) {
  const c = useColors();
  const max = endOfToday();
  const maxYear = max.getFullYear();

  const parsed = parseDdMmYyyy(value);
  const initial = parsed ?? max;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [yearText, setYearText] = useState(String(initial.getFullYear()));

  const toggleOpen = () => {
    if (disabled) return;
    const base = parseDdMmYyyy(value) ?? max;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setYearText(String(base.getFullYear()));
    setOpen((v) => !v);
  };

  const applyYearInput = (text: string) => {
    setYearText(text);
    const n = parseInt(text.replace(/\D/g, '').slice(0, 4), 10);
    if (!Number.isNaN(n) && n >= MIN_YEAR && n <= maxYear) {
      setViewYear(n);
      if (n === maxYear && viewMonth > max.getMonth()) {
        setViewMonth(max.getMonth());
      }
    }
  };

  const stepMonth = (delta: number) => {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    if (y < MIN_YEAR || y > maxYear) return;
    if (y === maxYear && m > max.getMonth()) return;
    setViewYear(y);
    setViewMonth(m);
    setYearText(String(y));
  };

  const stepYear = (delta: number) => {
    const y = viewYear + delta;
    if (y < MIN_YEAR || y > maxYear) return;
    setViewYear(y);
    setYearText(String(y));
    if (y === maxYear && viewMonth > max.getMonth()) {
      setViewMonth(max.getMonth());
    }
  };

  const selectDay = (day: number) => {
    try {
      const picked = new Date(viewYear, viewMonth, day);
      if (Number.isNaN(picked.getTime()) || picked > max) return;
      onChange(picked);
      setOpen(false);
    } catch {
      // abaikan — jangan crash
    }
  };

  const leading = mondayIndexFirstDay(viewYear, viewMonth);
  const total = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabel = MONTHS_ID[viewMonth] ?? '';
  const atMaxMonth = viewYear === maxYear && viewMonth >= max.getMonth();
  const atMinYear = viewYear <= MIN_YEAR;
  const atMaxYear = viewYear >= maxYear;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.onSurfaceVariant }]}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.box,
          {
            backgroundColor: c.surface,
            borderColor: error ? c.error : open ? c.primary : c.outlineVariant,
          },
        ]}
        onPress={toggleOpen}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label} ${value}` : `${label}, pilih tanggal`}
      >
        <Text
          style={[styles.valueText, { color: value ? c.onSurface : c.outline }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: c.primary }]}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.error, { color: c.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: c.onSurfaceVariant }]}>{hint}</Text>
      ) : null}

      {open ? (
        <View
          style={[styles.panel, { backgroundColor: c.surface, borderColor: c.outlineVariant }]}
        >
          {/* Bulan */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => stepMonth(-1)}
              style={styles.navBtn}
              disabled={viewYear <= MIN_YEAR && viewMonth <= 0}
              accessibilityRole="button"
              accessibilityLabel="Bulan sebelumnya"
            >
              <Text style={[styles.navBtnText, { color: c.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.navTitle, { color: c.onSurface }]}>
              {monthLabel} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={() => stepMonth(1)}
              style={[styles.navBtn, atMaxMonth && styles.navBtnOff]}
              disabled={atMaxMonth}
              accessibilityRole="button"
              accessibilityLabel="Bulan berikutnya"
            >
              <Text style={[styles.navBtnText, { color: c.primary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Tahun — bisa diketik (memudahkan pilih tahun lahir) */}
          <View style={styles.yearRow}>
            <TouchableOpacity
              onPress={() => stepYear(-1)}
              style={styles.navBtn}
              disabled={atMinYear}
              accessibilityRole="button"
              accessibilityLabel="Tahun sebelumnya"
            >
              <Text style={[styles.navBtnText, { color: c.primary }]}>‹</Text>
            </TouchableOpacity>
            <TextInput
              value={yearText}
              onChangeText={applyYearInput}
              keyboardType="number-pad"
              maxLength={4}
              style={[
                styles.yearInput,
                { color: c.onSurface, borderColor: c.outlineVariant, backgroundColor: c.surfaceSoft },
              ]}
              accessibilityLabel="Tahun lahir"
              placeholder="Tahun"
              placeholderTextColor={c.outline}
            />
            <TouchableOpacity
              onPress={() => stepYear(1)}
              style={[styles.navBtn, atMaxYear && styles.navBtnOff]}
              disabled={atMaxYear}
              accessibilityRole="button"
              accessibilityLabel="Tahun berikutnya"
            >
              <Text style={[styles.navBtnText, { color: c.primary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Header hari */}
          <View style={styles.weekRow}>
            {WEEKDAYS_ID.map((d) => (
              <Text key={d} style={[styles.weekday, { color: c.onSurfaceVariant }]}>
                {d}
              </Text>
            ))}
          </View>

          {/* Grid hari — per baris minggu, flex:1 tanpa % width */}
          {weeks.map((week, wi) => (
            <View key={`w-${wi}`} style={styles.weekRow}>
              {week.map((day, di) => {
                if (day == null) {
                  return <View key={`e-${wi}-${di}`} style={styles.dayCell} />;
                }
                const date = new Date(viewYear, viewMonth, day);
                const isSelected = parsed != null && isSameDay(date, parsed);
                const isToday = isSameDay(date, new Date());
                const isFuture = date > max;
                return (
                  <TouchableOpacity
                    key={`d-${wi}-${di}`}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: c.primary, borderRadius: 20 },
                      !isSelected && isToday && { borderWidth: 1.5, borderColor: c.primary, borderRadius: 20 },
                    ]}
                    onPress={() => selectDay(day)}
                    disabled={isFuture}
                    accessibilityRole="button"
                    accessibilityLabel={`${day} ${monthLabel} ${viewYear}`}
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
          ))}

          <View style={[styles.footer, { borderTopColor: c.outlineVariant }]}>
            <Text style={[styles.footerText, { color: c.onSurfaceVariant }]}>
              {parsed ? `Terpilih: ${formatDdMmYyyy(parsed)}` : 'Ketuk tanggal untuk memilih'}
            </Text>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={[styles.doneBtn, { backgroundColor: c.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Selesai"
            >
              <Text style={[styles.doneBtnText, { color: c.onPrimary }]}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  chevron: { fontSize: 16, fontWeight: '700', paddingHorizontal: 4 },
  error: { fontSize: 12, marginTop: 6, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 6 },

  panel: {
    marginTop: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnOff: { opacity: 0.35 },
  navBtnText: { fontSize: 26, fontWeight: '700', lineHeight: 28 },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700' },

  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yearInput: {
    flex: 1,
    minHeight: 40,
    marginHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 6,
  },
  dayCell: {
    flex: 1,
    minHeight: 40,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: { fontSize: 14 },

  footer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: { flex: 1, fontSize: 12, marginRight: 8 },
  doneBtn: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 13, fontWeight: '700' },
});
