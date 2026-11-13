export const KTP_OCR_ENDPOINT = (
  process.env.EXPO_PUBLIC_KTP_OCR_ENDPOINT ?? ""
).trim();

export const KTP_OCR_API_KEY = (
  process.env.EXPO_PUBLIC_KTP_OCR_API_KEY ?? ""
).trim();

export const KTP_OCR_EXTRA_HEADERS: Record<string, string> = {};

export const isMockKtpOcr = () =>
  (process.env.EXPO_PUBLIC_KTP_OCR_MOCK ?? "false").trim().toLowerCase() ===
  "true";
