import { create } from 'zustand';
import { QueueModel, RegistrationModel, ServiceModel } from '../core/models';

interface QueueState {
  // Patient state
  myRegistration: RegistrationModel | null;
  myQueue: QueueModel | null;
  serviceQueues: QueueModel[]; // all queues for my service

  // Staff state
  selectedServiceId: string;
  staffServiceQueues: QueueModel[];
  pendingRegistrations: RegistrationModel[];
  verifiedRegistrations: RegistrationModel[];
  services: ServiceModel[];

  // Display state
  displayServiceId: string;
  displayQueues: QueueModel[];
  displayService: ServiceModel | null;

  // Notification tracking (anti-duplicate)
  lastVibratedQueuePosition: number | null;
  lastNotifiedEvent: string | null; // e.g. "called_A-027"

  setMyRegistration: (reg: RegistrationModel | null) => void;
  setMyQueue: (queue: QueueModel | null) => void;
  setServiceQueues: (queues: QueueModel[]) => void;
  setSelectedServiceId: (id: string) => void;
  setStaffServiceQueues: (queues: QueueModel[]) => void;
  setPendingRegistrations: (regs: RegistrationModel[]) => void;
  setVerifiedRegistrations: (regs: RegistrationModel[]) => void;
  setServices: (services: ServiceModel[]) => void;
  setDisplayQueues: (queues: QueueModel[]) => void;
  setDisplayServiceId: (id: string) => void;
  setDisplayService: (service: ServiceModel | null) => void;
  setLastVibratedQueuePosition: (pos: number | null) => void;
  setLastNotifiedEvent: (event: string | null) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  myRegistration: null,
  myQueue: null,
  serviceQueues: [],
  selectedServiceId: 'poli_umum',
  staffServiceQueues: [],
  pendingRegistrations: [],
  verifiedRegistrations: [],
  services: [],
  displayServiceId: 'poli_umum',
  displayQueues: [],
  displayService: null,
  lastVibratedQueuePosition: null,
  lastNotifiedEvent: null,

  setMyRegistration: (myRegistration) => set({ myRegistration }),
  setMyQueue: (myQueue) => set({ myQueue }),
  setServiceQueues: (serviceQueues) => set({ serviceQueues }),
  setSelectedServiceId: (selectedServiceId) => set({ selectedServiceId }),
  setStaffServiceQueues: (staffServiceQueues) => set({ staffServiceQueues }),
  setPendingRegistrations: (pendingRegistrations) => set({ pendingRegistrations }),
  setVerifiedRegistrations: (verifiedRegistrations) => set({ verifiedRegistrations }),
  setServices: (services) => set({ services }),
  setDisplayQueues: (displayQueues) => set({ displayQueues }),
  setDisplayServiceId: (displayServiceId) => set({ displayServiceId }),
  setDisplayService: (displayService) => set({ displayService }),
  setLastVibratedQueuePosition: (lastVibratedQueuePosition) => set({ lastVibratedQueuePosition }),
  setLastNotifiedEvent: (lastNotifiedEvent) => set({ lastNotifiedEvent }),
}));
