import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OutlineButton } from "../../components/ui/OutlineButton";
import { PatientHeader } from "../../components/ui/PatientHeader";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { QueueCard } from "../../components/ui/QueueCard";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import type { QueueModel } from "../../core/models";
import { useColors } from "../../core/theme/ThemeContext";

type UiState = "idle" | "pending" | "verified" | "queued" | "called";

const PATIENT_NAME = "Andi";

const dummyQueue: QueueModel = {
  id: "1",
  queueNumber: "A-027",
  status: "WAITING",
  serviceName: "Poli Umum",
  patientName: PATIENT_NAME,
  patientId: "1",
  registrationId: "1",
  serviceId: "poli_umum",
  visitDate: "2026-10-06",
  sequenceNumber: 27,
  createdAt: new Date(),
  calledAt: null,
  servedAt: null,
  completedAt: null,
};

const currentServing: QueueModel = {
  id: "2",
  queueNumber: "A-025",
  status: "SERVING",
  serviceName: "Poli Umum",
  patientName: "Budi",
  patientId: "2",
  registrationId: "2",
  serviceId: "poli_umum",
  visitDate: "2026-10-06",
  sequenceNumber: 25,
  createdAt: new Date(),
  calledAt: null,
  servedAt: null,
  completedAt: null,
};

const STATUS_META: Record<
  UiState,
  {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    text: string;
    tint: "info" | "success";
  }
> = {
  idle: {
    icon: "document-text-outline",
    title: "Belum ada antrean",
    text: "Anda belum mendaftar kunjungan untuk hari ini. Daftar jika ingin berobat.",
    tint: "info",
  },
  pending: {
    icon: "time-outline",
    title: "Menunggu Verifikasi",
    text: "Silakan menuju meja pendaftaran agar petugas dapat memverifikasi identitas Anda.",
    tint: "info",
  },
  verified: {
    icon: "shield-checkmark-outline",
    title: "Identitas Terverifikasi",
    text: "Petugas sedang mencatat keluhan Anda dan menentukan poli tujuan. Mohon tunggu sebentar.",
    tint: "success",
  },
  queued: {
    icon: "people-outline",
    title: "Anda Sudah Mendapat Nomor",
    text: "Pantau antrean Anda di sini. Pastikan tetap di ruang tunggu sampai nomor dipanggil.",
    tint: "info",
  },
  called: {
    icon: "megaphone-outline",
    title: "Nomor Anda Dipanggil!",
    text: "Segera menuju loket/ruang poli yang tertera pada kartu antrean.",
    tint: "success",
  },
};

export default function PatientHomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [uiState, setUiState] = useState<UiState>("queued");

  const todayLabel = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });
  const meta = STATUS_META[uiState];
  const queue: QueueModel =
    uiState === "called"
      ? { ...dummyQueue, status: "CALLED", calledAt: new Date() }
      : dummyQueue;
  const position = uiState === "called" ? 0 : 2;
  const showQueue = uiState === "queued" || uiState === "called";

  const tintBg = meta.tint === "success" ? c.successBg : c.surfaceSoft;
  const tintIcon = meta.tint === "success" ? c.success : c.primary;

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
          title=""
          showBack={false}
          right={
            <View style={styles.headerButtons}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                style={[
                  styles.iconBtn,
                  { backgroundColor: "rgba(255,255,255,0.14)" },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Keluar"
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={c.onPrimary}
                />
              </TouchableOpacity>
            </View>
          }
        >
          <Text style={[styles.greeting, { color: c.onPrimaryMuted }]}>
            Halo,
          </Text>
          <Text style={[styles.name, { color: c.onPrimary }]}>
            {PATIENT_NAME}
          </Text>
          <Text style={[styles.date, { color: c.onPrimaryMuted }]}>
            {todayLabel}
          </Text>
        </PatientHeader>

        {/* Body overlap sama seperti AuthScreen: hero paddingBottom 64, ini -40 */}
        <View style={styles.body}>
          {showQueue ? (
            <>
              <QueueCard
                queue={queue}
                position={position}
                currentServing={currentServing}
              />
              <OutlineButton
                label="Lihat Detail Antrean"
                icon="list-outline"
                onPress={() => router.push("/(patient)/queue-status")}
              />
            </>
          ) : (
            <>
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
                <View style={[styles.iconCircle, { backgroundColor: tintBg }]}>
                  <Ionicons name={meta.icon} size={28} color={tintIcon} />
                </View>
                <Text style={[styles.statusTitle, { color: c.onSurface }]}>
                  {meta.title}
                </Text>
                <Text
                  style={[styles.statusText, { color: c.onSurfaceVariant }]}
                >
                  {meta.text}
                </Text>

                {uiState === "pending" || uiState === "verified" ? (
                  <View style={styles.steps}>
                    {[
                      { key: "reg", label: "Pendaftaran", done: true },
                      {
                        key: "verif",
                        label: "Verifikasi petugas",
                        done: uiState === "verified",
                      },
                      { key: "queue", label: "Nomor antrean", done: false },
                    ].map((step, index) => (
                      <View key={step.key} style={styles.stepRow}>
                        <View style={styles.stepRail}>
                          <View
                            style={[
                              styles.stepDot,
                              {
                                backgroundColor: step.done
                                  ? c.primary
                                  : c.surface,
                                borderColor: step.done
                                  ? c.primary
                                  : c.outlineVariant,
                              },
                            ]}
                          >
                            {step.done ? (
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color={c.onPrimary}
                              />
                            ) : (
                              <Text
                                style={[
                                  styles.stepNum,
                                  { color: c.onSurfaceVariant },
                                ]}
                              >
                                {index + 1}
                              </Text>
                            )}
                          </View>
                          {index < 2 ? (
                            <View
                              style={[
                                styles.stepLine,
                                {
                                  backgroundColor: step.done
                                    ? c.primary
                                    : c.outlineVariant,
                                },
                              ]}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.stepLabel,
                            {
                              color: step.done
                                ? c.onSurface
                                : c.onSurfaceVariant,
                            },
                          ]}
                        >
                          {step.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              {uiState === "idle" ? (
                <View style={styles.ctaBlock}>
                  <PrimaryButton
                    label="DAFTAR KUNJUNGAN BARU"
                    onPress={() => router.push("/(patient)/register-visit")}
                  />
                  <Text style={[styles.ctaHint, { color: c.onSurfaceVariant }]}>
                    Gratis · Cukup 1 menit · Verifikasi di puskesmas
                  </Text>
                </View>
              ) : null}
            </>
          )}

          {/* Aksi cepat */}
          <TouchableOpacity
            style={[
              styles.quickRow,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
            onPress={() => router.push("/(patient)/history")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Buka riwayat kunjungan"
          >
            <View
              style={[styles.quickIcon, { backgroundColor: c.surfaceSoft }]}
            >
              <Ionicons name="time-outline" size={20} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.quickTitle, { color: c.onSurface }]}>
                Riwayat Kunjungan
              </Text>
              <Text style={[styles.quickSub, { color: c.onSurfaceVariant }]}>
                Lihat kunjungan sebelumnya
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={c.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Development Tools for UI Testing */}
          <View
            style={[
              styles.devTools,
              { backgroundColor: c.surfaceSoft, borderColor: c.outlineVariant },
            ]}
          >
            <Text style={[styles.devTitle, { color: c.onSurfaceVariant }]}>
              Pratinjau status (dev)
            </Text>
            <View style={styles.devGrid}>
              {(
                [
                  ["idle", "1. Belum Daftar"],
                  ["pending", "2. Pending Verif"],
                  ["verified", "3. Terverifikasi"],
                  ["queued", "4. Dapat Nomor"],
                  ["called", "5. Dipanggil"],
                ] as const
              ).map(([state, label]) => {
                const active = uiState === state;
                return (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.devBtn,
                      {
                        backgroundColor: active ? c.primary : c.surface,
                        borderColor: active ? c.primary : c.outlineVariant,
                      },
                    ]}
                    onPress={() => setUiState(state)}
                  >
                    <Text
                      style={[
                        styles.devBtnText,
                        { color: active ? c.onPrimary : c.onSurfaceVariant },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  greeting: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  name: { fontSize: 26, fontWeight: "800", marginTop: 2, lineHeight: 34 },
  date: { fontSize: 13, lineHeight: 18, marginTop: 6, flexShrink: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
    alignSelf: "stretch",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    alignSelf: "stretch",
  },

  steps: { alignSelf: "stretch", marginTop: 20 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepRail: { alignItems: "center", width: 24 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 11, fontWeight: "700", lineHeight: 14 },
  stepLine: { width: 2, height: 20, borderRadius: 1 },
  stepLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    paddingTop: 2,
  },

  ctaBlock: { gap: 10 },
  ctaHint: { fontSize: 12, lineHeight: 16, textAlign: "center" },

  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  quickSub: { fontSize: 12, lineHeight: 16, marginTop: 2 },

  devTools: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 10,
  },
  devGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  devBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  devBtnText: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
});
