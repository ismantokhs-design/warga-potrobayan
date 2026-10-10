# 🌾 Warga Potrobayan (PWA)

Aplikasi **Progressive Web App (PWA)** khusus untuk warga dan pengurus **Dusun Potrobayan** (Kalurahan Srihardono, Kapanewon Pundong, Kabupaten Bantul). Aplikasi ini dirancang untuk memudahkan penyampaian informasi, dokumentasi kegiatan, jadwal event/ronda, serta pengelolaan data internal dusun.

---

## ✨ Fitur Utama

- **🏠 Beranda:** Informasi sapaan warga dan pengumuman terbaru dusun.
- **📍 Profil Wilayah:** Informasi sejarah, potensi dusun, struktur pengurus, dan lokasi.
- **🖼️ Galeri:** Dokumentasi foto dan video kegiatan masyarakat (gotong royong, merti dusun, posyandu).
- **📅 Event & Agenda:** Kalender kegiatan dusun dan jadwal ronda malam.
- **⚙️ More (Menu Pengurus/Admin):**
  - **Pengaturan:** Konfigurasi sistem.
  - **Warga:** Pendaftaran akun warga baru & manajemen data kependudukan.
  - **Keuangan:** Pencatatan kas/iuran warga.
  - **Informasi:** Kelola & publikasi pengumuman.
  - **Laporan:** Rekapitulasi data & aduan warga.
- **📱 PWA Ready:** Dapat diinstal langsung di layar utama (Home Screen) HP Android/iOS dan dapat diakses secara *offline*.

---

## 📁 Struktur Folder Proyek

Aplikasi ini menggunakan struktur datar (tanpa folder `src`) untuk kemudahan pengelolaan dan performa langsung di browser:

```text
wargapotrobayan/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # Otomatisasi deploy ke GitHub Pages
│
├── assets/                     
│   ├── css/
│   │   └── style.css           # Styling antarmuka UI & Bottom Bar
│   └── js/
│       ├── app.js              # Logika navigasi Single Page Application & Role Check
│       └── firebase.js         # Konfigurasi & fungsi Firebase (Auth & Firestore)
│
├── icons/                      # Ikon PWA (192x192 & 512x512)
│   ├── icon-192.png
│   └── icon-512.png
│
├── pages/                      # Halaman modular aplikasi
│   ├── login.html              # Halaman Login Internal
│   ├── beranda.html            # Menu: Beranda
│   ├── profil-wilayah.html     # Menu: Profil Wilayah
│   ├── galeri.html             # Menu: Galeri
│   ├── event.html              # Menu: Event & Agenda
│   │
│   └── admin/                  # Menu: More (Khusus Pengurus/Admin)
│       ├── index.html          # Dashboard Menu More
│       ├── pengaturan.html     # Sub-menu Pengaturan
│       ├── warga.html          # Sub-menu Kelola Warga
│       ├── keuangan.html       # Sub-menu Keuangan Kas
│       ├── informasi.html      # Sub-menu Kelola Informasi
│       └── laporan.html        # Sub-menu Laporan & Aduan
│
├── .gitignore                  # Berkas yang diabaikan oleh Git
├── index.html                  # App Shell Utama (Kerangka UI & Bottom Bar)
├── manifest.json               # Konfigurasi Web App Manifest PWA
├── package.json                # Server lokal & scripts pendukung
├── README.md                   # Dokumentasi proyek
└── sw.js                       # Service Worker (Offline Support)