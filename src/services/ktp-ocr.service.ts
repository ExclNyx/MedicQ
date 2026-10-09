import { KTP_OCR_API_KEY, KTP_OCR_ENDPOINT, KTP_OCR_EXTRA_HEADERS, isMockKtpOcr } from '../core/config/ktp-ocr';
import type { Gender } from '../core/models';

export interface KtpScanResult {
  nik: string;
  fullName: string;
  dob: string;
  gender: Gender | null;
  address: string;
  raw?: Record<string, string>;
}

const MONTHS_ID: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function normalizeDob(raw: string | undefined | null): string {
  if (!raw) return '';
  const text = raw.trim().toLowerCase();

  const numeric = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text);
  if (numeric) return `${pad(Number(numeric[1]))}-${pad(Number(numeric[2]))}-${numeric[3]}`;

  const named = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/.exec(text);
  if (named) {
    const month = MONTHS_ID[named[2]];
    if (month) return `${pad(Number(named[1]))}-${pad(month)}-${named[3]}`;
  }

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (iso) return `${pad(Number(iso[3]))}-${pad(Number(iso[2]))}-${iso[1]}`;

  // Coba cari pola tanggal di dalam teks panjang
  const matchAny = /\b(\d{2})[-/ ](\d{2})[-/ ](\d{4})\b/.exec(text);
  if (matchAny) return `${pad(Number(matchAny[1]))}-${pad(Number(matchAny[2]))}-${matchAny[3]}`;

  return '';
}

export function normalizeGender(raw: string | undefined | null): Gender | null {
  if (!raw) return null;
  const text = raw.trim().toLowerCase();
  if (/laki/.test(text) || /\bl\b/.test(text)) return 'male';
  if (/perempuan/.test(text) || /\bp\b/.test(text)) return 'female';
  return null;
}

/** 
 * Ekstraksi data KTP dari teks kasar hasil OCR (Regex based) 
 */
export function extractKtpFromRawText(text: string): KtpScanResult {
  const lines = text.split('\n').map(l => l.trim().toUpperCase()).filter(l => l.length > 0);
  
  let nik = '';
  let fullName = '';
  let dob = '';
  let gender: Gender | null = null;
  let address = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // NIK (16 digit)
    if (!nik) {
      const nikMatch = line.replace(/[^0-9]/g, '');
      if (nikMatch.length === 16) {
        nik = nikMatch;
      } else if (line.includes('NIK')) {
        const afterNik = line.split('NIK')[1]?.replace(/[^0-9]/g, '');
        if (afterNik && afterNik.length >= 16) nik = afterNik.substring(0, 16);
      }
    }

    // Nama
    if (line.includes('NAMA') && !fullName) {
      fullName = line.split('NAMA')[1]?.replace(/^[^A-Z]*/, '').trim();
      if (!fullName && lines[i+1]) fullName = lines[i+1];
    }

    // Tgl Lahir
    if (line.includes('LAHIR') && !dob) {
      dob = normalizeDob(line);
      if (!dob && lines[i+1]) dob = normalizeDob(lines[i+1]);
    }

    // Jenis Kelamin
    if ((line.includes('KELAMIN') || line.includes('LAKI') || line.includes('PEREMPUAN')) && !gender) {
      gender = normalizeGender(line);
    }

    // Alamat
    if (line.includes('ALAMAT') && !address) {
      address = line.split('ALAMAT')[1]?.replace(/^[^A-Z0-9]*/, '').trim();
      if (!address && lines[i+1]) address = lines[i+1];
      
      // Tambahkan RT/RW dan Kelurahan jika baris berikutnya sepertinya bagian dari alamat
      if (lines[i+1] && (lines[i+1].includes('RT') || lines[i+1].includes('RW'))) {
        address += ', ' + lines[i+1];
      }
      if (lines[i+2] && (lines[i+2].includes('KEL') || lines[i+2].includes('DESA'))) {
        address += ', ' + lines[i+2];
      }
    }
  }

  return { nik, fullName, dob, gender, address, raw: { text } };
}

export async function scanKtpFromImage(imageUri: string): Promise<KtpScanResult> {
  if (isMockKtpOcr() || !KTP_OCR_ENDPOINT || !KTP_OCR_API_KEY) {
    throw new Error('OCR KTP belum dikonfigurasi. Silakan isi data pasien secara manual.');
  }

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const endpoint = KTP_OCR_ENDPOINT;
  const apiKey = KTP_OCR_API_KEY;

  const formData = new FormData();
  formData.append('base64Image', base64);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');

  const apiResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      ...KTP_OCR_EXTRA_HEADERS,
    },
    body: formData,
  });

  if (!apiResponse.ok) {
    throw new Error(`OCR request failed (${apiResponse.status})`);
  }

  const data = await apiResponse.json();
  
  if (data.ParsedResults && data.ParsedResults.length > 0) {
    const parsedText = data.ParsedResults[0].ParsedText;
    return extractKtpFromRawText(parsedText);
  }
  
  throw new Error('Gagal mengekstrak teks dari gambar');
}
