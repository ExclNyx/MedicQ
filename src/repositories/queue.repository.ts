import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { db, Collections, fromFirestore, getTodayString } from '../core/config/firebase';
import { QueueModel, QueueStatus } from '../core/models';

function getQueueOrder(queue: QueueModel): number {
  return typeof queue.queueOrder === 'number' && Number.isFinite(queue.queueOrder)
    ? queue.queueOrder
    : queue.sequenceNumber;
}

function sortWaitingOrder(items: QueueModel[]): QueueModel[] {
  return [...items].sort((a, b) => {
    const orderDiff = getQueueOrder(a) - getQueueOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return a.sequenceNumber - b.sequenceNumber;
  });
}

type ListenerErrorHandler = (error: Error) => void;

function reportListenerError(scope: string, onError?: ListenerErrorHandler) {
  return (error: Error) => {
    console.warn(`[MedicQ] Firestore listener ${scope} gagal:`, error.message);
    onError?.(error);
  };
}

export class QueueRepository {
  async create(data: Omit<QueueModel, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, Collections.QUEUES), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async getById(id: string): Promise<QueueModel | null> {
    const docRef = doc(db, Collections.QUEUES, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...fromFirestore(snap.data()) } as unknown as QueueModel;
  }

  async updateStatus(
    id: string,
    status: QueueStatus,
    extra?: Record<string, any>
  ): Promise<void> {
    const updates: Record<string, any> = { status, ...extra };
    if (status === 'CALLED') updates.calledAt = serverTimestamp();
    if (status === 'SERVING') updates.servedAt = serverTimestamp();
    if (status === 'COMPLETED') updates.completedAt = serverTimestamp();

    const docRef = doc(db, Collections.QUEUES, id);
    await updateDoc(docRef, updates);
  }

  async getNextNumber(serviceId: string, date: string): Promise<number> {
    const counterId = `${serviceId}_${date}`;
    const counterRef = doc(db, Collections.QUEUE_COUNTERS, counterId);
    let nextNumber = 1;

    await runTransaction(db, async (tx) => {
      const counterDoc = await tx.get(counterRef);
      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data()!.lastNumber as number) + 1;
        tx.update(counterRef, { lastNumber: nextNumber });
      } else {
        tx.set(counterRef, { serviceId, date, lastNumber: 1 });
        nextNumber = 1;
      }
    });
    return nextNumber;
  }

  /**
   * Mendapatkan seluruh antrean aktif hari ini lalu mengurutkannya di client.
   * Urutan memakai queueOrder (untuk antrean yang pernah no-show) dan fallback
   * ke sequenceNumber agar data lama tetap kompatibel.
   */
  async listActiveByServiceToday(serviceId: string): Promise<QueueModel[]> {
    const today = getTodayString();
    const q = query(
      collection(db, Collections.QUEUES),
      where('serviceId', '==', serviceId),
    );

    const snap = await getDocs(q);
    const items = snap.docs
      .map((d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as QueueModel))
      .filter((queue) => queue.visitDate === today
        && (queue.status === 'WAITING' || queue.status === 'CALLED' || queue.status === 'SERVING'));
    return sortWaitingOrder(items);
  }

  listenByService(
    serviceId: string,
    callback: (queues: QueueModel[]) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const today = getTodayString();
    const q = query(
      collection(db, Collections.QUEUES),
      where('serviceId', '==', serviceId),
    );

    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as QueueModel))
        .filter((queue) => queue.visitDate === today
          && (queue.status === 'WAITING' || queue.status === 'CALLED' || queue.status === 'SERVING'));
      callback(sortWaitingOrder(items));
    }, reportListenerError('antrean poli', onError));
  }

  listenById(
    id: string,
    callback: (queue: QueueModel | null) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const docRef = doc(db, Collections.QUEUES, id);
    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }
      callback({ id: docSnap.id, ...fromFirestore(docSnap.data()) } as unknown as QueueModel);
    }, reportListenerError('detail antrean', onError));
  }

  async getNextWaiting(serviceId: string): Promise<QueueModel | null> {
    const active = await this.listActiveByServiceToday(serviceId);
    return active.find((queue) => queue.status === 'WAITING') ?? null;
  }

  listenAllByServiceToday(
    serviceId: string,
    callback: (queues: QueueModel[]) => void,
    onError?: ListenerErrorHandler,
  ): () => void {
    const today = getTodayString();
    const q = query(
      collection(db, Collections.QUEUES),
      where('serviceId', '==', serviceId),
    );

    return onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as QueueModel))
        .filter((queue) => queue.visitDate === today);
      callback(sortWaitingOrder(items));
    }, reportListenerError('semua antrean poli', onError));
  }
}

export const queueRepository = new QueueRepository();
