# MedicQ

Sistem registrasi dan antrean puskesmas realtime menggunakan **Expo SDK 57 + Expo Router + Firebase JS SDK + Firestore + Zustand**.

## Mode Firebase yang dipakai

Project ini sengaja menggunakan **Firebase JavaScript SDK**, bukan `@react-native-firebase`. Karena itu aplikasi dapat dijalankan di **Expo Go**. Firebase Authentication dan Cloud Firestore didukung oleh Firebase JS SDK pada React Native/Expo; persistence Auth dikonfigurasi dengan `initializeAuth()` + `getReactNativePersistence(AsyncStorage)`.

File `google-services.json` yang sudah ada dipakai sebagai fallback untuk Android Expo Go. Untuk target Web/universal, gunakan konfigurasi **Web App** dari Firebase Console melalui file `.env`.

## Jalankan di Expo Go

1. Pastikan Node.js dan Expo CLI tersedia.
2. Di folder project jalankan:

```bash
npm install
npx expo start -c
```

3. Buka project dengan Expo Go yang cocok dengan **SDK 57**. Expo mendokumentasikan bahwa versi SDK project dan Expo Go harus kompatibel.

## Firebase Authentication

Di Firebase Console:

- Project: `medicq`
- Authentication → Sign-in method → aktifkan **Email/Password**.
- Firestore Database → buat database.
- Publish isi `firestore.rules` dari project ini.
- Untuk mode presentasi, query utama difilter pada sisi aplikasi untuk mengurangi kebutuhan composite index saat setup. Ini cocok untuk data demo yang kecil, bukan untuk skala produksi.

Setelah itu alur berikut sudah terhubung:

`Register pasien → Firebase Auth → users/{uid} → Login → ambil role → Patient/Staff dashboard`

Pada registration, jika penulisan profil Firestore gagal, akun Auth yang baru dibuat akan dibatalkan agar tidak meninggalkan akun yatim.

## Konfigurasi Web (opsional)

Salin file contoh menjadi `.env`:

```bash
copy .env.example .env
```

Lalu isi nilai Web App dari Firebase Console. Konfigurasi paling penting adalah `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, dan `appId`.

## Catatan mode presentasi

Untuk versi presentasi ini, notifikasi sistem, remote push, dan haptic dinonaktifkan sementara. Status antrean tetap diperbarui melalui listener Firestore. Notifikasi dapat diintegrasikan kembali setelah alur utama stabil; remote push Android memerlukan Development Build.

## Alur antrean

- Pasien daftar kunjungan → `REGISTRATION_PENDING`.
- Petugas memverifikasi → `VERIFIED`.
- Petugas menentukan poli → queue dibuat dengan status `WAITING`.
- Petugas menekan **Panggil Berikutnya** → nomor target `CALLED` dan queue aktif sebelumnya otomatis `COMPLETED`.
- Tombol **Panggil Ulang** tetap tersedia.
- Tombol **Selesai** bisa digunakan untuk menutup antrean aktif secara manual.
- Data queue, registration, dan display board dibaca lewat listener Firestore realtime.

## KTP / OCR

`expo-image-picker` dapat digunakan di Expo Go. OCR pihak ketiga tetap membutuhkan endpoint/API sendiri; konfigurasi kosong tidak lagi diam-diam memakai API demo. Bila OCR belum dikonfigurasi, pengguna tetap dapat mengisi data pasien secara manual. `expo-image-picker` sendiri termasuk library yang tersedia di Expo Go SDK 57.

## Seed data

Aplikasi tidak bergantung pada akun seed untuk login pasien. Pasien dibuat melalui layar Register. Untuk petugas/admin, buat akun Email/Password lalu buat/update dokumen `users/{uid}` di Firestore dengan role `staff` atau `admin`.

## Menu Petugas

Area petugas sekarang memiliki menu:

- Dashboard
- Pendaftaran
- Registrasi Pasien
- Cari Pasien
- Verifikasi Pasien
- Keluhan
- Pilih Poli
- Antrian
- Panggil Berikutnya
- Panggil Ulang
- Lewati / No Show
- Riwayat

Dashboard dan modul antrean memakai listener Firestore untuk data real-time.

## Data pasien langsung ke Firebase

Alur pasien sekarang:

`Pasien Register -> Firebase Authentication -> users/{uid}`

`Pasien Lengkapi Profil -> Firestore patients/{uid}`

`Pasien daftar kunjungan -> Firestore registrations/{registrationId}`

Untuk pasien yang datang langsung melalui menu Petugas -> Registrasi Pasien:

`Form Petugas -> Firestore patients/{NIK} -> Firestore registrations/{registrationId}`

Nomor rekam medis sederhana dibuat otomatis untuk data pasien baru agar dapat dipakai saat pencarian. Search NIK dilakukan langsung dengan query Firestore; pencarian nama/RM dilakukan pada data pasien yang diambil dari Firestore karena skala project saat ini masih kecil.
