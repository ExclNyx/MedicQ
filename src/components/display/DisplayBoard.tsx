import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { QueueModel, ServiceModel } from '../../core/models';
import { Colors } from '../../core/constants/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  service: ServiceModel | null;
  currentQueue: QueueModel | null;
  nextQueues: QueueModel[];
}

export const DisplayBoard: React.FC<Props> = ({ service, currentQueue, nextQueues }) => (
  <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>PUSKESMAS</Text>
      <Text style={styles.headerSubtitle}>{service?.name?.toUpperCase() ?? 'ANTREAN'}</Text>
    </View>

    {/* Main number */}
    <View style={styles.mainSection}>
      {currentQueue ? (
        <>
          <Text style={styles.nowServing}>NOMOR YANG DIPANGGIL</Text>
          <Text style={styles.bigNumber}>{currentQueue.queueNumber}</Text>
          <View style={styles.callBanner}>
            <Text style={styles.callText}>📢 SILAKAN MENUJU {service?.name?.toUpperCase()}</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.nowServing}>MENUNGGU</Text>
          <Text style={[styles.bigNumber, { color: Colors.onSurfaceVariant }]}>---</Text>
        </>
      )}
    </View>

    {/* Next queue list */}
    {nextQueues.length > 0 && (
      <View style={styles.nextSection}>
        <Text style={styles.nextTitle}>BERIKUTNYA</Text>
        <View style={styles.nextRow}>
          {nextQueues.slice(0, 5).map((q) => (
            <View key={q.id} style={styles.nextCard}>
              <Text style={styles.nextNumber}>{q.queueNumber}</Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>Terima kasih atas kunjungan Anda</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.onPrimary,
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryContainer,
    letterSpacing: 2,
    marginTop: 4,
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nowServing: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primaryContainer,
    letterSpacing: 2,
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: Math.min(width, height) * 0.25,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  callBanner: {
    marginTop: 20,
    backgroundColor: Colors.onPrimary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
  },
  callText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  nextSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  nextTitle: {
    color: Colors.primaryContainer,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  nextCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nextNumber: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  footerText: {
    color: Colors.primaryContainer,
    fontSize: 14,
  },
});
