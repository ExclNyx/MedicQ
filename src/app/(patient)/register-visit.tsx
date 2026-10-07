import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OutlineButton } from "../../components/ui/OutlineButton";
import { PatientHeader } from "../../components/ui/PatientHeader";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { useColors } from "../../core/theme/ThemeContext";

const PATIENT_NAME = "Andi";

const STEPS = [
  {
    icon: "document-attach-outline" as const,
    title: "Daftar kunjungan",
    text: "Konfirmasi kehadiran Anda untuk hari ini.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Verifikasi petugas",
    text: "Datang ke meja pendaftaran untuk cek identitas.",
  },
  {
    icon: "ticket-outline" as const,
    title: "Terima nomor antrean",
    text: "Nomor antrean muncul di aplikasi setelah poli ditentukan.",
  },
];

export default function RegisterVisitScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    Alert.alert(
      "Berhasil (UI Demo)",
      "Pendaftaran berhasil. Silakan menuju meja petugas untuk verifikasi.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

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
          title="Daftar Kunjungan"
          subtitle="Kunjungan untuk hari ini"
        />

        <View style={styles.body}>
          {/* Identitas pasien */}
          <View
            style={[
              styles.card,
              styles.identityCard,
              {
                backgroundColor: c.surface,
                borderColor: c.cardBorder,
                shadowColor: c.primaryDeep,
              },
            ]}
          >
            <View
              style={[
                styles.identityIcon,
                { backgroundColor: c.primaryContainer },
              ]}
            >
              <Ionicons name="person-outline" size={24} color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text
                style={[styles.identityLabel, { color: c.onSurfaceVariant }]}
              >
                Nama Pasien
              </Text>
              <Text style={[styles.identityName, { color: c.onSurface }]}>
                {PATIENT_NAME}
              </Text>
              <View style={styles.identityTag}>
                <Ionicons name="leaf-outline" size={12} color={c.primary} />
                <Text style={[styles.identityTagText, { color: c.primary }]}>
                  Terdaftar di MedicQ
                </Text>
              </View>
            </View>
          </View>

          {/* Penjelasan alur */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.infoTitle, { color: c.onSurface }]}>
              Apa yang terjadi setelah mendaftar?
            </Text>
            <Text style={[styles.infoDesc, { color: c.onSurfaceVariant }]}>
              Setelah mendaftar, Anda menemui petugas di puskesmas untuk
              verifikasi identitas dan pencatatan keluhan. Nomor antrean
              diterbitkan petugas.
            </Text>

            <View style={styles.steps}>
              {STEPS.map((step, index) => (
                <View key={step.title} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.stepIcon,
                        { backgroundColor: c.surfaceSoft },
                      ]}
                    >
                      <Ionicons name={step.icon} size={18} color={c.primary} />
                    </View>
                    {index < STEPS.length - 1 ? (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: c.outlineVariant },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.stepTitle, { color: c.onSurface }]}>
                      {step.title}
                    </Text>
                    <Text
                      style={[styles.stepText, { color: c.onSurfaceVariant }]}
                    >
                      {step.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View
            style={[
              styles.tipCard,
              { backgroundColor: c.surfaceSoft, borderLeftColor: c.primary },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={c.primary}
            />
            <Text style={[styles.tipText, { color: c.onSurfaceVariant }]}>
              Bawa KTP atau kartu identitas saat menuju puskesmas agar
              verifikasi lebih cepat.
            </Text>
          </View>

          <PrimaryButton label="YA, DAFTAR SEKARANG" onPress={handleSubmit} />
          <OutlineButton
            label="Batal"
            tone="danger"
            onPress={() => router.back()}
          />
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
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  identityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  identityLabel: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  identityName: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
    lineHeight: 24,
  },
  identityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    flexShrink: 1,
  },
  identityTagText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    flexShrink: 1,
  },

  infoTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  infoDesc: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  steps: { marginTop: 18 },
  stepRow: { flexDirection: "row", gap: 12 },
  stepRail: { alignItems: "center", width: 36 },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1 },
  stepTitle: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  stepText: { fontSize: 12, lineHeight: 18, marginTop: 2, paddingBottom: 12 },

  tipCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
  },
  tipText: { flex: 1, flexShrink: 1, fontSize: 13, lineHeight: 19 },
});
