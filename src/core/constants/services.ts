export interface ServiceConfig {
  id: string;
  name: string;
  code: string;  // prefix for queue number
  description: string;
}

export const DEFAULT_SERVICES: ServiceConfig[] = [
  { id: 'poli_umum', name: 'Poli Umum', code: 'A', description: 'Pelayanan kesehatan umum' },
  { id: 'poli_gigi', name: 'Poli Gigi', code: 'B', description: 'Pelayanan kesehatan gigi dan mulut' },
  { id: 'kia', name: 'KIA', code: 'C', description: 'Kesehatan Ibu dan Anak' },
  { id: 'lansia', name: 'Poli Lansia', code: 'D', description: 'Pelayanan kesehatan lanjut usia' },
  { id: 'poli_lainnya', name: 'Poli Lainnya', code: 'E', description: 'Layanan kesehatan lainnya' },
];

export const getServiceById = (id: string): ServiceConfig | undefined =>
  DEFAULT_SERVICES.find((s) => s.id === id);

export const getServiceCode = (id: string): string =>
  DEFAULT_SERVICES.find((s) => s.id === id)?.code ?? 'A';
