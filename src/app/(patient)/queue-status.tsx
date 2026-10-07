import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PatientHeader } from "../../components/ui/PatientHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { QueueStatus } from "../../core/models";
import { useColors } from "../../core/theme/ThemeContext";

interface QueueItem {
  id: string;
  queueNumber: string;
  status: QueueStatus;
}

const MY_QUEUE: QueueItem & {
  serviceName: string;
  patientName: string;
  position: number;
} = {
  id: "1",
  queueNumber: "A-027",
  status: "WAITING",
  serviceName: "Poli Umum",
  patientName: "Andi",
  position: 2,
};

const waitingList: QueueItem[] = [
  { id: "q1", queueNumber: "A-025", status: "SERVING" },
  { id: "q2", queueNumber: "A-026", status: "WAITING" },
  { id: "1", queueNumber: "A-027", status: "WAITING" },
  { id: "q4", queueNumber: "A-028", status: "WAITING" },
];

export default function QueueStatusScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PatientHeader
          title="Status Antrean"
          subtitle={`${MY_QUEUE.serviceName} · Kunjungan hari ini`}
        />

        <View style={styles.body}>
          {/* Nomor Anda */}
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
            <Text style={[styles.numberLabel, { color: c.onSurfaceVariant }]}>
              Nomor Anda
            </Text>
            <Text style={[styles.number, { color: c.primary }]}>
              {MY_QUEUE.queueNumber}
            </Text>
            <StatusBadge status={MY_QUEUE.status} />

            <View
              style={[styles.divider, { backgroundColor: c.outlineVariant }]}
            />

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                  Posisi
                </Text>
                <Text style={[styles.statValue, { color: c.onSurface }]}>
                  {MY_QUEUE.position}
                </Text>
                <Text style={[styles.statUnit, { color: c.onSurfaceVariant }]}>
                  di depan
                </Text>
              </View>
              <View
                style={[styles.statSep, { backgroundColor: c.outlineVariant }]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                  Dilayani
                </Text>
                <Text style={[styles.statValue, { color: c.onSurface }]}>
                  A-025
                </Text>
                <Text style={[styles.statUnit, { color: c.onSurfaceVariant }]}>
                  Poli Umum
                </Text>
              </View>
              <View
                style={[styles.statSep, { backgroundColor: c.outlineVariant }]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                  Estimasi
                </Text>
                <Text style={[styles.statValue, { color: c.onSurface }]}>
                  ~15
                </Text>
                <Text style={[styles.statUnit, { color: c.onSurfaceVariant }]}>
                  menit
                </Text>
              </View>
            </View>
          </View>

          {/* Tips singkat */}
          <View
            style={[
              styles.tipCard,
              { backgroundColor: c.surfaceSoft, borderLeftColor: c.primary },
            ]}
          >
            <Ionicons name="ear-outline" size={18} color={c.primary} />
            <Text style={[styles.tipText, { color: c.onSurfaceVariant }]}>
              Dengarkan panggilan nomor Anda. Saat nomor sebelumnya dipanggil,
              bersiaplah di dekat loket.
            </Text>
          </View>

          {/* Daftar antrean */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Daftar Antrean
            </Text>
            <Text style={[styles.sectionSub, { color: c.onSurfaceVariant }]}>
              {MY_QUEUE.serviceName}
            </Text>
          </View>

          <View
            style={[
              styles.list,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            {waitingList.map((q, index) => {
              const isMe = q.id === MY_QUEUE.id;
              const isLast = index === waitingList.length - 1;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.item,
                    !isLast && {
                      borderBottomWidth: 1,
                      borderBottomColor: c.outlineVariant,
                    },
                    isMe && { backgroundColor: c.primaryContainer },
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.seq,
                        {
                          backgroundColor: isMe ? c.primary : c.surfaceSoft,
                          borderColor: isMe ? c.primary : c.outlineVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.seqText,
                          { color: isMe ? c.onPrimary : c.onSurfaceVariant },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.itemNumber,
                        { color: isMe ? c.primary : c.onSurface },
                      ]}
                    >
                      {q.queueNumber}
                    </Text>
                  </View>

                  <View style={styles.itemRight}>
                    <StatusBadge status={q.status} size="sm" />
                    {isMe ? (
                      <View
                        style={[styles.meChip, { backgroundColor: c.primary }]}
                      >
                        <Text
                          style={[styles.meChipText, { color: c.onPrimary }]}
                        >
                          Anda
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 20,
    marginTop: -40,
    gap: 16,
  },

  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  numberLabel: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    alignSelf: "stretch",
  },
  number: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 2,
    marginVertical: 6,
    lineHeight: 56,
    textAlign: "center",
    alignSelf: "stretch",
  },
  divider: { height: 1, alignSelf: "stretch", marginVertical: 18 },

  statRow: { flexDirection: "row", alignSelf: "stretch" },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    minWidth: 0,
  },
  statSep: { width: 1, marginVertical: 4 },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    textAlign: "center",
    alignSelf: "stretch",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    textAlign: "center",
    alignSelf: "stretch",
  },
  statUnit: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
    alignSelf: "stretch",
  },

  tipCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
  },
  tipText: { flex: 1, flexShrink: 1, fontSize: 13, lineHeight: 19 },

  sectionHeader: { marginTop: 4, marginLeft: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  sectionSub: { fontSize: 12, lineHeight: 16, marginTop: 2 },

  list: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  seq: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  seqText: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
  itemNumber: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    lineHeight: 22,
    flexShrink: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  meChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meChipText: { fontSize: 11, fontWeight: "700", lineHeight: 14 },
});
