import { Dimensions, StyleSheet, Text, View } from 'react-native';
import type { QueueModel, ServiceModel } from '../../core/models';

const { width, height } = Dimensions.get('window');
const big = Math.min(width, height);

// Warna display TV tetap (bukan dark-mode app): kontras tinggi dari jauh.
const TV = {
  bg: '#0D47A1',
  headerBg: '#0A3A82',
  nextBg: 'rgba(0,0,0,0.22)',
  cardBg: 'rgba(255,255,255,0.14)',
  cardBorder: 'rgba(255,255,255,0.32)',
  onBg: '#FFFFFF',
  muted: '#BBDEFB',
  accent: '#FFFFFF',
  bannerBg: '#FFFFFF',
  bannerText: '#0D47A1',
} as const;

interface Props {
  service: ServiceModel | null;
  currentQueue: QueueModel | null;
  nextQueues: QueueModel[];
}

/**
 * Papan antrean TV ruang tunggu (PRD F-D01–D03).
 * Nomor dipanggil sangat besar; daftar berikutnya 5–10 nomor.
 * Update realtime lewat props dari Firestore listener.
 */
export function DisplayBoard({ service, currentQueue, nextQueues }: Props) {
  const serviceName = service?.name?.toUpperCase() ?? 'ANTREAN';
  const next = nextQueues.slice(0, 10);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PUSKESMAS</Text>
        <Text style={styles.headerSubtitle}>{serviceName}</Text>
      </View>

      {/* Nomor dipanggil */}
      <View style={styles.mainSection}>
        {currentQueue ? (
          <>
            <Text style={styles.nowServing}>NOMOR YANG DIPANGGIL</Text>
            <Text style={styles.bigNumber}>{currentQueue.queueNumber}</Text>
            <View style={styles.callBanner}>
              <Text style={styles.callText}>
                SILAKAN MENUJU {serviceName}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.nowServing}>MENUNGGU</Text>
            <Text style={styles.bigNumberMuted}>---</Text>
            <Text style={styles.waitHint}>Nomor berikutnya akan muncul di sini</Text>
          </>
        )}
      </View>

      {/* Daftar berikutnya */}
      <View style={styles.nextSection}>
        <Text style={styles.nextTitle}>BERIKUTNYA</Text>
        {next.length > 0 ? (
          <View style={styles.nextRow}>
            {next.map((q) => (
              <View key={q.id} style={styles.nextCard}>
                <Text style={styles.nextNumber}>{q.queueNumber}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.nextEmpty}>Tidak ada antrean berikutnya</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Terima kasih atas kunjungan Anda</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TV.bg,
  },
  header: {
    paddingTop: Math.max(24, big * 0.04),
    paddingBottom: big * 0.03,
    alignItems: 'center',
    backgroundColor: TV.headerBg,
  },
  headerTitle: {
    fontSize: big * 0.045,
    fontWeight: '900',
    color: TV.onBg,
    letterSpacing: 6,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  headerSubtitle: {
    fontSize: big * 0.032,
    fontWeight: '700',
    color: TV.muted,
    letterSpacing: 3,
    marginTop: 6,
    textAlign: 'center',
    alignSelf: 'stretch',
  },

  mainSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nowServing: {
    fontSize: big * 0.035,
    fontWeight: '600',
    color: TV.muted,
    letterSpacing: 3,
    marginBottom: 12,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  bigNumber: {
    fontSize: big * 0.28,
    fontWeight: '900',
    color: TV.accent,
    letterSpacing: 10,
    textAlign: 'center',
    alignSelf: 'stretch',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 10,
  },
  bigNumberMuted: {
    fontSize: big * 0.22,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 8,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  waitHint: {
    marginTop: 16,
    fontSize: big * 0.028,
    color: TV.muted,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  callBanner: {
    marginTop: big * 0.03,
    backgroundColor: TV.bannerBg,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    maxWidth: '100%',
    flexShrink: 1,
  },
  callText: {
    fontSize: big * 0.032,
    fontWeight: '800',
    color: TV.bannerText,
    letterSpacing: 2,
    textAlign: 'center',
  },

  nextSection: {
    backgroundColor: TV.nextBg,
    paddingVertical: big * 0.028,
    paddingHorizontal: 24,
  },
  nextTitle: {
    color: TV.muted,
    fontSize: big * 0.022,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: 14,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  nextCard: {
    backgroundColor: TV.cardBg,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: TV.cardBorder,
    minWidth: big * 0.14,
    alignItems: 'center',
  },
  nextNumber: {
    color: TV.onBg,
    fontSize: big * 0.04,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  nextEmpty: {
    color: TV.muted,
    fontSize: big * 0.026,
    textAlign: 'center',
    alignSelf: 'stretch',
  },

  footer: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: TV.headerBg,
  },
  footerText: {
    color: TV.muted,
    fontSize: big * 0.022,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
