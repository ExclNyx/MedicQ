# PuskesmasQueue

Sistem Registrasi dan Antrean Puskesmas Berbasis Realtime menggunakan **Expo (React Native) + Firebase**.

## Fitur Utama

- **Pasien:** Mendaftar akun, melengkapi data diri, mengajukan kunjungan, memantau nomor antrean secara realtime, dan menerima notifikasi + getaran saat antrean sudah dekat atau dipanggil.
- **Petugas:** Memverifikasi pasien (mencegah antrean palsu), mencatat keluhan, menentukan poli, dan memanggil/melewati nomor antrean.
- **TV Ruang Tunggu:** Tampilan display (Display Mode) yang khusus dioptimalkan untuk TV monitor guna menampilkan nomor yang dipanggil saat ini dan antrean berikutnya secara realtime.
- **Dukungan Pasien Manual:** Petugas dapat mendaftarkan pasien yang tidak menggunakan aplikasi dengan menggunakan form registrasi manual, dan mengintegrasikannya ke sistem antrean yang sama.

---

## 🛠️ Persiapan & Konfigurasi (PENTING)

Aplikasi ini menggunakan **Firebase Native SDK** (`@react-native-firebase/*`). Oleh karena itu, aplikasi **TIDAK BISA** dijalankan hanya dengan Expo Go. Anda harus menggunakan **Development Build**.

### 1. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru (contoh: `puskesmas-queue-dev`)
3. Aktifkan **Authentication** (Email/Password)
4. Aktifkan **Firestore Database** (buat dalam mode test atau salin aturan dari `firestore.rules`)
5. Tambahkan aplikasi Android di console Firebase. Gunakan Package Name: `com.puskesmasqueue.app`
6. Unduh file `google-services.json` dan letakkan di **root folder** project ini (sejajar dengan `package.json`).

*(Catatan: Jika Anda juga ingin build untuk iOS, tambahkan aplikasi iOS di Firebase dengan bundle ID yang sama, unduh `GoogleService-Info.plist`, dan letakkan di root folder)*.

### 2. Jalankan Aplikasi
Karena menggunakan native code (Firebase), jalankan perintah berikut untuk meng-compile ulang (memerlukan Android SDK terinstall atau EAS Build):

```bash
# Hapus node_modules jika ada masalah
npm install

# Build dan jalankan di emulator / device Android yang terhubung via USB
npx expo run:android
```

Jika Anda tidak memiliki Android Studio, Anda harus membuild aplikasi di cloud menggunakan EAS:
```bash
npx expo install eas-cli
eas login
eas build --profile development --platform android
# Install APK yang dihasilkan ke device, lalu jalankan:
npx expo start --dev-client
```

---

## 🧑‍💻 Cara Pengujian (Testing Scenarios)

Buat 2 akun untuk pengujian:
1. Daftar sebagai pasien melalui aplikasi.
2. Karena belum ada dashboard admin khusus untuk mengubah role, Anda harus mengubah role akun kedua secara manual di Firebase Firestore: Buka collection `users` -> cari akun -> ubah field `role` menjadi `"staff"`.

### Skenario Uji:
1. **Daftar Kunjungan:** Pasien login -> klik "Daftar Kunjungan". Status akan menjadi "Menunggu Verifikasi".
2. **Verifikasi:** Login sebagai Petugas (di perangkat/emulator lain) -> Dashboard. Akan muncul pasien di tab "Verifikasi".
3. **Pilih Poli:** Petugas klik verifikasi -> pilih keluhan -> pilih Poli Umum -> klik Buat Antrean.
4. **Realtime Antrean:** Di aplikasi pasien, layar akan otomatis berubah (tanpa refresh) menampilkan nomor antrean (contoh: A-001).
5. **Notifikasi Getar:** Ketika petugas memanggil antrean yang berada tepat di depan pasien, HP pasien akan bergetar singkat (warning). Saat nomor pasien dipanggil, akan muncul notifikasi sistem dan getaran kuat (success/heavy haptic).
6. **TV Mode:** Buka URL atau aplikasi dengan path `/display` untuk melihat tampilan papan antrean TV yang merespon secara realtime saat petugas memanggil pasien.

---

## Struktur Database Firestore

Struktur lengkap dan security rules dapat dilihat di file `firestore.rules`.
Minimal Anda perlu membuat data master layanan/poli di collection `services` melalui Firebase Console:

**Collection `services`:**
- Document 1: `id: "poli_umum"`, `name: "Poli Umum"`, `code: "A"`, `isActive: true`, `currentServing: null`
- Document 2: `id: "poli_gigi"`, `name: "Poli Gigi"`, `code: "B"`, `isActive: true`, `currentServing: null`

---

## Tech Stack
- Expo SDK 57 (React Native 0.86)
- Expo Router v4
- Zustand (State Management)
- @react-native-firebase (Auth, Firestore, Messaging)
- expo-notifications & expo-haptics
