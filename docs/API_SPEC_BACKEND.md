# Spesifikasi API Backend — MaturCapil Semarang

> **Dokumen implementasi resmi backend:** `MaturCapilBackend/docs/API_DOCUMENTATION.md`  
> Frontend terintegrasi via `ApiDataProvider` + `src/services/` saat `VITE_USE_MOCK_API=false`.

Dokumen ini untuk tim **Backend** (salinan kontrak awal). Frontend (`MaturCapilFrontend`) memakai layer service di `src/services/` dengan asumsi kontrak di bawah ini.

**Base URL (contoh):** `https://api.example.com/api/v1`  
**Env FE:** `VITE_API_BASE_URL`

---

## Konvensi umum

### Autentikasi

- Header: `Authorization: Bearer {access_token}`
- Endpoint publik (login, register, OTP): tanpa token
- Login admin vs warga dibedakan field `portal`: `"citizen"` | `"admin"`

### Format response (wajib konsisten)

**Sukses (HTTP 2xx):**

```json
{
  "success": true,
  "message": "Pesan opsional",
  "data": {}
}
```

**Gagal validasi / bisnis (HTTP 4xx):**

```json
{
  "success": false,
  "message": "Pesan error utama",
  "errors": {
    "email": ["Email sudah terdaftar."]
  }
}
```

**Khusus batas laporan (email belum verifikasi):**

```json
{
  "success": false,
  "message": "Anda hanya dapat membuat 1 laporan sebelum email diverifikasi.",
  "needs_email_verification": true
}
```

FE juga menerima camelCase alternatif (`needsEmailVerification`, `accessToken`) lalu dinormalisasi.

### Pagination (disarankan untuk list)

```json
{
  "success": true,
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "per_page": 20,
      "total": 100
    }
  }
}
```

FE juga menerima `data` berupa array langsung.

### Field naming

- Request body: **snake_case** (`category_id`, `password_confirmation`)
- Response: snake_case disarankan; FE mapper mendukung camelCase

### Validasi bisnis (harus di BE)

| Field | Aturan |
|--------|--------|
| NIK | 16 digit angka, unik |
| Password | Min 8 karakter, ≥1 angka, ≥1 huruf besar |
| OTP | 6 digit, expired 5 menit, max kirim ulang 3x, cooldown kirim ulang 60 detik |
| Foto laporan | Maks 3 file, maks 5MB/file, JPG/PNG |
| Email warga belum verifikasi | Maks **1** laporan aktif |

### RBAC

- Role: `Masyarakat`, `Admin`, `Super Admin`
- Admin punya array `permissions` (kode string)
- Super Admin: semua permission
- Setiap endpoint admin harus cek permission di server (FE hanya menyembunyikan UI)

**Daftar permission:**

```
dashboard.view
complaint.verify
complaint.reject
complaint.close
complaint.export
user.view
user.create
user.update
user.delete
category.manage
auditlog.view
```

### Masking NIK/email

- Admin biasa: BE boleh mengembalikan NIK/email sudah di-mask
- Super Admin: data lengkap
- Atau: BE kirim lengkap + header; FE mask di client (saat ini FE mask sendiri untuk admin non-super)

---

## Tipe data referensi

### User

```json
{
  "id": "usr-1",
  "name": "Budi Santoso",
  "email": "citizen@maturcapil.id",
  "role": "Masyarakat",
  "nik": "3374012345678901",
  "status": "ACTIVE",
  "email_verified": true,
  "email_verified_at": "2026-05-01T08:00:00Z",
  "permissions": [],
  "created_at": "2026-05-01T08:00:00Z",
  "deleted_at": null,
  "deleted_by": null
}
```

`status`: `ACTIVE` | `INACTIVE` | `SUSPENDED`

### Category

```json
{
  "id": "ktp",
  "name": "KTP-el",
  "code": "KTP",
  "description": "Pengaduan KTP elektronik",
  "is_active": true,
  "deleted_at": null,
  "deleted_by": null
}
```

### Complaint

```json
{
  "id": "comp-1",
  "ticket_number": "TKT-2026-0001",
  "user_id": "usr-1",
  "user_name": "Budi Santoso",
  "title": "Judul aduan",
  "description": "Deskripsi lengkap",
  "category_id": "ktp",
  "status": "Menunggu Verifikasi",
  "priority": "Sedang",
  "latitude": -6.9822,
  "longitude": 110.4091,
  "address": "Kota Semarang",
  "created_at": "2026-05-15T08:12:00Z",
  "photos": ["https://cdn.../photo1.jpg"],
  "evidence_after_photos": [],
  "resolution_note": "",
  "resolved_at": null
}
```

**Status aduan:** `Menunggu Verifikasi` | `Diproses` | `Selesai` | `Ditolak`  
**Prioritas:** `Tinggi` | `Sedang` | `Rendah`

### Status log

```json
{
  "id": "log-1",
  "complaint_id": "comp-1",
  "status": "Menunggu Verifikasi",
  "note": "Aduan berhasil diajukan oleh masyarakat.",
  "changed_by": "Budi Santoso",
  "created_at": "2026-05-15T08:12:00Z"
}
```

### Chat message

```json
{
  "id": "chat-1",
  "complaint_id": "comp-1",
  "sender_id": "usr-1",
  "sender_name": "Budi Santoso",
  "message": "Isi pesan",
  "created_at": "2026-05-15T08:15:00Z"
}
```

### Audit log

```json
{
  "id": "audit-1",
  "user_id": "usr-2",
  "user_name": "Siti Aminah",
  "action": "VERIFY_COMPLAINT",
  "table_name": "complaints",
  "record_id": "comp-1",
  "detail": "Menyetujui laporan ...",
  "ip_address": "192.168.1.10",
  "created_at": "2026-05-15T08:20:00Z"
}
```

**Action audit (disarankan):**  
`LOGIN`, `LOGOUT`, `VERIFY_COMPLAINT`, `REJECT_COMPLAINT`, `CLOSE_COMPLAINT`, `UPDATE_STATUS`, `CREATE_USER`, `UPDATE_USER`, `DEACTIVATE_USER`, `RESET_PASSWORD`, `PERMISSION_CHANGE`, `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY`

---

## 1. Autentikasi & sesi

### POST `/auth/login`

Login portal warga atau admin.

**Auth:** tidak

**Body:**

```json
{
  "email": "citizen@maturcapil.id",
  "password": "Password1",
  "portal": "citizen"
}
```

| Field | Tipe | Keterangan |
|--------|------|------------|
| email | string | Wajib |
| password | string | Wajib |
| portal | string | `citizen` → role Masyarakat; `admin` → Admin / Super Admin |

**Response 200:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": { }
  }
}
```

**Error contoh:**

| HTTP | message |
|------|---------|
| 401 | Email atau password salah |
| 403 | Akun dinonaktifkan |
| 403 | Gunakan Portal Admin / Portal Warga (role tidak cocok) |

---

### POST `/auth/logout`

**Auth:** ya

**Body:** kosong

**Response 200:**

```json
{ "success": true, "message": "Logout berhasil" }
```

---

### GET `/auth/me`

Profil user dari token.

**Auth:** ya

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "usr-1",
    "name": "Budi Santoso",
    "email": "citizen@maturcapil.id",
    "role": "Masyarakat",
    "nik": "3374012345678901",
    "status": "ACTIVE",
    "email_verified": true,
    "permissions": []
  }
}
```

---

### POST `/auth/register`

Langkah 1 registrasi warga — simpan data sementara, kirim OTP email.

**Auth:** tidak

**Body:**

```json
{
  "name": "Nama Lengkap",
  "nik": "3374012345678901",
  "email": "baru@email.com",
  "password": "Password1",
  "password_confirmation": "Password1"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Kode OTP telah dikirim ke email Anda. Berlaku 5 menit.",
  "data": {
    "email": "baru@email.com"
  }
}
```

**Error:** email/NIK duplikat, validasi password/NIK

---

### POST `/auth/register/verify-otp`

Langkah 2 — aktivasi akun.

**Auth:** tidak

**Body:**

```json
{
  "email": "baru@email.com",
  "otp": "123456"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": "usr-new",
      "role": "Masyarakat",
      "email_verified": true,
      "email_verified_at": "2026-05-23T10:00:00Z"
    }
  }
}
```

---

### POST `/auth/register/resend-otp`

**Auth:** tidak

**Body:**

```json
{ "email": "baru@email.com" }
```

**Response 200:**

```json
{ "success": true, "message": "OTP baru telah dikirim." }
```

**Error:** sesi registrasi tidak ada, OTP expired, batas 3x kirim ulang, cooldown 60 detik

---

### POST `/auth/email/send-otp`

Kirim OTP verifikasi email untuk user **sudah login** tapi `email_verified = false`.

**Auth:** ya (Masyarakat)

**Body:** kosong

**Response 200:**

```json
{ "success": true, "message": "OTP dikirim ke email Anda." }
```

---

### POST `/auth/email/resend-otp`

**Auth:** ya

**Body:** kosong

**Response:** sama seperti resend registrasi

---

### POST `/auth/email/verify`

**Auth:** ya

**Body:**

```json
{ "otp": "123456" }
```

**Response 200:**

```json
{
  "success": true,
  "message": "Email terverifikasi",
  "data": {
    "user": {
      "id": "usr-1",
      "email_verified": true,
      "email_verified_at": "2026-05-23T10:00:00Z"
    }
  }
}
```

---

## 2. Pengaduan (Complaints)

### GET `/complaints`

**Auth:** ya

**Query (opsional):**

| Param | Keterangan |
|--------|------------|
| user_id | Filter milik warga tertentu (admin) |
| status | `Menunggu Verifikasi`, `Diproses`, dll |
| category_id | Filter kategori |
| priority | `Tinggi` / `Sedang` / `Rendah` |
| search | Judul, ticket_number, deskripsi, user_name |
| page, per_page | Pagination |

**Perilaku:**

- **Masyarakat:** hanya laporan sendiri
- **Admin:** semua (sesuai permission)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [ { } ],
    "meta": { "page": 1, "per_page": 20, "total": 4 }
  }
}
```

---

### GET `/complaints/:id`

Detail satu laporan + boleh include relasi.

**Auth:** ya (pemilik atau admin)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "comp-1",
    "ticket_number": "TKT-2026-0001",
    "title": "...",
    "status": "Diproses",
    "photos": [],
    "evidence_after_photos": []
  }
}
```

---

### POST `/complaints`

Buat laporan baru.

**Auth:** ya (Masyarakat, email_verified atau belum — lihat batas)

**Content-Type:** `multipart/form-data` (jika ada file) **atau** `application/json`

**Form / JSON fields:**

| Field | Tipe | Wajib |
|--------|------|--------|
| title | string | ya |
| description | string | ya |
| category_id | string | ya |
| priority | string | default `Sedang` |
| latitude | number | ya |
| longitude | number | ya |
| address | string | ya |
| photos[] | file[] | opsional, max 3 |

**JSON alternatif (tanpa upload file):**

```json
{
  "title": "Judul",
  "description": "Deskripsi",
  "category_id": "ktp",
  "priority": "Sedang",
  "latitude": -6.9822,
  "longitude": 110.4091,
  "address": "Kota Semarang",
  "photos": ["https://..."]
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Aduan berhasil dikirim",
  "data": {
    "id": "comp-5",
    "ticket_number": "TKT-2026-0005",
    "status": "Menunggu Verifikasi",
    "created_at": "2026-05-23T10:00:00Z"
  }
}
```

**Error 403 + needs_email_verification:** warga belum verifikasi dan sudah punya ≥1 laporan

**Side effect BE:** buat status log awal; (opsional) notifikasi

---

### PATCH `/complaints/:id/status`

Verifikasi / tolak / ubah status oleh admin.

**Auth:** ya — permission `complaint.verify` atau `complaint.reject`

**Body:**

```json
{
  "status": "Diproses",
  "note": "Laporan diverifikasi dan diteruskan ke operator."
}
```

| status | Permission | Keterangan FE |
|--------|------------|----------------|
| Diproses | complaint.verify | Tombol "Verifikasi" |
| Ditolak | complaint.reject | Tombol tolak + alasan |
| lainnya | complaint.verify | Update umum |

**Response 200:**

```json
{
  "success": true,
  "data": { "id": "comp-1", "status": "Diproses" }
}
```

**Side effect:** status log + audit log (`VERIFY_COMPLAINT` / `REJECT_COMPLAINT` / `UPDATE_STATUS`)

---

### POST `/complaints/:id/close`

Menyelesaikan aduan.

**Auth:** ya — permission `complaint.close`

**Body:**

```json
{
  "resolution_note": "KTP telah dicetak dan diserahkan.",
  "evidence_after_photos": ["https://cdn.../after1.jpg"]
}
```

Atau multipart untuk upload bukti perbaikan.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "comp-1",
    "status": "Selesai",
    "resolution_note": "...",
    "resolved_at": "2026-05-23T12:00:00Z",
    "evidence_after_photos": []
  }
}
```

**Side effect:** status log + audit `CLOSE_COMPLAINT`

---

### GET `/complaints/:id/status-logs`

**Auth:** ya

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "complaint_id": "comp-1",
      "status": "Menunggu Verifikasi",
      "note": "...",
      "changed_by": "Budi Santoso",
      "created_at": "2026-05-15T08:12:00Z"
    }
  ]
}
```

---

### GET `/complaints/:id/chats`

**Auth:** ya (pemilik atau admin)

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "chat-1",
      "complaint_id": "comp-1",
      "sender_id": "usr-1",
      "sender_name": "Budi Santoso",
      "message": "Pesan",
      "created_at": "2026-05-15T08:15:00Z"
    }
  ]
}
```

---

### POST `/complaints/:id/chats`

**Auth:** ya

**Body:**

```json
{ "message": "Isi pesan chat" }
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "chat-2",
    "complaint_id": "comp-1",
    "sender_id": "usr-2",
    "sender_name": "Siti Aminah",
    "message": "Isi pesan chat",
    "created_at": "2026-05-15T08:16:00Z"
  }
}
```

---

## 3. Kategori layanan

### GET `/categories`

**Auth:** ya

**Query:** `include_inactive=true` (admin), `active_only=true` (warga — default hanya `is_active=true` dan tidak soft-deleted)

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ktp",
      "name": "KTP-el",
      "code": "KTP",
      "description": "...",
      "is_active": true,
      "deleted_at": null
    }
  ]
}
```

---

### POST `/categories`

**Auth:** ya — `category.manage`

**Body:**

```json
{
  "name": "KTP-el",
  "code": "KTP",
  "description": "Pengaduan KTP elektronik"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": { "id": "ktp", "name": "KTP-el", "code": "KTP", "is_active": true }
}
```

---

### PATCH `/categories/:id`

**Auth:** ya — `category.manage`

**Body:** partial `{ "name", "code", "description", "is_active" }`

**Response 200:** data kategori terbarui

---

### DELETE `/categories/:id`

Soft delete (nonaktifkan).

**Auth:** ya — `category.manage`

**Response 200:**

```json
{ "success": true, "message": "Kategori dinonaktifkan" }
```

Set `is_active: false`, `deleted_at`, `deleted_by`

---

## 4. Manajemen user (Admin)

### GET `/users`

**Auth:** ya — `user.view`

**Query:**

| Param | Keterangan |
|--------|------------|
| role | `Masyarakat` \| `Admin` (Super Admin ikut filter Admin) |
| search | nama, email, NIK |
| status | ACTIVE / INACTIVE / SUSPENDED |
| page, per_page | pagination |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "usr-1",
        "name": "Budi Santoso",
        "email": "citizen@maturcapil.id",
        "role": "Masyarakat",
        "nik": "3374********8901",
        "status": "ACTIVE",
        "email_verified": true,
        "created_at": "2026-05-01T08:00:00Z"
      }
    ]
  }
}
```

**Catatan:** jangan kembalikan field `password`

---

### GET `/users/:id`

Detail user + (opsional) ringkasan riwayat pengaduan.

**Auth:** ya — `user.view`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "usr-1",
    "name": "Budi Santoso",
    "email": "citizen@maturcapil.id",
    "role": "Masyarakat",
    "nik": "3374012345678901",
    "status": "ACTIVE",
    "email_verified": true
  }
}
```

---

### POST `/users/citizens`

Tambah warga oleh admin.

**Auth:** ya — `user.create`

**Body:**

```json
{
  "name": "Nama Warga",
  "email": "warga@email.com",
  "nik": "3374012345678901",
  "password": "Password1"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "usr-new",
    "role": "Masyarakat",
    "email_verified": false,
    "status": "ACTIVE"
  }
}
```

---

### POST `/users/admins`

**Auth:** ya — `user.create` (biasanya Super Admin)

**Body:**

```json
{
  "name": "Admin Baru",
  "email": "admin@email.com",
  "password": "Password1",
  "nik": "3374023456789012",
  "permissions": [
    "dashboard.view",
    "complaint.verify",
    "complaint.reject",
    "complaint.close"
  ]
}
```

**Response 201:** data user Admin

---

### PATCH `/users/:id`

**Auth:** ya — `user.update`

**Body (partial):**

```json
{
  "name": "Nama Baru",
  "email": "email@baru.com",
  "nik": "3374012345678901",
  "status": "ACTIVE"
}
```

**Response 200:** user terbarui

---

### DELETE `/users/:id`

Nonaktifkan akun (soft delete).

**Auth:** ya — `user.delete`

**Response 200:**

```json
{ "success": true, "message": "Akun dinonaktifkan" }
```

---

### POST `/users/:id/reset-password`

**Auth:** ya — `user.update`

**Body:**

```json
{
  "password": "PasswordBaru1",
  "force_reset": true
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Password direset. Email notifikasi terkirim."
}
```

---

### PUT `/users/:id/permissions`

**Auth:** ya — hanya **Super Admin**

**Body:**

```json
{
  "permissions": [
    "dashboard.view",
    "complaint.verify",
    "user.view"
  ]
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "usr-4",
    "role": "Admin",
    "permissions": ["dashboard.view", "complaint.verify", "user.view"]
  }
}
```

---

## 5. Audit log

### GET `/audit-logs`

**Auth:** ya — `auditlog.view`

**Query:**

| Param | Keterangan |
|--------|------------|
| action | LOGIN, VERIFY_COMPLAINT, ... |
| search | user_name, detail, record_id, ip |
| date_from, date_to | ISO date |
| page, per_page | pagination |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "audit-1",
        "user_id": "usr-2",
        "user_name": "Siti Aminah",
        "action": "VERIFY_COMPLAINT",
        "table_name": "complaints",
        "record_id": "comp-1",
        "detail": "Menyetujui laporan ...",
        "ip_address": "192.168.1.10",
        "created_at": "2026-05-15T08:20:00Z"
      }
    ]
  }
}
```

Log **immutable** (tidak ada UPDATE/DELETE dari API).

---

### GET `/audit-logs/export`

Export CSV dengan filter sama seperti list.

**Auth:** ya — `auditlog.view`

**Response:** `Content-Type: text/csv`, file download

**Header CSV (disarankan):**  
`ID Log, Petugas, Aksi, Tabel, ID Record, IP, Keterangan, Waktu`

---

## 6. Endpoint opsional (belum di service, berguna untuk optimasi)

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/dashboard/stats` | Agregat: total/pending/processed/resolved, trend harian, per kategori, per prioritas |
| GET | `/complaints/export` | Export aduan CSV — permission `complaint.export` |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Reset password (UI saat ini placeholder alert) |

---

## 7. Ringkasan daftar endpoint

| # | Method | Path | Auth | Permission / Role |
|---|--------|------|------|------------------|
| 1 | POST | `/auth/login` | - | - |
| 2 | POST | `/auth/logout` | ✓ | - |
| 3 | GET | `/auth/me` | ✓ | - |
| 4 | POST | `/auth/register` | - | - |
| 5 | POST | `/auth/register/verify-otp` | - | - |
| 6 | POST | `/auth/register/resend-otp` | - | - |
| 7 | POST | `/auth/email/send-otp` | ✓ | Masyarakat |
| 8 | POST | `/auth/email/resend-otp` | ✓ | Masyarakat |
| 9 | POST | `/auth/email/verify` | ✓ | Masyarakat |
| 10 | GET | `/complaints` | ✓ | scope by role |
| 11 | GET | `/complaints/:id` | ✓ | owner/admin |
| 12 | POST | `/complaints` | ✓ | Masyarakat |
| 13 | PATCH | `/complaints/:id/status` | ✓ | verify/reject |
| 14 | POST | `/complaints/:id/close` | ✓ | complaint.close |
| 15 | GET | `/complaints/:id/status-logs` | ✓ | - |
| 16 | GET | `/complaints/:id/chats` | ✓ | - |
| 17 | POST | `/complaints/:id/chats` | ✓ | - |
| 18 | GET | `/categories` | ✓ | - |
| 19 | POST | `/categories` | ✓ | category.manage |
| 20 | PATCH | `/categories/:id` | ✓ | category.manage |
| 21 | DELETE | `/categories/:id` | ✓ | category.manage |
| 22 | GET | `/users` | ✓ | user.view |
| 23 | GET | `/users/:id` | ✓ | user.view |
| 24 | POST | `/users/citizens` | ✓ | user.create |
| 25 | POST | `/users/admins` | ✓ | user.create |
| 26 | PATCH | `/users/:id` | ✓ | user.update |
| 27 | DELETE | `/users/:id` | ✓ | user.delete |
| 28 | POST | `/users/:id/reset-password` | ✓ | user.update |
| 29 | PUT | `/users/:id/permissions` | ✓ | Super Admin |
| 30 | GET | `/audit-logs` | ✓ | auditlog.view |
| 31 | GET | `/audit-logs/export` | ✓ | auditlog.view |

---

## 8. Referensi di repo frontend

| File | Isi |
|------|-----|
| `src/services/*.js` | Implementasi pemanggilan API |
| `src/services/endpoints.js` | Daftar path singkat |
| `src/services/mappers.js` | Normalisasi response |
| `.env.example` | `VITE_API_BASE_URL`, `VITE_USE_MOCK_API` |

**Versi dokumen:** 2026-05-23 — selaras dengan mock frontend MaturCapil Semarang.
