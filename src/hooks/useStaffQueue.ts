import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { Alert } from "react-native";

import { useQueueStore } from "@/hooks/useQueueStore";
import { Collections, db, fromFirestore } from "@/services/firebase";
import { queueRepository } from "@/services/queue.repository";
import { registrationRepository } from "@/services/registration.repository";
import { ServiceModel } from "@/types";

function friendlyListenerError(error: Error): string {
  const rawCode = (error as Error & { code?: string }).code ?? "";
  const code = rawCode.split("/").pop();

  switch (code) {
    case "permission-denied":
      return "Akses Firestore ditolak (Firebase permission-denied). Periksa role petugas dan Firestore Rules.";
    case "unauthenticated":
      return "Sesi pengguna tidak valid. Silakan login kembali.";
    case "unavailable":
      return "Firebase sedang tidak tersedia atau koneksi terputus. Periksa internet.";
    case "deadline-exceeded":
      return "Waktu permintaan ke Firebase habis (timeout).";
    case "failed-precondition":
      return "Operasi belum dapat dilakukan. Periksa konfigurasi atau indeks Firestore.";
    case "not-found":
      return "Data yang diminta tidak ditemukan di Firestore.";
    case "resource-exhausted":
      return "Batas pemakaian atau kuota Firebase tercapai. Coba lagi nanti.";
    default:
      return (
        error.message ||
        "Tidak dapat memuat data. Periksa koneksi dan Firebase."
      );
  }
}

function showListenerError(scope: string, error: Error) {
  console.warn(`[MedicQ] ${scope}:`, error);
  Alert.alert(`${scope} gagal dimuat`, friendlyListenerError(error));
}

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
    const pendingUnsub = registrationRepository.listenPending(
      (registrations) => setPendingRegistrations(registrations),
      (error) => {
        setPendingRegistrations([]);
        showListenerError("Pendaftaran pending", error);
      },
    );

    const verifiedUnsub = registrationRepository.listenVerified(
      (registrations) => setVerifiedRegistrations(registrations),
      (error) => {
        setVerifiedRegistrations([]);
        showListenerError("Pendaftaran terverifikasi", error);
      },
    );

    const servicesQuery = query(
      collection(db, Collections.SERVICES),
      where("isActive", "==", true),
    );

    const servicesUnsub = onSnapshot(
      servicesQuery,
      (snapshot) => {
        const items = snapshot.docs.map(
          (document) =>
            ({
              id: document.id,
              ...fromFirestore(document.data()),
            }) as unknown as ServiceModel,
        );
        setServices(items);
      },
      (error) => {
        setServices([]);
        showListenerError("Daftar poli", error);
      },
    );

    return () => {
      pendingUnsub();
      verifiedUnsub();
      servicesUnsub();
    };
  }, [setPendingRegistrations, setVerifiedRegistrations, setServices]);

  useEffect(() => {
    if (!selectedServiceId) {
      setStaffServiceQueues([]);
      return;
    }

    const unsubscribe = queueRepository.listenAllByServiceToday(
      selectedServiceId,
      (queues) => setStaffServiceQueues(queues),
      (error) => {
        setStaffServiceQueues([]);
        showListenerError("Antrean poli", error);
      },
    );

    return () => unsubscribe();
  }, [selectedServiceId, setStaffServiceQueues]);

  const currentServing = staffServiceQueues.find(
    (queue) => queue.status === "CALLED" || queue.status === "SERVING",
  );

  const waitingQueues = staffServiceQueues.filter(
    (queue) => queue.status === "WAITING",
  );

  const completedQueues = staffServiceQueues.filter(
    (queue) => queue.status === "COMPLETED" || queue.status === "SKIPPED",
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
