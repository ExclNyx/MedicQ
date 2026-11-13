# MedicQ — Struktur Project untuk Belajar dan Live Modification

Project ini dirapikan agar folder utama source cukup lima: `app`, `components`, `services`, `hooks`, dan `constants`. Tipe data bersama diletakkan di `src/types.ts` agar tidak perlu folder `models` terpisah.

## Folder utama

- `src/app/`: halaman dan routing Expo Router. Cari layar Admin di `(admin)`, Petugas di `(staff)`, Pasien di `(patient)`, dan login/registrasi di `(auth)`.
- `src/components/`: UI yang dipakai lebih dari satu halaman. `ui/` berisi tombol/form/header/kartu, `staff/` berisi item daftar khusus petugas, dan `display/` berisi papan antrean monitor.
- `src/services/`: logika fitur dan operasi data. File `*.service.ts` berisi alur bisnis, sedangkan `*.repository.ts` berisi akses Firestore. Keduanya berada di satu folder supaya mudah ditemukan.
- `src/hooks/`: React Hooks, penyedia tema MedicQ, dan Zustand store (`useAuthStore.ts`, `useQueueStore.ts`).
- `src/constants/`: satu lokasi untuk palet warna utama, daftar keluhan, dan pilihan poli (`poli-options.ts`).
- `src/types.ts`: tipe/model yang digunakan bersama oleh layar dan layanan.

## Mengubah tampilan tanpa menambah file style

- Teks, layout, dan style yang khusus untuk satu layar: ubah file screen pada `src/app/...`.
- Desain komponen yang dipakai banyak layar: ubah file komponen terkait, misalnya `src/components/ui/PrimaryButton.tsx`.
- Warna umum MedicQ: ubah nilai pada `src/constants/colors.ts` dan pilihan poli di `src/constants/poli-options.ts`. Palet `light` dan `dark` berada dalam objek `palette`; komponen yang memakai `useColors()` akan mengambil warna sesuai mode aktif.
- Warna papan monitor TV: ubah bagian `displayPalette` dalam file warna yang sama.
- Data antrean/layanan: logika ada pada file `*.service.ts`; operasi Firestore ada pada file `*.repository.ts` dalam folder `src/services/`.

## Tentang styling

Tidak ada file CSS terpisah untuk setiap halaman. Itu disengaja: `StyleSheet.create()` tetap ditempatkan di file halaman/komponen yang memakainya, seperti materi Modul 1. Nilai dinamis (misalnya warna dari tema atau rotasi ikon) boleh tetap diberikan melalui `style={[styles..., { ... }]}` atau inline jika bergantung pada state. `global.css` dan halaman Explore dari template Expo dibuang karena bukan bagian dari UI MedicQ; styling native Android/iOS tetap menggunakan React Native `StyleSheet`, bukan CSS biasa.

## Catatan aman

Import lokal memakai alias `@/` untuk menunjuk ke bagian `src/`. Jika memindahkan file, periksa import terkait sebelum menjalankan aplikasi. Konfigurasi Firebase dan alur data tidak sengaja diubah dalam refactor ini.
