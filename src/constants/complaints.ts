export interface ComplaintOption {
  id: string;
  label: string;
  icon: string;
}

export const COMPLAINT_OPTIONS: ComplaintOption[] = [
  { id: 'demam', label: 'Demam', icon: '🌡️' },
  { id: 'batuk', label: 'Batuk / Pilek', icon: '🤧' },
  { id: 'pusing', label: 'Pusing / Sakit Kepala', icon: '🥴' },
  { id: 'nyeri', label: 'Nyeri / Sakit', icon: '🩹' },
  { id: 'luka', label: 'Luka / Cedera', icon: '🩼' },
  { id: 'pencernaan', label: 'Gangguan Pencernaan', icon: '🤢' },
  { id: 'sesak', label: 'Sesak Napas', icon: '😮💨' },
  { id: 'kulit', label: 'Masalah Kulit', icon: '🔴' },
  { id: 'mata', label: 'Masalah Mata', icon: '👁️' },
  { id: 'lainnya', label: 'Lainnya', icon: '📋' },
];
