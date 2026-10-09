import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PatientHeader } from "../../components/ui/PatientHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { RegistrationModel } from "../../core/models";
import { useColors } from "../../core/theme/ThemeContext";
import { useAuthStore } from "../../stores/auth.store";
import { registrationService } from "../../services/registration.service";

/** Parse "YYYY-MM-DD" sebagai tanggal lokal (hindari geser timezone UTC). */
function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export default function HistoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  const [history, setHistory] = useState<RegistrationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setLoadError(null);

    registrationService.getHistory(user.uid)
      .then((items) => {
        if (active) setHistory(items);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const code = (error as Error & { code?: string })?.code;
        setLoadError(
          code === 'permission-denied'
            ? 'Akses riwayat ditolak oleh Firestore Rules.'
            : 'Riwayat tidak dapat dimuat. Periksa koneksi internet dan konfigurasi Firebase.',
        );
        setHistory([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.uid]);

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      {/* Header fixed di luar list — tidak di-scroll, tidak bisa ketimpa kartu */}
      <PatientHeader
        title="Riwayat Kunjungan"
        subtitle="Catatan kunjungan Anda ke puskesmas"
      />

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.count, { color: c.onSurfaceVariant }]}>
            {loading ? "Memuat..." : `${history.length} kunjungan tercatat`}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[styles.emptyIcon, { backgroundColor: c.surfaceSoft }]}
            >
              <Ionicons name="file-tray-outline" size={32} color={c.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.onSurface }]}>
              Belum ada riwayat
            </Text>
            <Text style={[styles.emptyText, { color: c.onSurfaceVariant }]}>
              {loadError ?? 'Kunjungan yang sudah selesai akan muncul di sini.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dateLabel = format(
            parseLocalDate(item.visitDate),
            "d MMMM yyyy",
            {
              locale: id,
            },
          );
          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: c.surface,
                  borderColor: c.cardBorder,
                  shadowColor: c.primaryDeep,
                },
              ]}
            >
              <View style={[styles.accent, { backgroundColor: c.primary }]} />
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateRow}>
                    <View
                      style={[
                        styles.dateIcon,
                        { backgroundColor: c.surfaceSoft },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={c.primary}
                      />
                    </View>
                    <Text style={[styles.date, { color: c.onSurface }]}>
                      {dateLabel}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: item.status === 'CANCELLED' ? c.statusSkippedBg : c.statusCompletedBg }]}>
                    <Text style={{ fontSize: 11, color: item.status === 'CANCELLED' ? c.statusSkipped : c.statusCompleted, fontWeight: '600' }}>
                      {item.status === 'CANCELLED' ? 'Dibatalkan' : 'Selesai'}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: c.outlineVariant },
                  ]}
                />

                <View style={styles.metaRow}>
                  <Ionicons
                    name="medkit-outline"
                    size={14}
                    color={c.onSurfaceVariant}
                  />
                  <Text
                    style={[styles.metaLabel, { color: c.onSurfaceVariant }]}
                  >
                    Poli Tujuan
                  </Text>
                  <Text style={[styles.metaValue, { color: c.onSurface }]}>
                    {item.serviceName}
                  </Text>
                </View>

                <View style={styles.chips}>
                  <Text
                    style={[styles.chipsLabel, { color: c.onSurfaceVariant }]}
                  >
                    Keluhan
                  </Text>
                  <View style={styles.chipsRow}>
                    {item.complaints.map((complaint) => (
                      <View
                        key={complaint}
                        style={[
                          styles.chip,
                          { backgroundColor: c.primaryContainer },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: c.onPrimaryContainer },
                          ]}
                        >
                          {complaint}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingTop: 8 },
  count: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 12,
    marginHorizontal: 20,
  },

  card: {
    flexDirection: "row",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  accent: { width: 4 },
  cardInner: { flex: 1, padding: 16, minWidth: 0 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  dateIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  date: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    flexShrink: 1,
  },
  divider: { height: 1, marginVertical: 12 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    flexShrink: 1,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    flexShrink: 1,
  },
  chips: { marginTop: 12 },
  chipsLabel: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
  },
  chipText: { fontSize: 12, fontWeight: "600", lineHeight: 16 },

  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    alignSelf: "stretch",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    alignSelf: "stretch",
    lineHeight: 20,
  },
});
