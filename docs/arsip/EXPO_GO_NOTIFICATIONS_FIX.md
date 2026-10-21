# Expo Go notifications compatibility fix

This version avoids loading `expo-notifications` in Android Expo Go. The service keeps haptic feedback (`expo-haptics`) for queue-call alerts and keeps Firestore listeners intact. OS/local notification tray features are left enabled only in supported non-web runtimes where the notification module can load, such as a development build.

The patient route files `src/app/(patient)/home.tsx` and `src/app/(patient)/queue-status.tsx` both already contain default exports. If Expo Router showed missing-default-export warnings while the notification module threw, restart with a cleared Metro cache after applying this fix.

Run:

```bash
npm install
npx expo start -c
```
