const { initializeApp } = require('firebase/app');
const {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} = require('firebase/auth');
const {
  doc,
  getFirestore,
  setDoc,
  Timestamp,
} = require('firebase/firestore');
const googleServices = require('../google-services.json');

const androidClient =
  googleServices.client.find(
    (client) => client.client_info?.android_client_info?.package_name === 'com.medicq.app',
  ) ?? googleServices.client[0];

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || androidClient.api_key?.[0]?.current_key,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    `${googleServices.project_info.project_id}.firebaseapp.com`,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || googleServices.project_info.project_id,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || googleServices.project_info.storage_bucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || googleServices.project_info.project_number,
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID || androidClient.client_info.mobilesdk_app_id,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  {
    email: 'admin@medicq.com',
    password: 'Admin12345!',
    displayName: 'Admin MedicQ',
    role: 'admin',
  },
  {
    email: 'staff@medicq.com',
    password: 'Staff12345!',
    displayName: 'Petugas MedicQ',
    role: 'staff',
  },
];

const services = [
  { id: 'poli_umum', name: 'Poli Umum', code: 'A', isActive: true, currentServing: null, currentServingQueueId: null },
  { id: 'poli_gigi', name: 'Poli Gigi', code: 'B', isActive: true, currentServing: null, currentServingQueueId: null },
  { id: 'kia', name: 'KIA', code: 'C', isActive: true, currentServing: null, currentServingQueueId: null },
  { id: 'lansia', name: 'Poli Lansia', code: 'D', isActive: true, currentServing: null, currentServingQueueId: null },
  { id: 'poli_lainnya', name: 'Poli Lainnya', code: 'E', isActive: true, currentServing: null, currentServingQueueId: null },
];

async function ensureAuthAccount(account) {
  let user;

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      account.email,
      account.password,
    );
    user = credential.user;
    console.log(`Created Auth account: ${account.email}`);
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error;

    const credential = await signInWithEmailAndPassword(
      auth,
      account.email,
      account.password,
    );
    user = credential.user;
    console.log(`Auth account already exists: ${account.email}`);
  }

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    createdAt: Timestamp.now(),
  }, { merge: true });

  console.log(`users/${user.uid} -> ${account.role}`);
}

async function seed() {
  try {
    console.log('Seeding MedicQ Firebase...');

    for (const account of accounts) {
      await ensureAuthAccount(account);
    }

    for (const service of services) {
      await setDoc(doc(db, 'services', service.id), service, { merge: true });
    }

    console.log('Firebase seeding completed.');
    console.log('Admin login: admin@medicq.com / Admin12345!');
    console.log('Staff login: staff@medicq.com / Staff12345!');
  } catch (error) {
    console.error('Firebase seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await auth.signOut().catch(() => undefined);
  }
}

seed();
