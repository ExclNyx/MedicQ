import { KTP_OCR_API_KEY, KTP_OCR_ENDPOINT, KTP_OCR_EXTRA_HEADERS, isMockKtpOcr } from '../core/config/ktp-ocr';
import type { Gender } from '../core/models';

export interface KtpScanResult {
  nik: string;
  fullName: string;
  /** DD-MM-YYYY — format yang dipakai form complete-profile. */
  dob: string;
  gender: Gender | null;
  /** Alamat yang sudah dirangkai (alamat + RT/RW + kelurahan + kecamatan bila ada). */
  address: string;
  /** Data mentah dari API (untuk debug). */
  raw?: Record<string, string>;
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

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Normalisasi tanggal lahir dari OCR ke DD-MM-YYYY.
 * Mendukung "17-08-1990", "17/08/1990", "17 Agustus 1990".
 * Return string kosong bila tidak bisa diparse.
 */
export function normalizeDob(raw: string | undefined | null): string {
  if (!raw) return '';
  const text = raw.trim().toLowerCase();

  // DD-MM-YYYY atau DD/MM/YYYY
  const numeric = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text);
  if (numeric) {
    return `${pad(Number(numeric[1]))}-${pad(Number(numeric[2]))}-${numeric[3]}`;
  }

  // DD Month YYYY (bulan Indonesia)
  const named = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/.exec(text);
  if (named) {
    const month = MONTHS_ID[named[2]];
    if (month) return `${pad(Number(named[1]))}-${pad(month)}-${named[3]}`;
  }

  // YYYY-MM-DD (ISO)
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (iso) return `${pad(Number(iso[3]))}-${pad(Number(iso[2]))}-${iso[1]}`;

  return '';
}

/** "LAKI-LAKI" / "L" → male; "PEREMPUAN" / "P" → female; selain itu null. */
export function normalizeGender(raw: string | undefined | null): Gender | null {
  if (!raw) return null;
  const text = raw.trim().toLowerCase();
  if (/laki/.test(text) || /^l$/.test(text)) return 'male';
  if (/perempuan/.test(text) || /^p$/.test(text)) return 'female';
  return null;
}

/** Gabung bagian alamat yang tidak kosong dengan koma. */
function joinAddress(parts: (string | undefined | null)[]): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Mapping respons API OCR KTP → bentuk form complete-profile.
 * Nama field mengikuti pola umum API KTP OCR Indonesia
 * (nik, nama, tanggal_lahir, jenis_kelamin, alamat, rt_rw, kelurahan, kecamatan).
 */
export function normalizeKtpResponse(raw: Record<string, unknown>): KtpScanResult {
  const str = (key: string): string => {
    const v = raw[key];
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  };

  const nik = str('nik').replace(/\D/g, '');
  const address = joinAddress([str('alamat'), str('rt_rw'), str('kelurahan'), str('kecamatan')]);

  return {
    nik,
    fullName: str('nama').trim(),
    dob: normalizeDob(str('tanggal_lahir')),
    gender: normalizeGender(str('jenis_kelamin')),
    address,
    raw: Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v == null ? '' : String(v)])
    ),
  };
}

const MOCK_KTP: KtpScanResult = {
  nik: '3374012505900001',
  fullName: 'Budi Santoso',
  dob: '25-05-1990',
  gender: 'male',
  address: 'Jl. Pandanaran No. 12, RT 03/RW 05, Gajahmungkur, Semarang Selatan',
};

const MOCK_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Baca KTP dari gambar via API OCR cloud.
 * Tanpa endpoint/key → mode mock (data contoh) agar flow bisa didemokan.
 *
 * TODO (tim backend): ganti pemanggilan fetch ini dengan endpoint proxy
 * milik backend bila API key tidak boleh berada di client.
 */
export async function scanKtpFromImage(imageUri: string): Promise<KtpScanResult> {
  if (isMockKtpOcr()) {
    await delay(MOCK_DELAY_MS);
    return { ...MOCK_KTP };
  }

  // Ambil gambar sebagai base64 (data URL) untuk dikirim ke API OCR.
  // TODO: bila FileReader bermasalah di device tertentu, ganti dengan
  // expo-file-system readAsStringAsync(uri, { encoding: 'base64' }).
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const apiResponse = await fetch(KTP_OCR_ENDPOINT as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KTP_OCR_API_KEY}`,
      ...KTP_OCR_EXTRA_HEADERS,
    },
    body: JSON.stringify({ image: base64 }),
  });

  if (!apiResponse.ok) {
    throw new Error(`OCR request failed (${apiResponse.status})`);
  }

  const data = (await apiResponse.json()) as Record<string, unknown>;
  // Beberapa API membungkus hasil di field "result" / "data" / "response".
  const payload =
    (data.result as Record<string, unknown> | undefined) ??
    (data.data as Record<string, unknown> | undefined) ??
    (data.response as Record<string, unknown> | undefined) ??
    data;

  return normalizeKtpResponse(payload);
}
