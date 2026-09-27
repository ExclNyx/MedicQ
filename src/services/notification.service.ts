import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    // Request Expo notifications permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    // Request FCM permission (iOS)
    const fcmStatus = await messaging().requestPermission();
    const authorized =
      fcmStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      fcmStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return authorized;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (e) {
      console.warn('Failed to get FCM token:', e);
      return null;
    }
  }

  async showLocalNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // show immediately
    });
  }

  // Vibration based on urgency level
  async vibrate(level: 'warning' | 'urgent' | 'called'): Promise<void> {
    switch (level) {
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'urgent':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await new Promise((r) => setTimeout(r, 300));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'called':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await new Promise((r) => setTimeout(r, 200));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise((r) => setTimeout(r, 200));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }

  onForegroundMessage(callback: (message: any) => void): () => void {
    return messaging().onMessage(callback);
  }
}

export const notificationService = new NotificationService();
