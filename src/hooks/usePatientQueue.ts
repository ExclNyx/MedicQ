import { useEffect, useRef, useState } from 'react';
import { queueRepository } from '../repositories/queue.repository';
import { registrationRepository } from '../repositories/registration.repository';
import { queueService } from '../services/queue.service';
import { useQueueStore } from '../stores/queue.store';

function friendlyListenerError(error: Error): string {
  const code = (error as Error & { code?: string }).code;
  if (code === 'failed-precondition') {
    return 'Data belum dapat dimuat karena indeks Firestore belum siap. Pastikan index registrations dan queues berstatus Enabled.';
  }
  if (code === 'permission-denied') {
    return 'Akses Firestore ditolak. Periksa role pengguna di users/{uid} dan Firestore Rules.';
  }
  return 'Tidak dapat memuat antrean. Periksa koneksi internet dan konfigurasi Firestore.';
}

export const usePatientQueue = (patientId: string | undefined) => {
  const {
    myRegistration,
    myQueue,
    serviceQueues,
    setMyRegistration,
    setMyQueue,
    setServiceQueues,
  } = useQueueStore();

  const queueUnsubRef = useRef<(() => void) | null>(null);
  const serviceUnsubRef = useRef<(() => void) | null>(null);
  const activeQueueIdRef = useRef<string | null>(null);
  const activeServiceIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const cleanupQueueListeners = () => {
      queueUnsubRef.current?.();
      serviceUnsubRef.current?.();
      queueUnsubRef.current = null;
      serviceUnsubRef.current = null;
      activeQueueIdRef.current = null;
      activeServiceIdRef.current = null;
    };

    if (!patientId) {
      setIsLoading(false);
      setError(null);
      setMyRegistration(null);
      setMyQueue(null);
      setServiceQueues([]);
      cleanupQueueListeners();
      return () => {
        active = false;
        cleanupQueueListeners();
      };
    }

    setIsLoading(true);
    setError(null);

    const registrationUnsub = registrationRepository.listenPatientToday(
      patientId,
      (registration) => {
        if (!active) return;

        setMyRegistration(registration);

        const nextQueueId = registration?.queueId ?? null;
        const nextServiceId = registration?.serviceId ?? null;

        // Registration snapshots may fire for unrelated field updates.
        // Keep existing queue subscriptions while the IDs have not changed;
        // otherwise clearing myQueue here briefly blanks/flashes the screen.
        if (
          nextQueueId &&
          nextQueueId === activeQueueIdRef.current &&
          nextServiceId === activeServiceIdRef.current
        ) {
          return;
        }

        cleanupQueueListeners();
        setMyQueue(null);
        setServiceQueues([]);

        if (!nextQueueId) {
          setIsLoading(false);
          return;
        }

        activeQueueIdRef.current = nextQueueId;
        activeServiceIdRef.current = nextServiceId;
        setIsLoading(true);
        queueUnsubRef.current = queueRepository.listenById(
          nextQueueId,
          (queue) => {
            if (!active) return;
            setMyQueue(queue);
            setIsLoading(false);
            if (!queue) {
              setError('Nomor antrean belum ditemukan. Minta petugas memeriksa pendaftaran.');
            } else {
              setError(null);
            }
          },
          (listenerError) => {
            if (!active) return;
            setIsLoading(false);
            setError(friendlyListenerError(listenerError));
          },
        );

        if (nextServiceId) {
          serviceUnsubRef.current = queueRepository.listenByService(
            nextServiceId,
            (queues) => {
              if (active) setServiceQueues(queues);
            },
            (listenerError) => {
              if (!active) return;
              setServiceQueues([]);
              setError(friendlyListenerError(listenerError));
            },
          );
        }
      },
      (listenerError) => {
        if (!active) return;
        cleanupQueueListeners();
        setMyRegistration(null);
        setMyQueue(null);
        setServiceQueues([]);
        setIsLoading(false);
        setError(friendlyListenerError(listenerError));
      },
    );

    return () => {
      active = false;
      registrationUnsub();
      cleanupQueueListeners();
    };
  }, [patientId, setMyQueue, setMyRegistration, setServiceQueues]);

  const position =
    myQueue && myQueue.status !== 'COMPLETED' && serviceQueues.length > 0
      ? queueService.calculatePosition(serviceQueues, myQueue.id, myQueue.sequenceNumber)
      : null;

  const currentServing = serviceQueues.find(
    (queue) => queue.status === 'CALLED' || queue.status === 'SERVING',
  ) ?? null;

  const aheadQueues = myQueue
    ? serviceQueues
        .filter((queue) => {
          const mineOrder = myQueue.queueOrder ?? myQueue.sequenceNumber;
          const order = queue.queueOrder ?? queue.sequenceNumber;
          return queue.id !== myQueue.id && order < mineOrder &&
            (queue.status === 'WAITING' || queue.status === 'CALLED' || queue.status === 'SERVING');
        })
        .slice(0, 3)
    : [];

  return {
    myRegistration,
    myQueue,
    serviceQueues,
    position,
    currentServing,
    aheadQueues,
    isLoading,
    error,
  };
};
