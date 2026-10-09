import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Collections, db, getTodayString } from '../core/config/firebase';
import { getServiceById, getServiceCode } from '../core/constants/services';
import { QueueModel } from '../core/models';
import { queueRepository } from '../repositories/queue.repository';
import { registrationRepository } from '../repositories/registration.repository';

export interface AssignQueueInput {
  registrationId: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
}

export class QueueService {
  async assignQueue(input: AssignQueueInput): Promise<QueueModel> {
    const today = getTodayString();
    const code = getServiceCode(input.serviceId);
    const sequenceNumber = await queueRepository.getNextNumber(input.serviceId, today);
    const queueNumber = `${code}-${String(sequenceNumber).padStart(3, '0')}`;

    const queueId = await queueRepository.create({
      queueNumber,
      patientId: input.patientId,
      patientName: input.patientName,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      registrationId: input.registrationId,
      visitDate: today,
      status: 'WAITING',
      sequenceNumber,
      queueOrder: sequenceNumber,
      skipCount: 0,
      callCount: 0,
      calledAt: null,
      servedAt: null,
      completedAt: null,
      lastSkippedAt: null,
    });

    await registrationRepository.updateStatus(input.registrationId, 'QUEUED', {
      queueId,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
    });

    return (await queueRepository.getById(queueId))!;
  }

  /**
   * Memanggil antrean berikutnya.
   * Tidak perlu klik "mulai melayani" lagi.
   * Nomor aktif sebelumnya otomatis COMPLETED ketika nomor baru dipanggil.
   */
  async callQueue(queueId: string, serviceId: string): Promise<QueueModel> {
    const target = await queueRepository.getById(queueId);
    if (!target) throw new Error('Antrean tidak ditemukan.');
    if (target.serviceId !== serviceId) throw new Error('Antrean tidak sesuai dengan poli yang dipilih.');
    if (target.status !== 'WAITING' && target.status !== 'CALLED' && target.status !== 'SERVING') {
      throw new Error('Antrean ini sudah selesai atau tidak aktif.');
    }

    const today = getTodayString();
    // Presentation dataset is small: use the basic serviceId index and filter
    // in memory, avoiding composite-index failures during demo setup.
    const currentQuery = query(
      collection(db, Collections.QUEUES),
      where('serviceId', '==', serviceId),
    );
    const currentSnap = await getDocs(currentQuery);
    const currentlyServingDocs = currentSnap.docs.filter((item) => {
      const data = item.data();
      return data.visitDate === today && (data.status === 'CALLED' || data.status === 'SERVING');
    });

    const batch = writeBatch(db);
    const targetRef = doc(db, Collections.QUEUES, queueId);

    for (const currentDoc of currentlyServingDocs) {
      if (currentDoc.id === queueId) continue;
      batch.update(currentDoc.ref, {
        status: 'COMPLETED',
        completedAt: serverTimestamp(),
      });
    }

    batch.update(targetRef, {
      status: 'CALLED',
      calledAt: serverTimestamp(),
      callCount: (target.callCount ?? 0) + 1,
    });

    const serviceRef = doc(db, Collections.SERVICES, serviceId);
    const serviceConfig = getServiceById(serviceId);
    batch.set(
      serviceRef,
      {
        id: serviceId,
        name: serviceConfig?.name ?? target.serviceName,
        code: serviceConfig?.code ?? getServiceCode(serviceId),
        isActive: true,
        currentServing: target.queueNumber,
        currentServingQueueId: queueId,
      },
      { merge: true },
    );

    await batch.commit();

    for (const currentDoc of currentlyServingDocs) {
      if (currentDoc.id === queueId) continue;
      const currentRegistrationId = currentDoc.data().registrationId as string | undefined;
      if (currentRegistrationId) {
        await registrationRepository.updateStatus(currentRegistrationId, 'COMPLETED');
      }
    }

    return (await queueRepository.getById(queueId))!;
  }

  async callNext(serviceId: string): Promise<QueueModel | null> {
    const next = await queueRepository.getNextWaiting(serviceId);
    if (!next) return null;
    return this.callQueue(next.id, serviceId);
  }

  /**
   * No-show tidak mengambil nomor baru.
   * Nomor yang sedang dipanggil dikembalikan ke status WAITING dan ditempatkan
   * di belakang semua pasien yang masih menunggu.
   */
  async skipQueue(queueId: string): Promise<QueueModel> {
    const queue = await queueRepository.getById(queueId);
    if (!queue) throw new Error('Antrean tidak ditemukan.');
    if (queue.status !== 'CALLED' && queue.status !== 'SERVING') {
      throw new Error('Hanya nomor yang sedang dipanggil yang bisa dilewati.');
    }

    const activeQueues = await queueRepository.listActiveByServiceToday(queue.serviceId);
    const maxQueueOrder = activeQueues.reduce(
      (max, item) => Math.max(max, item.queueOrder ?? item.sequenceNumber),
      0,
    );

    const queueRef = doc(db, Collections.QUEUES, queueId);
    const serviceRef = doc(db, Collections.SERVICES, queue.serviceId);

    const nextOrder = Math.max(maxQueueOrder + 1, (queue.queueOrder ?? queue.sequenceNumber) + 1);
    const nextSkipCount = (queue.skipCount ?? 0) + 1;

    const batch = writeBatch(db);
    batch.update(queueRef, {
      status: 'WAITING',
      queueOrder: nextOrder,
      skipCount: nextSkipCount,
      lastSkippedAt: serverTimestamp(),
    });
    batch.set(
      serviceRef,
      {
        currentServing: null,
        currentServingQueueId: null,
      },
      { merge: true },
    );
    await batch.commit();

    return (await queueRepository.getById(queueId))!;
  }

  async recallQueue(queueId: string, serviceId: string): Promise<void> {
    const queue = await queueRepository.getById(queueId);
    if (!queue) throw new Error('Antrean tidak ditemukan.');
    if (queue.serviceId !== serviceId) throw new Error('Antrean tidak sesuai dengan poli.');
    if (queue.status !== 'CALLED' && queue.status !== 'SERVING') {
      throw new Error('Hanya pasien yang sedang dipanggil yang dapat dipanggil ulang.');
    }

    await queueRepository.updateStatus(queueId, 'CALLED', {
      calledAt: serverTimestamp(),
      callCount: (queue.callCount ?? 0) + 1,
    });
    await this.updateServiceCurrentServing(serviceId, queue.queueNumber, queueId);
  }

  private async updateServiceCurrentServing(
    serviceId: string,
    queueNumber: string | null,
    queueId: string | null,
  ): Promise<void> {
    const serviceRef = doc(db, Collections.SERVICES, serviceId);
    const serviceConfig = getServiceById(serviceId);

    await setDoc(
      serviceRef,
      {
        id: serviceId,
        name: serviceConfig?.name ?? serviceId,
        code: serviceConfig?.code ?? getServiceCode(serviceId),
        isActive: true,
        currentServing: queueNumber,
        currentServingQueueId: queueId,
      },
      { merge: true },
    );
  }

  async serveQueue(queueId: string, serviceId: string): Promise<void> {
    // Dipertahankan untuk kompatibilitas kode lama.
    // Workflow baru tidak membutuhkan tombol "mulai dilayani" terpisah.
    const queue = await queueRepository.getById(queueId);
    if (!queue) throw new Error('Antrean tidak ditemukan.');
    await queueRepository.updateStatus(queueId, 'CALLED', {
      calledAt: serverTimestamp(),
      callCount: (queue.callCount ?? 0) + 1,
    });
    await this.updateServiceCurrentServing(serviceId, queue.queueNumber, queueId);
  }

  async completeQueue(queueId: string, serviceId: string): Promise<void> {
    const queue = await queueRepository.getById(queueId);
    if (!queue) throw new Error('Antrean tidak ditemukan.');

    await queueRepository.updateStatus(queueId, 'COMPLETED');
    await this.updateServiceCurrentServing(serviceId, null, null);
    await registrationRepository.updateStatus(queue.registrationId, 'COMPLETED');
  }

  calculatePosition(queues: QueueModel[], myQueueId: string, mySequenceNumber: number): number {
    const mine = queues.find((q) => q.id === myQueueId);
    if (!mine) return 0;

    const mineOrder = mine.queueOrder ?? mySequenceNumber;
    return queues.filter((q) => {
      const order = q.queueOrder ?? q.sequenceNumber;
      return q.id !== myQueueId && order < mineOrder &&
        (q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'SERVING');
    }).length;
  }
}

export const queueService = new QueueService();
