import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../stores/auth.store';
import { useColors } from '../core/theme/ThemeContext';

export default function Index() {
  const { user, isInitialized } = useAuthStore();
  const c = useColors();

  if (!isInitialized) {
    return (
      <View style={[styles.loader, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Redirect href="/(admin)/dashboard" />;
    }

    if (user.role === 'staff') {
      return <Redirect href="/(staff)/dashboard" />;
    }

    if (user.role === 'patient') {
      return <Redirect href="/(auth)/patient-access" />;
    }

    // Unknown/malformed roles must never fall through to another role's screen.
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
