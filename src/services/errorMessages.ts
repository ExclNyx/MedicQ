type ErrorDetails = {
  code?: string;
  message?: string;
  name?: string;
};

function getErrorDetails(error: unknown): ErrorDetails {
  if (typeof error !== "object" || error === null) {
    return {};
  }

  const value = error as ErrorDetails;
  return value;
}

export function getHttpStatusMessage(
  status: number,
  serviceName = "API",
): string {
  switch (status) {
    case 400:
      return `${serviceName}: permintaan tidak valid (HTTP 400).`;

    case 401:
      return `${serviceName}: autentikasi gagal (HTTP 401).`;

    case 403:
      return `${serviceName}: akses ditolak (HTTP 403 Forbidden).`;

    case 404:
      return `${serviceName}: endpoint atau data tidak ditemukan (HTTP 404).`;

    case 408:
      return `${serviceName}: waktu permintaan habis (HTTP 408).`;

    case 429:
      return `${serviceName}: terlalu banyak permintaan (HTTP 429). Coba lagi nanti.`;

    case 500:
      return `${serviceName}: terjadi kesalahan pada server (HTTP 500).`;

    case 502:
    case 503:
    case 504:
      return `${serviceName}: server tidak tersedia (HTTP ${status}). Coba lagi nanti.`;

    default:
      if (status >= 400 && status < 500) {
        return `${serviceName}: kesalahan permintaan (HTTP ${status}).`;
      }

      if (status >= 500) {
        return `${serviceName}: kesalahan server (HTTP ${status}).`;
      }

      return `${serviceName}: permintaan gagal (HTTP ${status}).`;
  }
}

export function getFirebaseErrorMessage(error: unknown): string {
  const details = getErrorDetails(error);

  // Firebase SDK dapat menggunakan kode seperti
  // firestore/permission-denied atau permission-denied.
  const code = details.code?.split("/").pop() ?? "";

  switch (code) {
    case "permission-denied":
      return "Akses Firestore ditolak. Periksa hak akses dan Firestore Rules.";

    case "unauthenticated":
      return "Sesi tidak valid. Silakan login kembali.";

    case "unavailable":
      return "Firebase tidak tersedia atau koneksi terputus. Periksa internet dan coba lagi.";

    case "deadline-exceeded":
      return "Waktu permintaan ke Firebase habis. Coba lagi.";

    case "failed-precondition":
      return "Operasi belum dapat dilakukan. Periksa konfigurasi atau indeks Firestore.";

    case "not-found":
      return "Data yang diminta tidak ditemukan di Firebase.";

    case "resource-exhausted":
      return "Batas pemakaian atau kuota Firebase tercapai. Coba lagi nanti.";

    case "network-request-failed":
      return "Koneksi gagal. Periksa jaringan internet lalu coba lagi.";

    case "too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";

    default:
      return details.message || "Terjadi kesalahan. Silakan coba lagi.";
  }
}

export function getRequestErrorMessage(
  error: unknown,
  serviceName = "Layanan",
): string {
  const details = getErrorDetails(error);

  if (details.name === "AbortError") {
    return `${serviceName}: permintaan timeout. Coba lagi.`;
  }

  const message = details.message ?? "";

  if (/network request failed|failed to fetch|networkerror/i.test(message)) {
    return `${serviceName}: tidak dapat terhubung. Periksa koneksi internet.`;
  }

  return message || `${serviceName}: permintaan gagal. Coba lagi.`;
}
