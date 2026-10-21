# Peta Proyek MedicQ

Cari dulu di tabel ini sebelum membuka file lain.

## Struktur (hanya 5 folder di `src/`)

```
src/
├─ app/          Halaman (Expo Router). Nama folder = nama rute.
│  ├─ (auth)/       login, register, lengkapi profil, akses pasien
│  ├─ (patient)/    home, daftar kunjungan, status antrean, riwayat
│  ├─ (staff)/      dashboard petugas + modul petugas [slug]
│  ├─ (admin)/      dashboard admin + modul admin [slug] (masih placeholder)
│  └─ display/      layar TV ruang tunggu
├─ components/   Potongan UI yang dipakai ulang
│  ├─ ui/           tombol, form, header, kartu, badge
│  ├─ staff/        baris daftar khusus petugas
│  └─ display/      papan antrean TV
├─ constants/    colors.ts (SEMUA warna), poli-options.ts (daftar poli), complaints.ts (daftar keluhan)
├─ hooks/        useMedicQTheme (tema), useAuth/useAuthStore (login), useQueueStore, usePatientQueue, useStaffQueue, useQueueActions
├─ services/     *.service.ts = aturan bisnis, *.repository.ts = baca/tulis Firestore, firebase.ts = koneksi
└─ types.ts      Tipe data (PatientModel, QueueModel, dst.)
```

## Mau ubah apa, buka file mana

| Permintaan | File |
|---|---|
| Ganti warna aplikasi | `src/constants/colors.ts` (`light` dan `dark`) |
| Ganti warna layar TV | `src/constants/colors.ts` → `displayPalette` |
| Ganti teks/jarak satu halaman | file halaman di `src/app/...` |
| Ganti tombol utama / sekunder | `components/ui/PrimaryButton.tsx` / `OutlineButton.tsx` |
| Ganti header pasien / petugas | `components/ui/PatientHeader.tsx` / `StaffHeader.tsx` |
| Ganti tampilan login & register | `components/ui/AuthScreen.tsx` (kerangka) + `app/(auth)/login.tsx` |
| Tambah / ubah poli & kode antrean | `constants/poli-options.ts` |
| Tambah / ubah daftar keluhan | `constants/complaints.ts` |
| Aturan rekomendasi poli | `services/poli-recommendation.ts` |
| Aturan panggil / ulang / lewati / selesai | `services/queue.service.ts` |
| Tombol aksi antrean petugas | `hooks/useQueueActions.ts` (dipakai dashboard dan modul) |
| Cara data antrean dibaca/ditulis | `services/queue.repository.ts` |
| Login / logout / daftar akun | `services/auth.service.ts` |
| Pindah halaman sesuai role | `_layout.tsx` di folder rute terkait, dan `app/index.tsx` |
| Aturan keamanan Firestore | `firestore.rules` (lalu Publish di Firebase Console) |

## Aturan emas agar tidak error saat ganti warna / live coding

1. **Warna hanya dari `colors.ts`.** Di komponen tulis `const c = useColors();` lalu `c.primary`. Jangan tulis hex di komponen dan jangan buat file tema baru.
2. **Nama warna di `light` dan `dark` harus sama.** Kalau tidak, TypeScript menandai baris `const dark` di `colors.ts`.
3. **Ubah nilainya, jangan ubah namanya.** Mengganti nama kunci (misal `primary` jadi `utama`) membuat semua komponen yang memakainya error.
4. **Jangan memindah / mengganti nama file** tanpa mencari semua importnya (`@/...`).
5. **Setelah edit, cek dulu dengan `npm run typecheck`.** Kalau merah, baca pesan dan nomor barisnya, jangan langsung ubah hal lain.
6. Bila layar merah atau perilaku aneh setelah edit: `Ctrl+C`, lalu `npx expo start -c` (hapus cache).
7. `StyleSheet.create()` tetap di bawah file halamannya. Nilai yang bergantung tema dipasang inline: `style={[styles.card, { backgroundColor: c.surface }]}`.

## Perintah

```bash
npm install
npx expo start -c      # jalankan di Expo Go (scan QR)
npm run typecheck      # cek error TypeScript tanpa menjalankan aplikasi
npm run lint
```

## Dokumen lain

- `docs/PRD.md`: kebutuhan produk
- `docs/PATIENT_FLOW.md`: alur pasien
- `docs/FIREBASE_SETUP.md`, `docs/FIREBASE_REGISTER_GUIDE.md`: setup Firebase
- `docs/arsip/`: catatan lama, bisa sudah tidak sesuai dengan struktur sekarang
