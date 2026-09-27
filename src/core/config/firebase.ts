// Dummy firebase file for UI testing
export const firestore = {};
export const auth = {};
export const messaging = {};

export const Collections = {
  USERS: 'users',
  PATIENTS: 'patients',
  REGISTRATIONS: 'registrations',
  SERVICES: 'services',
  QUEUES: 'queues',
  QUEUE_COUNTERS: 'queue_counters',
  NOTIFICATIONS: 'notifications',
} as const;

export const getTodayString = () => '2026-10-10';
export const fromFirestore = (data: any) => data;
