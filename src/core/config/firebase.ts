import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import googleServices from '../../../google-services.json';

/**
 * Firebase JS SDK configuration for Expo Go.
 *
 * On Android, the project already contains google-services.json, so the
 * Firebase identifiers are used as a mobile fallback. For web/universal
 * builds, set the Web App values in .env (recommended by Expo/Firebase).
 */
const androidClient =
  googleServices.client.find(
    (client) =>
      client.client_info.android_client_info?.package_name === 'com.medicq.app',
  ) ?? googleServices.client[0];

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? googleServices.project_info.project_id;
const storageBucket =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? googleServices.project_info.storage_bucket;
const messagingSenderId =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? googleServices.project_info.project_number;
const apiKey =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? androidClient.api_key?.[0]?.current_key;
const appId =
  process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? androidClient.client_info.mobilesdk_app_id;
const authDomain =
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || String(value).includes('xxxx') || String(value).includes('YOUR_'))
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase belum siap. Periksa google-services.json atau isi EXPO_PUBLIC_FIREBASE_* di .env. Field kosong: ${missingConfig.join(', ')}`,
  );
}

// Hindari membuat Firebase App lebih dari satu kali saat Fast Refresh.
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createAuth(appInstance: typeof app): Auth {
  if (Platform.OS === 'web') {
    return getAuth(appInstance);
  }

  try {
    // Persistence ini kompatibel dengan React Native + Expo Go.
    return initializeAuth(appInstance, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh bisa membuat Auth sudah terdaftar lebih dulu.
    return getAuth(appInstance);
  }
}

export const auth = createAuth(app);
export const db = getFirestore(app);
export const firestore = db;

export const Collections = {
  USERS: 'users',
  PATIENTS: 'patients',
  REGISTRATIONS: 'registrations',
  SERVICES: 'services',
  QUEUES: 'queues',
  QUEUE_COUNTERS: 'queue_counters',
  NOTIFICATIONS: 'notifications',
} as const;

export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Ubah Firestore Timestamp secara rekursif menjadi Date. */
export const fromFirestore = <T = any>(data: T): T => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => fromFirestore(item)) as T;

  const maybeTimestamp = data as { toDate?: () => Date };
  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate() as T;
  }

  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    converted[key] = fromFirestore(value);
  }
  return converted as T;
};
