import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, Collections, fromFirestore, getTodayString } from '../core/config/firebase';
import { RegistrationModel, RegistrationStatus } from '../core/models';

type ListenerErrorHandler = (error: Error) => void;

function reportListenerError(scope: string, onError?: ListenerErrorHandler) {
  return (error: Error) => {
    console.warn(`[MedicQ] Firestore listener ${scope} gagal:`, error.message);
    onError?.(error);
  };
}

function mapRegistration(id: string, raw: Record<string, unknown>): RegistrationModel {
  return { id, ...fromFirestore(raw) } as unknown as RegistrationModel;
}

function createdAtMs(registration: RegistrationModel): number {
  const value = registration.createdAt;
  return value instanceof Date ? value.getTime() : 0;
}

function newestFirst(items: RegistrationModel[]): RegistrationModel[] {
  return [...items].sort((a, b) => createdAtMs(b) - createdAtMs(a));
}

export class RegistrationRepository {
  async create(data: Omit<RegistrationModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, Collections.REGISTRATIONS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  async getById(id: string): Promise<RegistrationModel | null> {
    const snap = await getDoc(doc(db, Collections.REGISTRATIONS, id));
    if (!snap.exists()) return null;
    return mapRegistration(snap.id, snap.data() as Record<string, unknown>);
  }

  async updateStatus(
    id: string,
    status: RegistrationStatus,
    extra?: Partial<RegistrationModel>,
  ): Promise<void> {
    await updateDoc(doc(db, Collections.REGISTRATIONS, id), {
      status,
      ...extra,
      updatedAt: serverTimestamp(),
    });
  }

  // Presentation mode: query by a single indexed field, filter/sort small demo
  // datasets in memory so users are not blocked by missing composite indexes.
  listenPending(
    callback: (registrations: RegistrationModel[]) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const today = getTodayString();
    const q = query(
      collection(db, Collections.REGISTRATIONS),
      where('visitDate', '==', today),
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => mapRegistration(d.id, d.data() as Record<string, unknown>))
        .filter((item) => item.status === 'REGISTRATION_PENDING');
      callback(newestFirst(items).reverse());
    }, reportListenerError('registrations pending', onError));
  }

  listenVerified(
    callback: (registrations: RegistrationModel[]) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const today = getTodayString();
    const q = query(
      collection(db, Collections.REGISTRATIONS),
      where('visitDate', '==', today),
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => mapRegistration(d.id, d.data() as Record<string, unknown>))
        .filter((item) => item.status === 'VERIFIED');
      callback(newestFirst(items).reverse());
    }, reportListenerError('registrations verified', onError));
  }

  listenPatientToday(
    patientId: string,
    callback: (reg: RegistrationModel | null) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const today = getTodayString();
    // Single-field query avoids a composite index on patientId + createdAt.
    const q = query(
      collection(db, Collections.REGISTRATIONS),
      where('patientId', '==', patientId),
    );
    return onSnapshot(q, (snap) => {
      const todayItems = snap.docs
        .map((d) => mapRegistration(d.id, d.data() as Record<string, unknown>))
        .filter((item) => item.visitDate === today);
      callback(newestFirst(todayItems)[0] ?? null);
    }, reportListenerError('registration pasien hari ini', onError));
  }

  async getPatientHistory(patientId: string, limitCount = 20): Promise<RegistrationModel[]> {
    // Sort locally for presentation-scale data rather than requiring a composite index.
    const q = query(
      collection(db, Collections.REGISTRATIONS),
      where('patientId', '==', patientId),
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => mapRegistration(d.id, d.data() as Record<string, unknown>),
    );
    return newestFirst(items).slice(0, limitCount);
  }
}

export const registrationRepository = new RegistrationRepository();
