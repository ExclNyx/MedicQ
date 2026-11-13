## Panduan Register Android App di Firebase Console

### Step 1: Buka Firebase Console
1. Buka browser → https://console.firebase.google.com/
2. Login dengan akun yang punya akses ke project **MedicQ**
3. Klik project **MedicQ** dari list

### Step 2: Add Android App
1. Di halaman **Project Overview**, klik ikon **Android** atau tombol **Add app**
2. Jika sudah ada app lain, klik **Add app** → pilih **Android**

### Step 3: Register App Form
Isi form berikut:

**Android package name:**  
```
com.medicq.app
```
(PENTING: harus persis seperti ini, sudah match dengan app.json)

**App nickname (optional):**  
```
MedicQ Android
```

**Debug signing certificate SHA-1 (optional):**  
*Skip dulu, kosongkan*

Klik **Register app**

### Step 4: Download google-services.json
1. Setelah register, akan muncul tombol **Download google-services.json**
2. Klik tombol tersebut
3. File akan terdownload ke folder Downloads

### Step 5: Copy File ke Project
**Opsi A - Manual:**
- Buka folder Downloads
- Copy file `google-services.json`
- Paste ke folder: `C:\Users\LENOVO\Documents\semester 5\pem.mobile\MedicQ\`
- Replace file yang sudah ada

**Opsi B - Paste Content di Chat:**
- Buka file `google-services.json` dengan Notepad
- Copy seluruh isi file
- Paste di chat ini, saya akan update otomatis

### Step 6: Enable Firebase Services
Di sidebar kiri Firebase Console:

**Authentication:**
1. Klik **Authentication**
2. Klik **Get started** (jika belum aktif)
3. Tab **Sign-in method**
4. Klik **Email/Password**
5. Toggle switch **Enable**
6. Klik **Save**

**Firestore Database:**
1. Klik **Firestore Database**
2. Klik **Create database**
3. Pilih mode: **Start in test mode**
4. Location: pilih **asia-southeast1** atau **asia-southeast2**
5. Klik **Enable**

**Cloud Messaging:**
- Otomatis aktif, tidak perlu setting tambahan

---

## Setelah Selesai
Konfirmasi di chat:
- ✅ File google-services.json sudah di-copy
- ✅ Authentication enabled
- ✅ Firestore Database created
- ✅ Cloud Messaging ready

Saya akan lanjut build & verify connection.
