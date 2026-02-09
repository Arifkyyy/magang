# 🔌 PLN ICON+ Sistem Monitoring Magang — Backend API

Backend untuk aplikasi monitoring magang PLN ICON+ menggunakan **Node.js + Express + MongoDB**.

---

## 📋 Arsitektur

```
pln-magang-monitoring/
├── backend/
│   ├── server.js              # Entry point
│   ├── seed.js                # Script pengisian data awal
│   ├── .env                   # Konfigurasi environment
│   ├── package.json
│   ├── models/
│   │   ├── User.js            # Model user (admin & peserta)
│   │   ├── WorkLog.js         # Model log pekerjaan
│   │   ├── Attendance.js      # Model absensi
│   │   ├── Complaint.js       # Model keluhan/kendala
│   │   └── QRCode.js          # Model QR Code absensi
│   ├── routes/
│   │   ├── auth.js            # Login, register, profil
│   │   ├── users.js           # CRUD peserta (admin)
│   │   ├── workLogs.js        # Log pekerjaan (draft & final)
│   │   ├── attendance.js      # Absensi scan QR
│   │   ├── complaints.js      # Keluhan/kendala
│   │   ├── qrcode.js          # Generate & kelola QR
│   │   └── dashboard.js       # Statistik dashboard
│   └── middleware/
│       └── auth.js            # JWT middleware & role check
└── pln-magang/
    ├── js/
    │   ├── api.js             # ⭐ API connector (baru)
    │   └── app.js             # Logic frontend
    ├── login.html
    ├── regist.html
    ├── dashboarduser.html
    ├── dashboardadmin.html
    └── ... (halaman lainnya)
```

---

## 🚀 Cara Menjalankan

### 1. Install MongoDB
Pastikan MongoDB sudah terinstall dan berjalan:
```bash
# macOS
brew install mongodb-community && brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb && sudo systemctl start mongod

# Atau gunakan MongoDB Atlas (cloud) — ganti MONGODB_URI di .env
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Konfigurasi Environment
Edit file `backend/.env` sesuai kebutuhan:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pln_magang_monitoring
JWT_SECRET=pln-iconplus-magang-secret-key-2026
JWT_EXPIRES_IN=7d
```

### 4. Isi Data Awal (Seed)
```bash
npm run seed
```
Output:
```
✅ Connected to MongoDB
👤 Admin accounts created
👥 7 peserta magang created
📝 56 work logs created
📅 35 attendance records created
💬 4 complaints created
🎉 Seed complete!
```

### 5. Jalankan Server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server berjalan di: **http://localhost:5000**

---

## 🔑 Akun Login

| Role  | Email                          | Password  |
|-------|--------------------------------|-----------|
| Admin | admin@plniconplus.co.id        | admin123  |
| Admin | superadmin@plniconplus.co.id   | super123  |
| User  | ahmad.rizki@mail.com           | user123   |
| User  | siti.nur@mail.com              | user123   |
| User  | budi.santoso@mail.com          | user123   |
| User  | dewi.lestari@mail.com          | user123   |
| User  | eko.prasetyo@mail.com          | user123   |
| User  | fitri.h@mail.com               | user123   |
| User  | gilang.p@mail.com              | user123   |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Deskripsi           | Auth |
|--------|----------------------|---------------------|------|
| POST   | /api/auth/register   | Daftar akun baru    | ❌   |
| POST   | /api/auth/login      | Login               | ❌   |
| GET    | /api/auth/me         | Profil sendiri      | ✅   |
| PUT    | /api/auth/profile    | Update profil       | ✅   |

### Users (Admin)
| Method | Endpoint          | Deskripsi           | Auth  |
|--------|-------------------|---------------------|-------|
| GET    | /api/users        | List semua peserta  | Admin |
| GET    | /api/users/:id    | Detail peserta      | Admin |
| POST   | /api/users        | Tambah peserta      | Admin |
| PUT    | /api/users/:id    | Edit peserta        | Admin |
| DELETE | /api/users/:id    | Hapus peserta       | Admin |

### Work Logs
| Method | Endpoint                    | Deskripsi              | Auth |
|--------|-----------------------------|------------------------|------|
| GET    | /api/work-logs              | List log pekerjaan     | ✅   |
| POST   | /api/work-logs              | Buat log (draft/final) | ✅   |
| PUT    | /api/work-logs/:id          | Edit log               | ✅   |
| PUT    | /api/work-logs/:id/submit   | Submit draft → final   | ✅   |
| DELETE | /api/work-logs/:id          | Hapus log              | ✅   |
| GET    | /api/work-logs/stats/me     | Statistik pribadi      | ✅   |

### Attendance
| Method | Endpoint                    | Deskripsi              | Auth  |
|--------|-----------------------------|------------------------|-------|
| GET    | /api/attendance             | Riwayat absensi        | ✅    |
| POST   | /api/attendance/scan        | Scan QR untuk absen    | ✅    |
| PUT    | /api/attendance/:id/checkout| Clock out              | ✅    |
| GET    | /api/attendance/today       | Kehadiran hari ini     | Admin |

### Complaints
| Method | Endpoint                     | Deskripsi              | Auth  |
|--------|------------------------------|------------------------|-------|
| GET    | /api/complaints              | List keluhan           | ✅    |
| POST   | /api/complaints              | Buat keluhan           | ✅    |
| PUT    | /api/complaints/:id/status   | Update status keluhan  | Admin |
| GET    | /api/complaints/stats        | Statistik keluhan      | Admin |

### QR Code (Admin)
| Method | Endpoint               | Deskripsi              | Auth  |
|--------|------------------------|------------------------|-------|
| POST   | /api/qrcode/generate   | Generate QR harian     | Admin |
| GET    | /api/qrcode/today      | QR aktif hari ini      | Admin |
| GET    | /api/qrcode/history    | Riwayat 7 hari         | Admin |

### Dashboard
| Method | Endpoint              | Deskripsi              | Auth  |
|--------|-----------------------|------------------------|-------|
| GET    | /api/dashboard/admin  | Statistik admin        | Admin |
| GET    | /api/dashboard/user   | Statistik user         | ✅    |

---

## 🔒 Sistem Role

### User (Peserta Magang)
- Login & register
- Input pekerjaan harian (draft → final)
- Absensi via QR scan
- Laporan kendala
- Lihat profil & statistik sendiri

### Admin
- Semua fitur user
- Dashboard monitoring (statistik semua peserta)
- Kelola data peserta (CRUD)
- Generate QR Code harian
- Kelola keluhan (update status)
- Log aktivitas semua peserta
- Export data

---

## 🔧 Teknologi

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT (JSON Web Token) + bcrypt
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Charts:** Chart.js
- **QR Code:** qrcode.js
