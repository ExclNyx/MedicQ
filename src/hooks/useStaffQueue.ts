import { useEffect } from 'react';
import { useQueueStore } from '@/hooks/useQueueStore';
import { registrationRepository } from '@/services/registration.repository';
import { queueRepository } from '@/services/queue.repository';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, Collections, fromFirestore } from '@/services/firebase';
import { ServiceModel } from '@/types';

export const useStaffQueue = (selectedServiceId: string) => {
  const {
    staffServiceQueues,
    pendingRegistrations,
    verifiedRegistrations,
    services,
    setStaffServiceQueues,
    setPendingRegistrations,
    setVerifiedRegistrations,
    setServices,
  } = useQueueStore();

  useEffect(() => {
    // Listen to pending registrations
    const pendingUnsub = registrationRepository.listenPending(
      (regs) => setPendingRegistrations(regs),
      (error) => {
        setPendingRegistrations([]);
        console.warn('[MedicQ] Pendaftaran pending tidak tersedia:', error.message);
      },
    );

    // Listen to verified registrations
    const verifiedUnsub = registrationRepository.listenVerified(
      (regs) => setVerifiedRegistrations(regs),
      (error) => {
        setVerifiedRegistrations([]);
        console.warn('[MedicQ] Pendaftaran terverifikasi tidak tersedia:', error.message);
      },
    );

    // Listen to services
    const q = query(
      collection(db, Collections.SERVICES),
      where('isActive', '==', true)
    );
    const servicesUnsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as ServiceModel)
      );
      setServices(items);
    }, (error) => {
      setServices([]);
      console.warn('[MedicQ] Daftar poli tidak tersedia:', error.message);
    });

    return () => {
      pendingUnsub();
      verifiedUnsub();
      servicesUnsub();
    };
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    const unsub = queueRepository.listenAllByServiceToday(
      selectedServiceId,
      (queues) => setStaffServiceQueues(queues),
      (error) => {
        setStaffServiceQueues([]);
        console.warn('[MedicQ] Antrean poli tidak tersedia:', error.message);
      },
    );
    return () => unsub();
  }, [selectedServiceId]);

  const currentServing = staffServiceQueues.find(
    (q) => q.status === 'CALLED' || q.status === 'SERVING'
  );

  const waitingQueues = staffServiceQueues.filter((q) => q.status === 'WAITING');
  const completedQueues = staffServiceQueues.filter(
    (q) => q.status === 'COMPLETED' || q.status === 'SKIPPED'
  );

  return {
    staffServiceQueues,
    pendingRegistrations,
    verifiedRegistrations,
    services,
    currentServing,
    waitingQueues,
    completedQueues,
  };
};
