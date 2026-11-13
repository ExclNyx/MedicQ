# Panduan Modifikasi Demo MedicQ

Gunakan ini sebagai peta cepat saat demo Modul 1–2.

| Permintaan | Mulai dari file |
|---|---|
| Ubah teks atau jarak khusus halaman login | `src/app/(auth)/login.tsx` |
| Ubah layout dashboard Admin | `src/app/(admin)/dashboard.tsx` |
| Ubah layout/tombol dashboard Petugas | `src/app/(staff)/dashboard.tsx` |
| Ubah layout halaman pasien | file terkait di `src/app/(patient)/` |
| Ubah desain tombol utama yang dipakai banyak halaman | `src/components/ui/PrimaryButton.tsx` |
| Ubah desain tombol sekunder | `src/components/ui/OutlineButton.tsx` |
| Ubah komponen input bersama | `src/components/ui/FormField.tsx` |
| Ubah palet warna umum | `src/constants/colors.ts` → `palette.light` dan `palette.dark` |
| Ubah warna papan monitor | `src/constants/colors.ts` → `displayPalette` |
| Ubah daftar/kode poli | `src/constants/poli-options.ts` |
| Ubah daftar keluhan | `src/constants/complaints.ts` |
| Ubah proses login/logout | `src/services/auth.service.ts` |
| Ubah aturan antrean/panggil berikutnya | `src/services/queue.service.ts` |
| Ubah cara membaca/menulis data antrean | `src/services/queue.repository.ts` |
| Ubah pemantauan antrean realtime | `src/hooks/usePatientQueue.ts` atau `src/hooks/useStaffQueue.ts` |
| Ubah navigasi/layout role | `_layout.tsx` dalam grup route yang sesuai |

## Pola `StyleSheet.create()`

Style khusus layar/komponen tetap di file itu:

```tsx
const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
});
```

Lalu dipakai seperti ini:

```tsx
<View style={styles.card}>
  <Text>Isi kartu</Text>
</View>
```

Tidak perlu membuat `styles.ts` atau CSS baru untuk setiap layar. File style terpisah hanya diperlukan bila ada kebutuhan berbagi style lintas banyak file.

## Kenapa perubahan warna bisa error?

1. Pastikan mengubah sumber warna yang benar: warna umum ada di `src/constants/colors.ts`.
2. Tombol gradasi memakai tiga token (`primaryLight`, `primary`, `primaryDeep`), sehingga mengubah satu token saja tidak mengganti seluruh gradasi.
3. Kalau mengganti nama properti style, semua pengguna `styles.namaStyle` harus mengikuti nama baru.
4. React Native memakai `backgroundColor`, bukan CSS `background-color`.
5. Untuk warna dinamis, gunakan `const c = useColors()` di dalam komponen lalu terapkan melalui style.

`StyleSheet.create()` yang banyak bukan berarti banyak file CSS. Style tetap berada di file halaman/komponen supaya mudah dicari dan dimodifikasi.
