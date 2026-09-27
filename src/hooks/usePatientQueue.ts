import { useEffect, useRef } from 'react';
import { useQueueStore } from '../stores/queue.store';
import { registrationRepository } from '../repositories/registration.repository';
import { queueRepository } from '../repositories/queue.repository';
import { queueService } from '../services/queue.service';
import { notificationService } from '../services/notification.service';

export const usePatientQueue = (patientId: string | undefined) => {
  const {
    myRegistration,
    myQueue,
    serviceQueues,
    lastVibratedQueuePosition,
    lastNotifiedEvent,
    setMyRegistration,
    setMyQueue,
    setServiceQueues,
    setLastVibratedQueuePosition,
    setLastNotifiedEvent,
  } = useQueueStore();

  const queueUnsubRef = useRef<(() => void) | null>(null);
  const serviceUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!patientId) return;

    // Listen to patient's today registration
    const regUnsub = registrationRepository.listenPatientToday(patientId, (reg) => {
      setMyRegistration(reg);

      // If reg has a queueId, listen to the queue
      if (reg?.queueId) {
        // Unsubscribe old queue listener if any
        if (queueUnsubRef.current) {
          queueUnsubRef.current();
        }

        queueUnsubRef.current = queueRepository.listenById(reg.queueId, (queue) => {
          setMyQueue(queue);
        });

        // Listen to all queues in same service
        if (reg.serviceId) {
          if (serviceUnsubRef.current) serviceUnsubRef.current();
          serviceUnsubRef.current = queueRepository.listenByService(
            reg.serviceId,
            (queues) => {
              setServiceQueues(queues);
            }
          );
        }
      } else {
        setMyQueue(null);
        setServiceQueues([]);
      }
    });

    return () => {
      regUnsub();
      if (queueUnsubRef.current) queueUnsubRef.current();
      if (serviceUnsubRef.current) serviceUnsubRef.current();
    };
  }, [patientId]);

  // Effect to handle notifications and vibrations
  useEffect(() => {
    if (!myQueue || serviceQueues.length === 0) return;

    const position = queueService.calculatePosition(serviceQueues, myQueue.sequenceNumber);

    // Handle CALLED status
    if (myQueue.status === 'CALLED') {
      const eventKey = `called_${myQueue.queueNumber}`;
      if (lastNotifiedEvent !== eventKey) {
        setLastNotifiedEvent(eventKey);
        notificationService.vibrate('called');
        notificationService.showLocalNotification(
          'Nomor Anda Dipanggil! 🔔',
          `Nomor ${myQueue.queueNumber} dipanggil. Silakan menuju ${myQueue.serviceName}.`
        );
      }
      return;
    }

    if (myQueue.status !== 'WAITING') return;

    // Vibration based on position
    if (position === 0 && lastVibratedQueuePosition !== 0) {
      setLastVibratedQueuePosition(0);
      notificationService.vibrate('urgent');
    } else if (position <= 2 && position > 0 && lastVibratedQueuePosition !== position) {
      setLastVibratedQueuePosition(position);
      notificationService.vibrate('warning');
    }
  }, [myQueue?.status, serviceQueues]);

  const position =
    myQueue && serviceQueues.length > 0
      ? queueService.calculatePosition(serviceQueues, myQueue.sequenceNumber)
      : null;

  const currentServing = serviceQueues.find(
    (q) => q.status === 'CALLED' || q.status === 'SERVING'
  );

  return { myRegistration, myQueue, serviceQueues, position, currentServing };
};
