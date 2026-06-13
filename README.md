# Sistem Manajemen Cuti (Leave Management System) API

Sistem Manajemen Cuti ini adalah sebuah *RESTful API Backend* yang dirancang untuk memfasilitasi proses pengajuan cuti karyawan dan sistem persetujuan (Approval) oleh pihak Admin/HRD. Dibangun menggunakan **AdonisJS v5 (TypeScript)**, sistem ini mengedepankan keamanan, skalabilitas, dan integritas data yang ketat.

---

## 📖 Postman Documentation

Dokumentasi lengkap mengenai *endpoint*, parameter, struktur *request/response*, dan skenario pengujian dapat diakses melalui tautan Postman API Documentation publik berikut:

👉 **[Published Postman Documentation](https://www.postman.com/dark-meadow-68816/workspace/public/collection/27641235-82ad93fd-64c0-417e-b470-32a5dc207275?action=share&source=copy-link&creator=27641235)**

---

## ⚙️ Panduan Instalasi dan Setup Lingkungan (.env)

Prasyarat sebelum memulai:
- **Node.js** (v14 atau lebih baru)
- **PostgreSQL** (Service database berjalan)

### Langkah Instalasi:

1. **Clone Repositori & Instalasi Dependensi**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment (.env)**
   Salin file `.env.example` menjadi `.env`.
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan sesuaikan konfigurasi koneksi PostgreSQL dan kredensial Google OAuth:
   ```env
   PORT=5000
   HOST=0.0.0.0
   NODE_ENV=development
   APP_KEY= # (Bisa di-generate ulang dengan perintah: node ace generate:key)
   DB_CONNECTION=pg
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=password_database_anda
   PG_DB_NAME=sistem_cuti_db

   # GOOGLE OAUTH CREDENTIALS
   GOOGLE_CLIENT_ID=client_id_milik_anda
   GOOGLE_CLIENT_SECRET=secret_id_milik_anda
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. **Migrasi dan Seeding Database**
   Sistem ini dilengkapi dengan migrasi skema tabel dan *Seeder* untuk membuat akun *Admin* dan *Employee* bawaan.
   ```bash
   node ace migration:run
   node ace db:seed
   ```
   *(Data Seeder Default: admin@example.com / password123 & employee@example.com / password123).*

4. **Menjalankan Server**
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000`.

---

## 🏛️ Arsitektur Sistem dan Alur Logika Bisnis

Sistem ini tidak sekadar menyediakan operasi CRUD (Create, Read, Update, Delete) biasa. Di baliknya, terdapat implementasi berbagai lapisan pelindung dan logika algoritma terstruktur.

### 1. Pola Arsitektur (Architecture Pattern)
Aplikasi ini mengadaptasi pola **MVC (Model-View-Controller)** yang dimodifikasi khusus untuk REST API. Semua lapisan dipisahkan secara tegas berdasarkan fungsinya (*Separation of Concerns*). Validasi diletakkan di *layer* pertama Controller menggunakan Adonis Validator (berbasis *Schema*), sehingga *malformed data* akan ditolak dalam hitungan milidetik sebelum menyentuh lapisan *Business Logic*.

### 2. Dual Authentication System
Sistem mendukung dua mode masuk (Login):
- **Konvensional:** Autentikasi berbasis email dan sandi (*hashing* yang sangat aman menggunakan driver `phc-bcrypt`).
- **Google OAuth 2.0:** Menggunakan Adonis Ally terintegrasi dengan proteksi *State Mismatch* guna menangkal serangan *Cross-Site Request Forgery (CSRF)* pada tahapan proses *callback* *handshake*.
- **Token Management:** Menggunakan standar *Opaque Tokens* yang diregistrasikan ke dalam relasi database sehingga sesi bisa dimatikan (*revoked*) kapan saja dari sisi server (Logout).

### 3. Role-Based Access Control (RBAC) Guard
*Endpoint* API dilindungi oleh lapisan *Middleware* yang diprogram sedemikian rupa untuk mengenali token siapa yang sedang mengakses rute tersebut.
- Rute `/api/leave-requests` hanya bisa ditembus oleh token **Employee**.
- Rute `/api/admin/*` memiliki dinding tebal yang murni hanya mengizinkan *role* **Admin**. *Employee* yang mencoba menembak API ini akan dilemparkan status `403 Forbidden`.

### 4. Integritas Data Cuti (Advanced Business Logic)
Pengelolaan cuti rentan terhadap *bug/spamming* jika hanya mengandalkan perhitungan manual dasar. Oleh karena itu, aplikasi mengadopsi mekanisme **Deferred Leave Deduction** (Penundaan Pemotongan Saldo) dengan algoritma proteksi anti-spam:

- Saat Karyawan mengajukan cuti, saldo (`leaveLimit`) **TIDAK langsung dipotong**. Pengajuan hanya disimpan dalam status `pending`.
- **Spam Protection:** Untuk mencegah karyawan dengan limit 12 hari mengirim sepuluh pengajuan berturut-turut masing-masing 10 hari, Controller menghitung secara dinamis:
  `Total Hari Diajukan = (Seluruh hari cuti berstatus "Pending" di DB) + (Hari di pengajuan yang baru)`. Jika kalkulasi melebihi *leaveLimit* saat itu, API memblokir request.
- **ACID Database Transaction:** Saat Admin menekan *Approve*, proses pengurangan saldo user dan pengubahan status cuti dilakukan dalam satu ruang **Database Transaction**. Jika salah satu proses gagal di tengah jalan (misal: koneksi terputus), *Transaction* akan melakukan *Rollback* otomatis untuk mencegah terjadinya *Phantom Data* (contoh: status *approved* tapi sisa cuti karyawan gagal terpotong).

### 5. Algoritma Filter & Pagination Berkinerja Tinggi
Pada API milik Admin (`GET /api/admin/leave-requests`), diterapkan fitur filter *Query Builder* tingkat lanjut menggunakan pola *Eager Loading* (`.preload()`). 
Sistem menggabungkan teknik pencarian parsial *Case-Insensitive* berbasis SQL (`LOWER(name) LIKE`), fungsi ekstraksi komponen waktu (`EXTRACT(MONTH FROM ...)`), serta Pagination yang efisien dan siap menampung ribuan rekaman historis tanpa menyiksa memori server.
