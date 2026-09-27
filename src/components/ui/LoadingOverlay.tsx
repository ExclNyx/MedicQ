import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../../core/constants/colors';

interface Props {
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ message = 'Memuat...' }) => (
  <View style={styles.overlay}>
    <View style={styles.card}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minWidth: 160,
  },
  message: {
    fontSize: 14,
    color: Colors.onSurface,
  },
});
