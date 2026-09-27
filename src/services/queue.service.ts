import firestore from '@react-native-firebase/firestore';
import { queueRepository } from '../repositories/queue.repository';
import { registrationRepository } from '../repositories/registration.repository';
import { Collections, getTodayString } from '../core/config/firebase';
import { QueueModel } from '../core/models';
import { getServiceCode } from '../core/constants/services';

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
      calledAt: null,
      servedAt: null,
      completedAt: null,
    });

    // Update registration with queueId and serviceId
    await registrationRepository.updateStatus(input.registrationId, 'QUEUED', {
      queueId,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
    });

    return (await queueRepository.getById(queueId))!;
  }

  async callNext(serviceId: string): Promise<QueueModel | null> {
    // Complete current CALLED/SERVING if any
    const today = getTodayString();
    const currentSnap = await firestore()
      .collection(Collections.QUEUES)
      .where('serviceId', '==', serviceId)
      .where('visitDate', '==', today)
      .where('status', 'in', ['CALLED', 'SERVING'])
      .get();

    for (const doc of currentSnap.docs) {
      // Mark previously called as SERVING now (we move to next on explicit "selesai")
    }

    const next = await queueRepository.getNextWaiting(serviceId);
    if (!next) return null;

    await queueRepository.updateStatus(next.id, 'CALLED');
    await this.updateServiceCurrentServing(serviceId, next.queueNumber, next.id);
    return next;
  }

  async serveQueue(queueId: string, serviceId: string): Promise<void> {
    const queue = await queueRepository.getById(queueId);
    if (!queue) return;
    await queueRepository.updateStatus(queueId, 'SERVING');
    await this.updateServiceCurrentServing(serviceId, queue.queueNumber, queueId);
  }

  async completeQueue(queueId: string, serviceId: string): Promise<void> {
    await queueRepository.updateStatus(queueId, 'COMPLETED');
    await this.updateServiceCurrentServing(serviceId, null, null);
    // Update registration too
    const queue = await queueRepository.getById(queueId);
    if (queue) {
      await registrationRepository.updateStatus(queue.registrationId, 'COMPLETED');
    }
  }

  async skipQueue(queueId: string): Promise<void> {
    await queueRepository.updateStatus(queueId, 'SKIPPED');
  }

  async recallQueue(queueId: string, serviceId: string): Promise<void> {
    const queue = await queueRepository.getById(queueId);
    if (!queue) return;
    await queueRepository.updateStatus(queueId, 'CALLED', {
      calledAt: firestore.FieldValue.serverTimestamp(),
    });
    await this.updateServiceCurrentServing(serviceId, queue.queueNumber, queueId);
  }

  private async updateServiceCurrentServing(
    serviceId: string,
    queueNumber: string | null,
    queueId: string | null
  ): Promise<void> {
    await firestore().collection(Collections.SERVICES).doc(serviceId).update({
      currentServing: queueNumber,
      currentServingQueueId: queueId,
    });
  }

  // Calculate how many queues are ahead of the given sequence number
  calculatePosition(queues: QueueModel[], mySequenceNumber: number): number {
    return queues.filter(
      (q) =>
        q.sequenceNumber < mySequenceNumber &&
        (q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'SERVING')
    ).length;
  }
}

export const queueService = new QueueService();
