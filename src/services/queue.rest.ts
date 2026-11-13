/**
 * Klien REST untuk antrean MedicQ (materi Week 8: Asynchronous API Call).
 *
 * Backend tetap Firebase, tetapi di sini diakses lewat Firestore REST API
 * memakai fetch() + async/await, bukan SDK realtime:
 *
 *   GET   /documents/queues            -> daftar antrean (fitur 01)
 *   POST  /documents/registrations     -> tambah pasien manual (fitur 03)
 *   POST  /documents/queues            -> tambah nomor antrean (fitur 03)
 *   PATCH /documents/queues/{id}       -> ubah status antrean (fitur 04)
 *
 * Semua fungsi melempar Error berpesan Indonesia, sehingga pemanggil cukup
 * memakai try/catch + Alert (fitur 05).
 */
import { auth, app, getTodayString } from '@/services/firebase';
import { getServiceById, getServiceCode } from '@/constants/poli-options';
import type { QueueModel, QueueStatus } from '@/types';

const PROJECT_ID = app.options.projectId as string;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const REQUEST_TIMEOUT_MS = 12000;

/* ------------------------------------------------------------------ */
/* Konversi nilai JS <-> format Firestore REST                         */
/* ------------------------------------------------------------------ */

type FsValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

type FsFields = Record<string, FsValue>;

interface FsDocument {
  name: string;
  fields?: FsFields;
  createTime?: string;
  updateTime?: string;
}

function toFsValue(value: unknown): FsValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFsValue) } };
  return { mapValue: { fields: toFsFields(value as Record<string, unknown>) } };
}

function toFsFields(data: Record<string, unknown>): FsFields {
  const fields: FsFields = {};
  for (const [key, value] of Object.entries(data)) fields[key] = toFsValue(value);
  return fields;
}

function fromFsValue(value: FsValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromFsValue);
  if ('mapValue' in value) return fromFsFields(value.mapValue.fields ?? {});
  return null;
}

function fromFsFields(fields: FsFields): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) out[key] = fromFsValue(value);
  return out;
}

function docId(doc: FsDocument): string {
  return doc.name.split('/').pop() ?? '';
}

function toQueue(doc: FsDocument): QueueModel {
  return { id: docId(doc), ...fromFsFields(doc.fields ?? {}) } as unknown as QueueModel;
}

/* ------------------------------------------------------------------ */
/* Lapisan HTTP dasar                                                  */
/* ------------------------------------------------------------------ */

class RestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'RestError';
  }
}

function friendlyHttpMessage(status: number, apiMessage?: string): string {
  switch (status) {
    case 400:
      return 'Permintaan tidak valid (400).';
    case 401:
      return 'Sesi login berakhir. Silakan login kembali.';
    case 403:
      return 'Akses ditolak (403). Pastikan akun ini berperan petugas dan Firestore Rules sudah benar.';
    case 404:
      return 'Data tidak ditemukan (404).';
    case 409:
      return 'Data baru saja diubah oleh pengguna lain (409). Coba lagi.';
    case 429:
      return 'Terlalu banyak permintaan (429). Coba lagi sebentar lagi.';
    default:
      if (status >= 500) return `Server sedang bermasalah (${status}). Coba lagi nanti.`;
      return apiMessage || `Permintaan gagal (${status}).`;
  }
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new RestError('Belum login. Silakan login kembali.', 401);

  const token = await user.getIdToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let apiMessage: string | undefined;
      try {
        const errorBody = await response.json();
        apiMessage = errorBody?.error?.message;
      } catch {
        // badan respons bukan JSON; pakai pesan bawaan
      }
      throw new RestError(friendlyHttpMessage(response.status, apiMessage), response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof RestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RestError('Waktu permintaan habis. Periksa koneksi internet.', 408);
    }
    throw new RestError('Tidak dapat terhubung ke server. Periksa koneksi internet.', 0);
  } finally {
    clearTimeout(timer);
  }
}

/** Bangun query string updateMask supaya PATCH hanya mengubah field tertentu. */
function maskQuery(fieldPaths: string[], extra = ''): string {
  const mask = fieldPaths.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  return `?${mask}${extra}`;
}

/* ------------------------------------------------------------------ */
/* Operasi antrean                                                     */
/* ------------------------------------------------------------------ */

function sortByOrder(items: QueueModel[]): QueueModel[] {
  const orderOf = (q: QueueModel) => q.queueOrder ?? q.sequenceNumber;
  return [...items].sort((a, b) => orderOf(a) - orderOf(b) || a.sequenceNumber - b.sequenceNumber);
}

/** GET: seluruh antrean hari ini pada satu poli. */
export async function fetchQueues(serviceId: string): Promise<QueueModel[]> {
  const today = getTodayString();
  const all: QueueModel[] = [];
  let pageToken = '';

  // Maksimal 5 halaman x 300 dokumen; cukup untuk satu puskesmas.
  for (let page = 0; page < 5; page += 1) {
    const suffix = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
    const json = await request<{ documents?: FsDocument[]; nextPageToken?: string }>(
      'GET',
      `/queues?pageSize=300${suffix}`,
    );
    for (const doc of json.documents ?? []) all.push(toQueue(doc));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }

  return sortByOrder(all.filter((q) => q.serviceId === serviceId && q.visitDate === today));
}

/**
 * Ambil nomor urut berikutnya dari dokumen queue_counters (sama dengan yang
 * dipakai versi SDK) dengan optimistic locking lewat updateTime.
 */
async function nextSequence(serviceId: string, date: string): Promise<number> {
  const path = `/queue_counters/${serviceId}_${date}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let current: FsDocument | null = null;
    try {
      current = await request<FsDocument>('GET', path);
    } catch (error) {
      if (!(error instanceof RestError && error.status === 404)) throw error;
    }

    const last = current ? Number(fromFsFields(current.fields ?? {}).lastNumber ?? 0) : 0;
    const next = last + 1;
    const precondition = current?.updateTime
      ? `&currentDocument.updateTime=${encodeURIComponent(current.updateTime)}`
      : '&currentDocument.exists=false';

    try {
      await request('PATCH', `${path}${maskQuery(['serviceId', 'date', 'lastNumber'], precondition)}`, {
        fields: toFsFields({ serviceId, date, lastNumber: next }),
      });
      return next;
    } catch (error) {
      // 409/400 = ada yang mengambil nomor lebih dulu; ulangi.
      const retryable = error instanceof RestError && (error.status === 409 || error.status === 400);
      if (!retryable || attempt === 2) throw error;
    }
  }
  throw new RestError('Gagal mengambil nomor antrean.', 409);
}

export interface CreateQueueInput {
  patientName: string;
  serviceId: string;
}

/** POST: daftarkan pasien manual (tanpa aplikasi) sekaligus buat nomor antrean. */
export async function createQueue({ patientName, serviceId }: CreateQueueInput): Promise<QueueModel> {
  const name = patientName.trim();
  if (!name) throw new RestError('Nama pasien wajib diisi.', 400);

  const service = getServiceById(serviceId);
  if (!service) throw new RestError('Poli tidak dikenal.', 400);

  const today = getTodayString();
  const now = new Date();
  const staffId = auth.currentUser?.uid ?? null;
  const patientId = `manual_${now.getTime()}`;

  // 1) POST registrasi manual (status langsung QUEUED, sesuai F-ST11)
  const registration = await request<FsDocument>('POST', '/registrations', {
    fields: toFsFields({
      patientId,
      patientName: name,
      visitDate: today,
      status: 'QUEUED',
      complaints: [],
      complaintNote: '',
      serviceId,
      serviceName: service.name,
      queueId: null,
      staffId,
      isManual: true,
      createdAt: now,
      updatedAt: now,
    }),
  });
  const registrationId = docId(registration);

  // 2) nomor urut + POST antrean
  const sequenceNumber = await nextSequence(serviceId, today);
  const queueNumber = `${getServiceCode(serviceId)}-${String(sequenceNumber).padStart(3, '0')}`;

  const queueDoc = await request<FsDocument>('POST', '/queues', {
    fields: toFsFields({
      queueNumber,
      patientId,
      patientName: name,
      serviceId,
      serviceName: service.name,
      registrationId,
      visitDate: today,
      status: 'WAITING',
      sequenceNumber,
      queueOrder: sequenceNumber,
      skipCount: 0,
      callCount: 0,
      createdAt: now,
      calledAt: null,
      servedAt: null,
      completedAt: null,
      lastSkippedAt: null,
    }),
  });

  // 3) PATCH registrasi agar menunjuk ke antrean yang baru dibuat
  await request('PATCH', `/registrations/${registrationId}${maskQuery(['queueId'])}`, {
    fields: toFsFields({ queueId: docId(queueDoc) }),
  });

  return toQueue(queueDoc);
}

/** PATCH helper untuk dokumen poli (papan display membaca currentServing dari sini). */
async function patchServing(serviceId: string, queue: QueueModel | null): Promise<void> {
  const service = getServiceById(serviceId);
  await request(
    'PATCH',
    `/services/${serviceId}${maskQuery(['id', 'name', 'code', 'isActive', 'currentServing', 'currentServingQueueId'])}`,
    {
      fields: toFsFields({
        id: serviceId,
        name: service?.name ?? serviceId,
        code: service?.code ?? getServiceCode(serviceId),
        isActive: true,
        currentServing: queue?.queueNumber ?? null,
        currentServingQueueId: queue?.id ?? null,
      }),
    },
  );
}

/**
 * PATCH: ubah status antrean.
 *  - CALLED    -> isi calledAt + naikkan callCount + update papan display
 *  - COMPLETED -> isi completedAt + registrasi COMPLETED + kosongkan papan display
 *  - WAITING   -> batalkan "selesai"/"dipanggil" (toggle), registrasi kembali QUEUED
 */
export async function updateQueueStatus(queue: QueueModel, status: QueueStatus): Promise<QueueModel> {
  const now = new Date();
  const wasActive = queue.status === 'CALLED' || queue.status === 'SERVING';
  const patch: Record<string, unknown> = { status };

  if (status === 'CALLED') {
    patch.calledAt = now;
    patch.callCount = (queue.callCount ?? 0) + 1;
  }
  if (status === 'COMPLETED') patch.completedAt = now;
  if (status === 'WAITING') patch.completedAt = null;

  const updated = await request<FsDocument>(
    'PATCH',
    `/queues/${queue.id}${maskQuery(Object.keys(patch))}`,
    { fields: toFsFields(patch) },
  );

  if (status === 'CALLED') await patchServing(queue.serviceId, queue);
  if (wasActive && status !== 'CALLED') await patchServing(queue.serviceId, null);

  if (queue.registrationId && (status === 'COMPLETED' || (status === 'WAITING' && queue.status === 'COMPLETED'))) {
    await request('PATCH', `/registrations/${queue.registrationId}${maskQuery(['status', 'updatedAt'])}`, {
      fields: toFsFields({
        status: status === 'COMPLETED' ? 'COMPLETED' : 'QUEUED',
        updatedAt: now,
      }),
    });
  }

  return toQueue(updated);
}
