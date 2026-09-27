import { useEffect } from 'react';
import { useQueueStore } from '../stores/queue.store';
import { registrationRepository } from '../repositories/registration.repository';
import { queueRepository } from '../repositories/queue.repository';
import firestore from '@react-native-firebase/firestore';
import { Collections, fromFirestore } from '../core/config/firebase';
import { ServiceModel } from '../core/models';

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
    const pendingUnsub = registrationRepository.listenPending((regs) => {
      setPendingRegistrations(regs);
    });

    // Listen to verified registrations
    const verifiedUnsub = registrationRepository.listenVerified((regs) => {
      setVerifiedRegistrations(regs);
    });

    // Listen to services
    const servicesUnsub = firestore()
      .collection(Collections.SERVICES)
      .where('isActive', '==', true)
      .onSnapshot((snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...fromFirestore(d.data()) } as unknown as ServiceModel)
        );
        setServices(items);
      });

    return () => {
      pendingUnsub();
      verifiedUnsub();
      servicesUnsub();
    };
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    const unsub = queueRepository.listenAllByServiceToday(selectedServiceId, (queues) => {
      setStaffServiceQueues(queues);
    });
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
