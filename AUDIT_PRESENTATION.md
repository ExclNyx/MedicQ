# MedicQ — audit stabilitas presentasi

## Perubahan pada versi ini

- Notifikasi sistem, push notification, dan haptic dinonaktifkan sementara agar Expo Go tidak memuat `expo-notifications` saat runtime.
- Route login pasien diarahkan ke **Akses Pasien** terlebih dahulu; pasien baru masuk Home setelah nomor antrean tersedia.
- Role yang tidak valid tidak lagi dialihkan ke route pasien/petugas lain. Role harus persis `patient`, `staff`, atau `admin` di `users/{UID}`.
- Navigasi otomatis setelah antrean dibuat dijaga agar snapshot Firestore berulang tidak memanggil `router.replace` berulang kali.
- Hook antrean mempertahankan listener queue saat `queueId` dan `serviceId` tidak berubah, untuk menghindari kartu antrean kosong sesaat saat registration snapshot diperbarui.
- Listener Firestore memiliki callback error supaya masalah izin/index/koneksi tidak hanya menghasilkan uncaught snapshot listener.
- Query utama pendaftaran/antrean pada mode presentasi menyaring dan mengurutkan dataset kecil di sisi aplikasi agar mengurangi ketergantungan composite index.
- React Compiler eksperimental dinonaktifkan untuk mengurangi variabel saat debugging.
- File route duplikat `src/app/[slug].tsx` tidak ada; route dinamis Admin tetap di `src/app/(admin)/[slug].tsx`.

## Cara menjalankan

1. Hentikan server Expo lama (`Ctrl+C`) dan tutup sesi aplikasi lama di Expo Go.
2. Ekstrak ZIP ini ke **folder baru**, jangan menimpa/menyatukan file dengan folder MedicQ lama.
3. Buka folder yang memiliki `package.json`, `app.json`, dan `src/` di VS Code.
4. Jalankan:

```bash
npm install
npx expo start -c
```

5. Scan QR menggunakan Expo Go.

## Pemeriksaan yang dilakukan

- JSON konfigurasi valid.
- 81 file TypeScript/TSX berhasil ditranspilasi untuk pemeriksaan sintaks tanpa error.
- Tidak ditemukan import relatif yang putus.
- Semua file route memiliki default export.
- Tidak ada import runtime `expo-notifications` di source selain service no-op.
- `package.json` dan root dependency declarations di `package-lock.json` konsisten.

Pemeriksaan di atas adalah pemeriksaan statis. Aplikasi belum bisa dijalankan di HP pengguna dari lingkungan audit ini, sehingga tes akhir di perangkat tetap diperlukan.

## Batasan mode presentasi

Penyaringan/penyortiran lokal cocok untuk data demo yang kecil, bukan data produksi besar. Firestore Rules yang sudah dipublikasikan di Firebase Console tidak diubah otomatis hanya dengan mengekstrak ZIP. Jangan gunakan data pasien nyata untuk presentasi jika Rules masih mengizinkan pembacaan publik pada collection `queues`, karena dokumen queue saat ini menyimpan informasi identitas. Untuk produksi, pisahkan data display queue yang tidak sensitif dari data queue internal.
