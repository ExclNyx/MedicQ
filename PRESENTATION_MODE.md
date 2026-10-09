# MedicQ — mode presentasi Expo Go

## Yang dinonaktifkan sementara
- Notifikasi sistem / push notification
- Haptic / getaran saat antrean berubah

## Yang tetap berjalan
- Firebase Authentication
- Pembacaan dan pemantauan pendaftaran melalui Firestore listener
- Pembaruan status dan posisi antrean di UI selama listener/query diizinkan Rules dan koneksi tersedia
- Alur halaman pasien, petugas, dan admin yang sudah ada di project

Notifikasi sengaja dijadikan no-op agar aplikasi tidak mengimpor `expo-notifications` saat runtime Expo Go. Untuk mengaktifkan notifikasi lagi nanti, gunakan Development Build dan integrasikan service notifikasi setelah alur antrean utama stabil.

## Menjalankan project
```bash
npm install
npx expo start -c
```

Query penting dalam mode presentasi memakai filter satu-field dan penyortiran di aplikasi untuk mengurangi kebutuhan composite index. Firestore Rules tetap harus mengizinkan operasi tersebut. Untuk data produksi, pindahkan filter/sort ke query terindeks dan deploy index yang sesuai.


## Stabilitas presentasi
- Login pasien masuk ke Akses Pasien terlebih dahulu, bukan langsung ke Home yang mensyaratkan nomor antrean.
- Role yang tidak valid tidak akan dipetakan otomatis sebagai pasien/petugas; login akan menampilkan pesan untuk memperbaiki users/{UID}.
- React Compiler eksperimental dinonaktifkan pada konfigurasi presentasi untuk mengurangi variabel saat debugging.
- Query Firestore demo menggunakan filter lokal pada dataset kecil untuk menghindari kebutuhan composite index di jalur utama; ini bukan pola yang disarankan untuk dataset produksi besar.
