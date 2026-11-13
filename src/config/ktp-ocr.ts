/**
 * Konfigurasi OCR KTP (cloud API pihak ketiga).
 *
 * TODO (tim backend): sebaiknya pemanggilan OCR dipindah ke proxy /
 * Cloud Function agar API key tidak bocor di client. Frontend cukup
 * mengisi KTP_OCR_ENDPOINT dengan URL proxy tersebut.
 */

/** URL API OCR KTP. Kosongkan (null) untuk memakai mode mock/demo. */
export const KTP_OCR_ENDPOINT: string | null = null;

/** API key untuk endpoint OCR. Kosongkan (null) untuk memakai mode mock/demo. */
export const KTP_OCR_API_KEY: string | null = null;

/** Header tambahan yang dikirim ke endpoint (mis. untuk provider RapidAPI). */
export const KTP_OCR_EXTRA_HEADERS: Record<string, string> = {};

/** True bila endpoint/key belum diisi → service memakai data mock. */
export function isMockKtpOcr(): boolean {
  return !KTP_OCR_ENDPOINT || !KTP_OCR_API_KEY;
}
