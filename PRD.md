# PRD: PuskesmasQueue — Sistem Registrasi dan Antrean Puskesmas Realtime

---

## 1. Latar Belakang

Puskesmas tradisional mengandalkan sistem antrean manual (kertas/papan tulis), yang mengakibatkan:
- Pasien bingung tentang posisi mereka dalam antrean
- Tidak ada notifikasi saat nomor dipanggil → pasien terlewat
- Petugas kesulitan mengelola antrean lintas poli
- Tidak ada data digital untuk analisis kunjungan

**PuskesmasQueue** mendigitalkan antrean dengan notifikasi realtime, verifikasi identitas, dan display board TV untuk ruang tunggu.

---

## 2. Tujuan Produk

1. Mengurangi waktu tunggu pasien dengan antrean transparan dan notifikasi realtime
2. Membantu petugas mengelola alur pasien (verifikasi → penentuan poli → layanan)
3. Mencegah antrean palsu melalui verifikasi identitas digital
4. Menyediakan display board TV real-time untuk ruang tunggu
5. Mengumpulkan data kunjungan untuk laporan dan analisis operasional

---

## 3. Pengguna

| Tipe | Deskripsi | Platform |
|------|-----------|----------|
| **Pasien** | Warga yang datang berobat ke puskesmas; mendaftar, memantau antrean, menerima notifikasi | Mobile (Android/iOS via Expo) |
| **Petugas** | Staff puskesmas yang memverifikasi pasien, mencatat keluhan, menentukan poli, dan memanggil nomor antrean | Mobile (Android/iOS via Expo) |
| **Admin/Staff Senior** | (Future) Dashboard untuk konfigurasi poli, laporan, dan manajemen petugas | Web (Expo Web) |
| **Display Board** | Sistem display untuk TV ruang tunggu yang menampilkan nomor yang dipanggil dan antrean berikutnya | Web/Kiosk |

---

## 4. Fitur Utama

### 4.1 Fitur Pasien (F-P)

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| **F-P01** | Registrasi Akun | Pasien mendaftar dengan email/no HP dan kata sandi. Verifikasi email/OTP (opsional untuk v1.0). |
| **F-P02** | Lengkapi Data Diri | Pasien mengisi NIK, nama lengkap, tanggal lahir, jenis kelamin, alamat, dan nomor telepon. |
| **F-P03** | Daftar Kunjungan | Pasien klik "Daftar Kunjungan Baru" untuk hari ini. Status awal: `REGISTRATION_PENDING`. |
| **F-P04** | Pilih Keluhan (Complaint) | Pasien memilih 1+ keluhan dari daftar (Demam, Batuk, Pusing, Nyeri, Luka, Pencernaan, Sesak, Kulit, Mata, Lainnya). |
| **F-P05** | Pantau Status Antrean | Pasien melihat status realtime: nomor antrean, posisi dalam antrian, siapa yang sedang dilayani, dan estimasi waktu tunggu. |
| **F-P06** | Notifikasi + Haptics | Pasien menerima: (1) warning haptics saat nomor di depan dipanggil, (2) success haptics + notification saat nomor mereka dipanggil. |
| **F-P07** | Riwayat Kunjungan | Pasien melihat daftar kunjungan sebelumnya (tanggal, poli, diagnosis jika tersedia). |
| **F-P08** | Logout/Ganti Profil | Pasien dapat logout atau ganti profil. |

### 4.2 Fitur Petugas (F-ST)

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| **F-ST01** | Login Petugas | Petugas login dengan akun yang role-nya diubah ke `"staff"` di Firebase Firestore. |
| **F-ST02** | Dashboard Verifikasi | Petugas melihat tab "Verifikasi" dengan daftar `REGISTRATION_PENDING` dan `VERIFIED` (menunggu pilih poli). |
| **F-ST03** | Verifikasi Pasien | Petugas klik pasien → lihat data diri (NIK, nama, tanggal lahir) → klik "Verifikasi" untuk ubah status ke `VERIFIED`. |
| **F-ST04** | Pencatatan Keluhan | Petugas melihat keluhan yang dipilih pasien, dapat menambah catatan khusus, dan pilih poli tujuan (Poli Umum, Gigi, KIA, Lansia, Lainnya). |
| **F-ST05** | Buat Nomor Antrean | Saat petugas selesai verifikasi + pilih poli, sistem otomatis buat antrean dengan nomor (format: `[KODE_POLI]-[SEQUENCE]`, misal `A-027`). Status berubah ke `QUEUED`. |
| **F-ST06** | Dashboard Antrean Poli | Petugas melihat tab "Antrean Poli" dengan: antrean saat ini (SERVING), daftar tunggu (WAITING), filter per poli. |
| **F-ST07** | Panggil Nomor Berikutnya | Petugas klik "PANGGIL BERIKUTNYA" → status pasien berubah ke `CALLED` → notifikasi + haptics dikirim ke pasien → TV display update realtime. |
| **F-ST08** | Panggil Ulang | Petugas klik "Panggil Ulang" untuk pasien yang tidak hadir → nomor tetap di antrean. |
| **F-ST09** | Tandai Selesai | Petugas klik "Selesai" → status pasien berubah ke `COMPLETED`. |
| **F-ST10** | Lewati Pasien | Petugas klik "Lewati" → status pasien berubah ke `SKIPPED`, nomor tidak keluar lagi. |
| **F-ST11** | Registrasi Manual | Petugas dapat registrasi pasien yang tidak pakai aplikasi: isi NIK, nama, pilih keluhan, pilih poli → langsung buat nomor antrean. Status: `QUEUED` langsung (skip verifikasi). Ditandai `isManual: true`. |

### 4.3 Fitur Display Board (F-D)

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| **F-D01** | Tampilan Nomor Dipanggil | Display menampilkan nomor yang sedang dilayani (SERVING) dalam huruf besar + warna menonjol. |
| **F-D02** | Daftar Berikutnya | Display menampilkan 5–10 nomor berikutnya dalam antrean (status WAITING) dalam urutan sequence. |
| **F-D03** | Update Realtime | Saat petugas "PANGGIL BERIKUTNYA", display otomatis update dalam <1 detik (via Firestore listener). |
| **F-D04** | Suara/Notifikasi (Future) | (Out of scope v1.0) Speaker untuk panggilan audio nomor yang dipanggil. |

### 4.4 Fitur Sistem (F-SYS)

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| **F-SYS01** | State Synchronization | Zustand (client) + Firestore (server) menjaga data tetap konsisten di semua perangkat/aplikasi. |
| **F-SYS02** | Offline Resilience | Aplikasi tetap menampilkan data terakhir saat offline; sync otomatis saat online kembali. |
| **F-SYS03** | Firestore Security Rules | Hanya pasien sendiri dapat baca data mereka; petugas dapat baca/update antrean poli mereka; display hanya baca data publik. |

---

## 5. Alur Utama

### Alur A: Pasien Mendaftar dan Mendapat Nomor Antrean

1. Pasien login → Home Screen
2. Klik "DAFTAR KUNJUNGAN BARU" → Status = `REGISTRATION_PENDING`
3. Pilih 1+ keluhan → Submit
4. Pasien tunggu di ruang tunggu (status: PENDING VERIFIKASI)
5. Petugas buka dashboard → Tab "Verifikasi"
6. Petugas klik pasien → lihat data → Verifikasi → Status = `VERIFIED`
7. Petugas pilih poli tujuan → Buat Antrean → Nomor A-027 muncul di aplikasi pasien
8. Status pasien: `QUEUED` → realtime monitor antrean

---

### Alur B: Petugas Memanggil Antrean

1. Petugas buka Tab "Antrean Poli" → pilih poli
2. Lihat "Sedang Dilayani: A-025 (Asep)" dengan tombol "PANGGIL BERIKUTNYA (A-026)"
3. Petugas klik tombol → Status A-026 (Ratna) berubah ke `CALLED`
4. **TV Display**: A-026 naik jadi "Sedang Dilayani"; daftar berikutnya update
5. **Notifikasi Pasien**: Ratna terima warning haptics (saat nomor sebelum dipanggil), lalu success haptics + notification saat nomor mereka dipanggil
6. Ratna datang → Petugas klik "Selesai" → Status = `COMPLETED` → Nomor A-026 hilang dari antrean

---

### Alur C: Display Board TV Realtime

1. TV di ruang tunggu buka halaman `/display`
2. Tampil: "Sedang Dilayani: A-025" (besar, highlight) + "Berikutnya: A-026, A-027, A-028, ..." (kecil)
3. Setiap kali petugas "PANGGIL BERIKUTNYA" → Display otomatis update dalam <1 detik
4. Pasien di ruang tunggu lihat nomor mereka di layar → tahu kapan giliran

---

## 6. Tech Stack

| Lapisan | Teknologi | Alasan |
|---------|-----------|--------|
| **Frontend** | Expo + React Native 0.86 | Cross-platform (iOS/Android), rapid development, single codebase |
| **Navigation** | Expo Router v4 | File-based routing, typed routes, nested layouts untuk auth/staff/patient/display |
| **State Mgmt** | Zustand | Lightweight, minimal boilerplate, mudah sync dengan Firestore |
| **Backend** | Firebase (Realtime) | Auth, Firestore (NoSQL), Messaging (notifikasi), Haptics (expo-haptics) |
| **Auth** | Firebase Auth + Secure Store | Email/password, token aman di device storage |
| **Notifications** | Firebase Messaging + expo-notifications | Push notifikasi + local haptics |
| **Haptics** | expo-haptics | Vibration feedback saat nomor dipanggil |
| **UI Components** | React Native + react-native-paper | Material Design 3, accessible, responsive |
| **Linting** | expo lint | Static code quality |
| **Typechecking** | TypeScript + tsc | Type safety end-to-end |

---

## 7. Skema Database (Firestore)

### Collections & Documents

| Collection | Document | Tujuan |
|-----------|----------|--------|
| **users** | `{uid}` | Profile pengguna (email, nama, role: patient/staff, verificationStatus). |
| **patients** | `{patientId}` | Data diri pasien (NIK, nama, DOB, gender, address, phone, isVerified, createdAt). |
| **services** | `{serviceId}` (poli_umum, poli_gigi, kia, lansia, poli_lainnya) | Master data poli (name, code, isActive, currentServing). |
| **registrations** | `{registrationId}` | Catatan kunjungan pasien (patientId, visitDate, status, complaints[], complaintNote, serviceId, queueId, staffId, isManual, createdAt). |
| **queues** | `{queueId}` | Nomor antrean (queueNumber "A-027", patientId, serviceId, visitDate, status, sequenceNumber, timestamps). |
| **staffSchedules** | `{staffId}_{date}` | (Future) Jadwal petugas per poli. |
| **settings** | `{key}` | Konfigurasi sistem (nextQueueSequence per poli, operatingHours). |

---

## 8. Batasan Sistem (Scope v1.0)

### ✅ Dalam Scope

- 3 aktor: Pasien, Petugas, Display Board
- Registrasi dan login dengan Firebase Auth
- Real-time antrean dengan Firestore listeners
- Notifikasi lokal + haptics (expo-notifications, expo-haptics)
- Registrasi manual oleh petugas
- Verifikasi identitas data diri
- Display board untuk TV ruang tunggu
- Multi-poli (Umum, Gigi, KIA, Lansia, Lainnya)

### ❌ Out of Scope v1.0

- Dashboard admin (laporan, manajemen petugas, konfigurasi sistem) → future web portal
- Notifikasi audio/speaker di ruang tunggu → future dengan backend server
- SMS/WhatsApp reminder → future integration
- AI scheduling/predictive analytics → future
- Multi-branch/cabang → single puskesmas v1.0
- Appointment booking (hanya same-day kunjungan untuk v1.0)
- Pembayaran/billing → future integration dengan sistem keuangan
- Multi-language → Indonesian only v1.0
- Offline-first sync (basic offline view, tidak full offline mode)

---

## 9. Rencana Pengembangan Bertahap

| Fase | Target | Fitur Prioritas | Target Eksekusi |
|------|--------|-----------------|-----------------|
| **P1: MVP Auth + Pasien** | Login, lengkapi data, daftar kunjungan | F-P01, F-P02, F-P03, F-P04, F-P05 | Sprint 1–2 |
| **P2: Petugas + Verifikasi** | Dashboard petugas, verifikasi, pencatatan keluhan, antrean | F-ST01–F-ST05, F-ST08–F-ST10 | Sprint 3–4 |
| **P3: Notifikasi + Haptics** | Push notification, haptic feedback saat dipanggil | F-P06, F-SYS01 | Sprint 5 |
| **P4: Display Board** | TV display realtime untuk ruang tunggu | F-D01–F-D03, F-SYS03 | Sprint 6 |
| **P5: Registrasi Manual + Refinement** | Petugas input pasien manual, polish UI/UX | F-ST11, bugfix, performance | Sprint 7–8 |
| **P6: Testing + Release** | E2E testing, security review, GA release | Load testing, security audit | Sprint 9–10 |

---

## 10. Kriteria Selesai (Definition of Done)

### Code Quality
- [ ] TypeScript strict mode, zero errors pada `tsc --noEmit`
- [ ] Linting pass: `expo lint` no warnings
- [ ] React Compiler enabled, no issues

### Testing
- [ ] Fitur F-P01–F-P08 ditest manual di Android/iOS device
- [ ] Fitur F-ST01–F-ST11 ditest manual di emulator
- [ ] Display board F-D01–D03 ditest di browser web
- [ ] Notifikasi + haptics F-P06 ditest di real device dengan demo push

### Performance
- [ ] Queue update <1 detik dari aksi petugas ke display
- [ ] App launch time <3 detik
- [ ] Zero memory leaks pada long session (1+ jam)

### Security
- [ ] Firebase security rules validated; pasien hanya baca data mereka
- [ ] Token stored di Secure Store, bukan AsyncStorage
- [ ] Passwords hashed via Firebase Auth
- [ ] No secrets hardcoded di source

### UX/UI
- [ ] Responsive layout di semua ukuran (320px–1920px)
- [ ] 44px+ tap targets, WCAG AA contrast minimum
- [ ] Loading states dan error messages jelas
- [ ] Navigasi intuitif (flow A, B, C teruji)

### Deployment
- [ ] Expo config valid; build tanpa error
- [ ] Firebase project + Firestore rules setup di production
- [ ] APK/IPA distributable via EAS
- [ ] Release notes + user manual tersedia

---

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| **Firestore quota/cost meningkat** | Budget membengkak jika realtime listeners tidak optimal | Batch queries, index creation, implement rate limiting, monitor billing |
| **Firebase outage** | Antrean tidak berfungsi saat down | Graceful offline mode (read cache), komunikasi IT puskesmas |
| **Notifikasi terlambat** | Pasien terlewat panggilan | FCM testing comprehensif, fallback UI polling (optional), device testing |
| **Data corruption** | Nomor antrean duplikat/hilang | Firestore transactions untuk atomicity, backup + recovery plan |
| **Petugas salah input data pasien** | Verifikasi gagal, antrean kacau | Validation rules, UI hints, confirm dialog sebelum buat antrean |
| **Scalability: 100+ pasien/hari** | App slow, Firestore throttle | Load testing early, pagination antrean, archival strategy untuk registrations lama |
| **Device compatibility** | Beberapa device tidak support Firebase SDK | Target Android API 26+, iOS 13.4+, test di 3+ devices |
| **Privacy data NIK terekspos** | GDPR/data protection breach | Firestore rules strict, encryption at rest via Firebase, audit log |

---

## 12. Kesimpulan

**PuskesmasQueue v1.0** adalah sistem antrean puskesmas realtime dengan core features: registrasi pasien, verifikasi petugas, antrean digital, notifikasi haptics, dan display board TV. Dibangun dengan Expo + Firebase untuk kecepatan delivery dan maintainability. Roadmap 10 sprint menuju GA release dengan fokus pada reliability, security, dan UX.
