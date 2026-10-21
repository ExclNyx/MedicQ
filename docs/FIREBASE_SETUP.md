# Setup Firebase untuk MedicQ (Android)

## Status: ⚠️ Perlu Kredensial Firebase

### Yang Sudah Dikonfigurasi:
✅ Package name: `com.medicq.app`  
✅ Firebase plugins di `app.json`  
✅ Implementasi Auth, Firestore, Messaging di `firebase.ts`  
✅ Template `google-services.json` (placeholder)

### Yang Perlu Dilakukan:

#### 1. Buka Firebase Console
- URL: https://console.firebase.google.com/
- Pilih project **MedicQ**
- Jika project belum ada, klik **Add project** → nama: **MedicQ** → ikuti wizard

#### 2. Register Android App
- **Project Overview** → klik **Add app** → pilih **Android**
- **Android package name**: `com.medicq.app` (sudah match dengan app.json)
- **App nickname** (optional): MedicQ Android
- **Debug signing certificate SHA-1** (optional, skip dulu): kosongkan
- Klik **Register app**

#### 3. Download google-services.json
- Setelah register, Firebase Console akan tampilkan tombol **Download google-services.json**
- Download file tersebut
- **Replace** file `google-services.json` di root folder MedicQ dengan file yang baru didownload

#### 4. Enable Firebase Services
Di Firebase Console → **Build** menu (sidebar kiri):

##### Authentication:
- Klik **Authentication** → **Get started**
- Tab **Sign-in method** → Enable **Email/Password**

##### Firestore Database:
- Klik **Firestore Database** → **Create database**
- Mode: **Start in test mode** (untuk development)
- Location: pilih yang terdekat (asia-southeast1 atau asia-southeast2)
- Klik **Enable**

##### Cloud Messaging (Push Notifications):
- Klik **Cloud Messaging** → tab **Settings**
- **Cloud Messaging API** sudah otomatis aktif di project baru
- Simpan **Server key** jika perlu untuk backend (optional)

#### 5. Verify Setup
Setelah replace `google-services.json`:

```bash
cd "C:/Users/LENOVO/Documents/semester 5/pem.mobile/MedicQ"
npx expo prebuild --clean
npx expo run:android
```

#### 6. Test Connection
Setelah app running, cek log:
- Console akan tampilkan **FCM Token** jika Firebase tersambung
- Test register akun baru lewat app
- Cek di Firebase Console → **Authentication** → **Users** → harus muncul user baru

---

## Struktur File Firebase

```
MedicQ/
├── google-services.json          ← kredensial Firebase (JANGAN commit ke git!)
├── app.json                      ← config package & plugins
└── src/
    └── core/
        └── config/
            └── firebase.ts       ← Auth, Firestore, Messaging instances
```

## Troubleshooting

### Error: "google-services.json is not valid"
- Pastikan file di-download dari Firebase Console, bukan edit manual
- Package name di file harus `com.medicq.app`

### Error: "Firebase has not been initialized"
- Run `npx expo prebuild --clean` untuk regenerate native code
- Clean build: `cd android && ./gradlew clean && cd ..`

### Push notification tidak muncul
- Cek permission di device Settings → Apps → MedicQ → Notifications
- Call `requestNotificationPermission()` di app startup

---

**File yang perlu di-update:**  
`google-services.json` (replace dengan file asli dari Firebase Console)
