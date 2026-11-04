import {
  KTP_OCR_API_KEY,
  KTP_OCR_ENDPOINT,
  KTP_OCR_EXTRA_HEADERS,
  isMockKtpOcr,
} from "@/services/ktp-ocr-config";
import type { Gender } from "@/types";

export interface KtpScanResult {
  nik: string;
  fullName: string;
  dob: string;
  gender: Gender | null;
  address: string;
  raw?: Record<string, string>;
}

type OcrSpaceResponse = {
  IsErroredOnProcessing?: boolean | string;
  OCRExitCode?: number;
  ErrorMessage?: string | string[];
  ErrorDetails?: string | string[];
  ParsedResults?: Array<{
    ParsedText?: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }>;
};

function getErrorText(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join(" ");
  }

  return "";
}

function httpStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Permintaan OCR tidak valid (HTTP 400).";
    case 401:
      return "Autentikasi OCR gagal (HTTP 401). Periksa API key.";
    case 403:
      return "Akses OCR ditolak (HTTP 403). Periksa API key dan izin layanan.";
    case 404:
      return "Endpoint OCR tidak ditemukan (HTTP 404).";
    case 408:
      return "Permintaan OCR timeout (HTTP 408).";
    case 429:
      return "Batas permintaan OCR tercapai (HTTP 429). Coba lagi nanti.";
    case 500:
      return "Server OCR mengalami kesalahan (HTTP 500).";
    case 502:
    case 503:
    case 504:
      return `Server OCR sedang tidak tersedia (HTTP ${status}).`;
    default:
      return `Permintaan OCR gagal (HTTP ${status}).`;
  }
}

function requestErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") {
    return "Permintaan OCR timeout setelah 15 detik. Coba lagi.";
  }

  const message = error instanceof Error ? error.message : "";

  if (/network request failed|failed to fetch|networkerror/i.test(message)) {
    return "Tidak dapat terhubung ke layanan OCR. Periksa koneksi internet.";
  }

  return message || "Layanan OCR gagal diakses. Coba lagi.";
}

const MONTHS_ID: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function normalizeDob(raw: string | undefined | null): string {
  if (!raw) return "";

  const text = raw.trim().toLowerCase();

  // Format DD-MM-YYYY atau DD/MM/YYYY.
  const numeric = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text);

  if (numeric) {
    return `${pad(Number(numeric[1]))}-${pad(Number(numeric[2]))}-${numeric[3]}`;
  }

  // Format tanggal dengan nama bulan, misalnya 12 Januari 2000.
  const named = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/.exec(text);

  if (named) {
    const month = MONTHS_ID[named[2]];

    if (month) {
      return `${pad(Number(named[1]))}-${pad(month)}-${named[3]}`;
    }
  }

  // Format YYYY-MM-DD.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);

  if (iso) {
    return `${pad(Number(iso[3]))}-${pad(Number(iso[2]))}-${iso[1]}`;
  }

  // Cari tanggal di dalam teks OCR yang lebih panjang.
  const matchAny = /\b(\d{2})[-/ ](\d{2})[-/ ](\d{4})\b/.exec(text);

  if (matchAny) {
    return `${pad(Number(matchAny[1]))}-${pad(Number(matchAny[2]))}-${matchAny[3]}`;
  }

  return "";
}

export function normalizeGender(raw: string | undefined | null): Gender | null {
  if (!raw) return null;

  const text = raw.trim().toLowerCase();

  if (text.includes("perempuan") || /\bp\b/.test(text)) {
    return "female";
  }

  if (text.includes("laki") || /\bl\b/.test(text)) {
    return "male";
  }

  return null;
}

/**
 * Mengambil data KTP dari teks hasil OCR.
 */
export function extractKtpFromRawText(text: string): KtpScanResult {
  const lines = text
    .split("\n")
    .map((line) => line.trim().toUpperCase())
    .filter(Boolean);

  let nik = "";
  let fullName = "";
  let dob = "";
  let gender: Gender | null = null;
  let address = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // NIK: cari nomor yang terdiri dari 16 digit.
    if (!nik) {
      const digits = line.replace(/\D/g, "");

      if (digits.length === 16) {
        nik = digits;
      } else if (line.includes("NIK")) {
        const afterNik = line.split("NIK")[1]?.replace(/\D/g, "");

        if (afterNik && afterNik.length >= 16) {
          nik = afterNik.substring(0, 16);
        }
      }
    }

    // Nama lengkap.
    if (line.includes("NAMA") && !fullName) {
      fullName =
        line
          .split("NAMA")[1]
          ?.replace(/^[^A-Z]*/, "")
          .trim() ?? "";

      if (!fullName && lines[i + 1]) {
        fullName = lines[i + 1];
      }
    }

    // Tanggal lahir.
    if (line.includes("LAHIR") && !dob) {
      dob = normalizeDob(line);

      if (!dob && lines[i + 1]) {
        dob = normalizeDob(lines[i + 1]);
      }
    }

    // Jenis kelamin.
    if (
      !gender &&
      (line.includes("KELAMIN") ||
        line.includes("LAKI") ||
        line.includes("PEREMPUAN"))
    ) {
      gender = normalizeGender(line);
    }

    // Alamat dan beberapa baris lanjutan.
    if (line.includes("ALAMAT") && !address) {
      address =
        line
          .split("ALAMAT")[1]
          ?.replace(/^[^A-Z0-9]*/, "")
          .trim() ?? "";

      if (!address && lines[i + 1]) {
        address = lines[i + 1];
      }

      if (
        lines[i + 1] &&
        (lines[i + 1].includes("RT") || lines[i + 1].includes("RW"))
      ) {
        address += `, ${lines[i + 1]}`;
      }

      if (
        lines[i + 2] &&
        (lines[i + 2].includes("KEL") || lines[i + 2].includes("DESA"))
      ) {
        address += `, ${lines[i + 2]}`;
      }
    }
  }

  return {
    nik,
    fullName,
    dob,
    gender,
    address,
    raw: { text },
  };
}

function inferMimeType(
  imageUri: string,
  providedMimeType?: string | null,
  blobMimeType?: string,
): string {
  if (providedMimeType?.startsWith("image/")) {
    return providedMimeType;
  }

  if (blobMimeType?.startsWith("image/")) {
    return blobMimeType;
  }

  const cleanUri = imageUri.split(/[?#]/)[0].toLowerCase();

  if (cleanUri.endsWith(".png")) return "image/png";
  if (cleanUri.endsWith(".webp")) return "image/webp";
  if (cleanUri.endsWith(".gif")) return "image/gif";

  // Fallback untuk foto kamera yang umumnya JPEG.
  return "image/jpeg";
}

async function imageToDataUrl(
  imageUri: string,
  mimeType?: string | null,
): Promise<string> {
  const imageResponse = await fetch(imageUri);

  if (!imageResponse.ok) {
    throw new Error("Foto KTP tidak dapat dibaca dari perangkat.");
  }

  const blob = await imageResponse.blob();
  const resolvedMimeType = inferMimeType(imageUri, mimeType, blob.type);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Gagal membaca isi foto KTP."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Gagal mengubah foto KTP menjadi Base64."));
    };

    reader.readAsDataURL(blob);
  });

  const base64Part = dataUrl.split(",")[1];

  if (!base64Part) {
    throw new Error("Format Base64 foto KTP tidak valid.");
  }

  // OCR.space mengharapkan data URI lengkap untuk parameter base64Image.
  return `data:${resolvedMimeType};base64,${base64Part}`;
}

export async function scanKtpFromImage(
  imageUri: string,
  imageMimeType?: string | null,
): Promise<KtpScanResult> {
  if (isMockKtpOcr() || !KTP_OCR_ENDPOINT || !KTP_OCR_API_KEY) {
    throw new Error(
      "OCR KTP belum dikonfigurasi. Periksa endpoint, API key, dan mode mock.",
    );
  }

  let base64Image: string;

  try {
    base64Image = await imageToDataUrl(imageUri, imageMimeType);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal menyiapkan foto KTP untuk OCR.",
    );
  }

  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let apiResponse: Response;

  try {
    apiResponse = await fetch(KTP_OCR_ENDPOINT, {
      method: "POST",
      headers: {
        apikey: KTP_OCR_API_KEY,
        ...KTP_OCR_EXTRA_HEADERS,
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(requestErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }

  // Baca respons satu kali saja agar detail error server bisa ditampilkan.
  const responseText = await apiResponse.text();

  let data: OcrSpaceResponse | null = null;

  try {
    data = JSON.parse(responseText) as OcrSpaceResponse;
  } catch {
    // Respons mungkin bukan JSON.
  }

  if (!apiResponse.ok) {
    const details = data
      ? getErrorText(data.ErrorMessage) || getErrorText(data.ErrorDetails)
      : "";

    throw new Error(
      `${httpStatusMessage(apiResponse.status)} ${
        details || responseText || "Server tidak memberikan detail error."
      }`,
    );
  }

  if (!data) {
    throw new Error("Respons OCR bukan JSON yang valid.");
  }

  if (
    data.IsErroredOnProcessing === true ||
    data.IsErroredOnProcessing === "true"
  ) {
    const details =
      getErrorText(data.ErrorMessage) || getErrorText(data.ErrorDetails);

    throw new Error(
      `OCR gagal memproses gambar: ${
        details || "Server tidak memberikan detail tambahan."
      }`,
    );
  }

  const parsedText = data.ParsedResults?.[0]?.ParsedText;

  if (!parsedText?.trim()) {
    const details =
      getErrorText(data.ErrorMessage) ||
      getErrorText(data.ErrorDetails) ||
      `OCR tidak menemukan teks. OCRExitCode: ${data.OCRExitCode ?? "tidak tersedia"}.`;

    throw new Error(details);
  }

  const result = extractKtpFromRawText(parsedText);

  if (!result.nik && !result.fullName && !result.dob && !result.address) {
    throw new Error(
      "Foto berhasil dibaca, tetapi data KTP belum berhasil dikenali. Coba foto yang lebih jelas atau isi data secara manual.",
    );
  }

  return result;
}
