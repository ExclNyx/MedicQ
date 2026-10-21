/**
 * poliRecommendation.ts
 *
 * Logika rule-based rekomendasi poli berdasarkan keluhan pasien.
 *
 * PENTING:
 * - Rekomendasi ini BUKAN diagnosis medis dan tidak menggantikan penilaian tenaga kesehatan.
 * - Petugas WAJIB mengonfirmasi atau mengubah rekomendasi sebelum antrean dibuat.
 * - Aturan di bawah disesuaikan dengan poli yang benar-benar tersedia di aplikasi MedicQ.
 */

import { DEFAULT_SERVICES, ServiceConfig } from '@/constants/poli-options';

// ─── Tipe hasil rekomendasi ─────────────────────────────────────────────────

export type RecommendationStatus =
  | 'recommended'   // Ditemukan satu aturan yang cocok
  | 'ambiguous'     // Lebih dari satu poli kandidat — perlu Petugas
  | 'emergency'     // Keluhan mengandung indikasi kondisi darurat
  | 'not_found';    // Tidak ada aturan yang cocok

export interface PoliRecommendationResult {
  status: RecommendationStatus;
  /** Poli yang direkomendasikan (hanya diisi jika status === 'recommended') */
  service: ServiceConfig | null;
  /** Kata kunci atau keluhan yang memicu aturan ini */
  matchedKeywords: string[];
  /** Pesan singkat yang ditampilkan ke Petugas */
  reasonMessage: string;
}

// ─── Daftar keluhan indikasi darurat ────────────────────────────────────────
// Jika ditemukan, sistem TIDAK memberikan rekomendasi poli biasa,
// melainkan meminta prosedur triase atau penanganan darurat.

const EMERGENCY_KEYWORDS: string[] = [
  'sesak napas',
  'sesak',
  'tidak sadar',
  'pingsan',
  'kejang',
  'nyeri dada berat',
  'serangan jantung',
  'stroke',
  'pendarahan hebat',
];

// ─── Aturan pencocokan keluhan → poli ───────────────────────────────────────

interface Rule {
  keywords: string[];
  serviceId: string;
}

const RULES: Rule[] = [
  // — Poli Umum (poli_umum) ————————————————————————————————————————
  { keywords: ['demam'], serviceId: 'poli_umum' },
  { keywords: ['batuk / pilek', 'batuk', 'pilek'], serviceId: 'poli_umum' },
  { keywords: ['pusing / sakit kepala', 'pusing', 'sakit kepala'], serviceId: 'poli_umum' },
  { keywords: ['gangguan pencernaan', 'pencernaan', 'mual', 'muntah', 'diare'], serviceId: 'poli_umum' },
  { keywords: ['lainnya'], serviceId: 'poli_umum' },
  // — Poli Gigi (poli_gigi) ————————————————————————————————————————
  { keywords: ['nyeri gigi', 'sakit gigi', 'gigi', 'gusi', 'mulut'], serviceId: 'poli_gigi' },
  // — KIA (kia) ————————————————————————————————————————————————————
  { keywords: ['hamil', 'ibu hamil', 'kandungan', 'anak', 'bayi', 'balita', 'kia'], serviceId: 'kia' },
  // — Poli Lansia (lansia) ———————————————————————————————————————————
  { keywords: ['lansia', 'lanjut usia'], serviceId: 'lansia' },
  // — Poli Lainnya (poli_lainnya) ———————————————————————————————————
  { keywords: ['luka / cedera', 'luka', 'cedera', 'patah', 'lecet'], serviceId: 'poli_lainnya' },
  { keywords: ['masalah kulit', 'kulit', 'gatal', 'ruam', 'alergi kulit'], serviceId: 'poli_lainnya' },
  { keywords: ['masalah mata', 'mata', 'mata merah', 'penglihatan'], serviceId: 'poli_lainnya' },
  // Nyeri/sakit umum → poli umum (hanya jika tidak ada aturan spesifik lain)
  { keywords: ['nyeri / sakit', 'nyeri', 'sakit'], serviceId: 'poli_umum' },
];

// ─── Fungsi utama rekomendasi ────────────────────────────────────────────────

/**
 * Mencocokkan keluhan dengan aturan dan mengembalikan rekomendasi poli.
 *
 * @param complaints     Array label keluhan yang dipilih (dari COMPLAINT_OPTIONS)
 * @param complaintNote  Catatan keluhan bebas yang diketik Petugas/Pasien
 */
export function getPoliRecommendation(
  complaints: string[],
  complaintNote: string,
): PoliRecommendationResult {
  // Normalisasi: gabungkan semua teks keluhan menjadi satu string lowercase
  const normalized = [
    ...complaints.map((c) => c.toLowerCase()),
    complaintNote.toLowerCase(),
  ].join(' ');

  // 1. Periksa kondisi darurat terlebih dahulu
  const matchedEmergency = EMERGENCY_KEYWORDS.filter((kw) =>
    normalized.includes(kw.toLowerCase()),
  );
  if (matchedEmergency.length > 0) {
    return {
      status: 'emergency',
      service: null,
      matchedKeywords: matchedEmergency,
      reasonMessage:
        '⚠️ Keluhan mengandung indikasi kondisi darurat. Ikuti prosedur triase atau penanganan darurat klinik segera.',
    };
  }

  // 2. Jalankan semua aturan dan kumpulkan kandidat poli
  const matchedKeywords: string[] = [];
  const candidateServiceIds = new Set<string>();

  for (const rule of RULES) {
    const hit = rule.keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
    if (hit.length > 0) {
      candidateServiceIds.add(rule.serviceId);
      matchedKeywords.push(...hit);
    }
  }

  const uniqueKeywords = [...new Set(matchedKeywords)];

  // 3. Tidak ada aturan yang cocok
  if (candidateServiceIds.size === 0) {
    return {
      status: 'not_found',
      service: null,
      matchedKeywords: [],
      reasonMessage: 'Tidak ada rekomendasi otomatis. Silakan tentukan poli secara manual.',
    };
  }

  // 4. Lebih dari satu poli kandidat = ambigu
  if (candidateServiceIds.size > 1) {
    return {
      status: 'ambiguous',
      service: null,
      matchedKeywords: uniqueKeywords,
      reasonMessage:
        'Keluhan cocok dengan beberapa poli. Petugas perlu menentukan poli yang tepat secara manual.',
    };
  }

  // 5. Tepat satu kandidat = rekomendasi tunggal
  const serviceId = [...candidateServiceIds][0];
  const service = DEFAULT_SERVICES.find((s) => s.id === serviceId) ?? null;

  if (!service) {
    return {
      status: 'not_found',
      service: null,
      matchedKeywords: uniqueKeywords,
      reasonMessage: 'Rekomendasi tidak dapat ditentukan. Pilih poli secara manual.',
    };
  }

  return {
    status: 'recommended',
    service,
    matchedKeywords: uniqueKeywords,
    reasonMessage: `Cocok dengan kata kunci: ${uniqueKeywords.slice(0, 3).join(', ')}`,
  };
}
