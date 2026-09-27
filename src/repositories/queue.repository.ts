import firestore from '@react-native-firebase/firestore';
import { Collections, fromFirestore, getTodayString } from '../core/config/firebase';
import { QueueModel, QueueStatus } from '../core/models';

export class QueueRepository {
  private col = firestore().collection(Collections.QUEUES);
  private counterCol = firestore().collection(Collections.QUEUE_COUNTERS);

  async create(data: Omit<QueueModel, 'id' | 'createdAt'>): Promise<string> {
    const ref = await this.col.add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  async getById(id: string): Promise<QueueModel | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as QueueModel;
  }

  async updateStatus(
    id: string,
    status: QueueStatus,
    extra?: Record<string, any>
  ): Promise<void> {
    const updates: Record<string, any> = { status, ...extra };
    if (status === 'CALLED') updates.calledAt = firestore.FieldValue.serverTimestamp();
    if (status === 'SERVING') updates.servedAt = firestore.FieldValue.serverTimestamp();
    if (status === 'COMPLETED') updates.completedAt = firestore.FieldValue.serverTimestamp();
    await this.col.doc(id).update(updates);
  }

  // Get or increment daily counter for a service
  async getNextNumber(serviceId: string, date: string): Promise<number> {
    const counterId = `${serviceId}_${date}`;
    const counterRef = this.counterCol.doc(counterId);
    let nextNumber = 1;
    await firestore().runTransaction(async (tx) => {
      const counterDoc = await tx.get(counterRef);
      if (counterDoc.exists) {
        nextNumber = (counterDoc.data()!.lastNumber as number) + 1;
        tx.update(counterRef, { lastNumber: nextNumber });
      } else {
        tx.set(counterRef, { serviceId, date, lastNumber: 1 });
        nextNumber = 1;
      }
    });
    return nextNumber;
  }

  // Listen to all WAITING queues for a service today
  listenByService(
    serviceId: string,
    callback: (queues: QueueModel[]) => void
  ): () => void {
    const today = getTodayString();
    return this.col
      .where('serviceId', '==', serviceId)
      .where('visitDate', '==', today)
      .where('status', 'in', ['WAITING', 'CALLED', 'SERVING'])
      .orderBy('sequenceNumber', 'asc')
      .onSnapshot((snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as QueueModel)
        );
        callback(items);
      });
  }

  // Listen to a single queue document (for patient)
  listenById(id: string, callback: (queue: QueueModel | null) => void): () => void {
    return this.col.doc(id).onSnapshot((doc) => {
      if (!doc.exists) {
        callback(null);
        return;
      }
      callback({ id: doc.id, ...fromFirestore(doc.data()) } as unknown as QueueModel);
    });
  }

  // Get next WAITING queue for a service
  async getNextWaiting(serviceId: string): Promise<QueueModel | null> {
    const today = getTodayString();
    const snap = await this.col
      .where('serviceId', '==', serviceId)
      .where('visitDate', '==', today)
      .where('status', '==', 'WAITING')
      .orderBy('sequenceNumber', 'asc')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...fromFirestore(doc.data()) } as unknown as QueueModel;
  }

  // Listen all today's queues for a service including completed (for history)
  listenAllByServiceToday(
    serviceId: string,
    callback: (queues: QueueModel[]) => void
  ): () => void {
    const today = getTodayString();
    return this.col
      .where('serviceId', '==', serviceId)
      .where('visitDate', '==', today)
      .orderBy('sequenceNumber', 'asc')
      .onSnapshot((snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as QueueModel)
        );
        callback(items);
      });
  }
}

export const queueRepository = new QueueRepository();
