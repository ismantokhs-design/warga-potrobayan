/* ==========================================================================
   1. REGISTRASI SERVICE WORKER (PWA SUPPORT)
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW Registered:', reg.scope))
      .catch((err) => console.error('SW Error:', err));
  });
}

/* ==========================================================================
   2. IMPORT FIREBASE AUTH, LOGOUT & DATA USER (JALUR PRESISI)
   ========================================================================== */
import { 
  monitorAuthState, 
  logoutUser, 
  createUserByAdmin, 
  updateUserByAdmin, 
  deleteUserByAdmin, 
  getAllUsers 
} from './firebase.js';

let currentUserRole = {
  isLoggedIn: false,
  isAdmin: false,
  userData: null
};

document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  const logoutModal = document.getElementById('logout-modal');
  const btnCancel = document.getElementById('btn-cancel-logout');
  const btnConfirm = document.getElementById('btn-confirm-logout');

  // Buka Modal Logout
  if (btnLogout && logoutModal) {
    btnLogout.addEventListener('click', () => {
      logoutModal.classList.add('active');
    });
  }

  // Tutup Modal Logout
  if (btnCancel && logoutModal) {
    btnCancel.addEventListener('click', () => {
      logoutModal.classList.remove('active');
    });

    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) {
        logoutModal.classList.remove('active');
      }
    });
  }

  // Eksekusi Logout
  if (btnConfirm) {
    btnConfirm.addEventListener('click', async () => {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = 'Memproses...';

      const res = await logoutUser();
      if (res.success) {
        window.location.replace('pages/login.html');
      } else {
        alert('Terjadi kesalahan saat logout, silakan coba lagi.');
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = 'Ya, Keluar';
        logoutModal.classList.remove('active');
      }
    });
  }

  // Monitor status autentikasi real-time
  monitorAuthState((user, isAdmin, userData) => {
    if (!user) {
      window.location.replace('pages/login.html');
    } else {
      currentUserRole.isLoggedIn = true;
      currentUserRole.isAdmin = isAdmin;
      currentUserRole.userData = userData;

      checkAdminAccess();
      loadPage('beranda');
    }
  });
});

/* ==========================================================================
   3. MANAJEMEN NAVIGASI UTAMA & HAK AKSES
   ========================================================================== */
function checkAdminAccess() {
  const btnMore = document.getElementById('nav-more');
  if (!btnMore) return;

  if (currentUserRole.isLoggedIn && currentUserRole.isAdmin) {
    btnMore.classList.remove('hidden');
  } else {
    btnMore.classList.add('hidden');
  }
}

window.navigateTo = function(pageKey, element) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  
  if (element) {
    element.classList.add('active');
  }

  loadPage(pageKey);
};

function loadPage(pageKey) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.classList.remove('page-transition');
  void mainContent.offsetWidth; // Trigger reflow
  mainContent.classList.add('page-transition');

  switch (pageKey) {
    case 'beranda':
      const namaUser = currentUserRole.userData ? currentUserRole.userData.nama : 'Warga';
      mainContent.innerHTML = `
        <div class="card">
          <h2>📢 Pengumuman Dusun</h2>
          <p>Halo <strong>${namaUser}</strong>, selamat datang di Aplikasi Warga Dusun Potrobayan. Dapatkan informasi terbaru seputar kegiatan warga di sini.</p>
        </div>
      `;
      break;

    case 'profil':
      mainContent.innerHTML = `
        <div class="card">
          <h2>📍 Profil Wilayah Potrobayan</h2>
          <p>Dusun Potrobayan terletak di wilayah yang asri dengan kebudayaan gotong royong yang kuat.</p>
        </div>
      `;
      break;

    case 'galeri':
      mainContent.innerHTML = `
        <div class="card">
          <h2>🖼️ Galeri Kegiatan</h2>
          <p>Dokumentasi foto dan video kegiatan warga Dusun Potrobayan.</p>
        </div>
      `;
      break;

    case 'event':
      mainContent.innerHTML = `
        <div class="card">
          <h2>📅 Agenda & Event Dusun</h2>
          <p>Jadwal kerjabakti, posyandu, dan kumpulan warga mendatang.</p>
        </div>
      `;
      break;

    case 'more':
      if (!currentUserRole.isAdmin) {
        mainContent.innerHTML = `<div class="card"><p>Akses terbatas. Halaman ini khusus Pengurus Dusun.</p></div>`;
        return;
      }

      mainContent.innerHTML = `
        <div class="card">
          <h2 style="font-size: 1.15rem; margin-bottom: 16px; color: #0f172a;">⚙️ Menu Lainnya</h2>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            
            <div onclick="loadSubAdminPage('pengaturan')" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center; cursor: pointer;">
              <div style="font-size: 1.8rem; margin-bottom: 6px;">⚙️</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Pengaturan</div>
              <div style="font-size: 0.725rem; color: #64748b; margin-top: 2px;">Akun & Wilayah</div>
            </div>

            <div onclick="loadSubAdminPage('warga')" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center; cursor: pointer;">
              <div style="font-size: 1.8rem; margin-bottom: 6px;">👥</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Data Warga</div>
              <div style="font-size: 0.725rem; color: #64748b; margin-top: 2px;">Daftar Kependudukan</div>
            </div>

            <div onclick="loadSubAdminPage('keuangan')" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center; cursor: pointer;">
              <div style="font-size: 1.8rem; margin-bottom: 6px;">💰</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Keuangan</div>
              <div style="font-size: 0.725rem; color: #64748b; margin-top: 2px;">Kas & Iuran Warga</div>
            </div>

            <div onclick="loadSubAdminPage('informasi')" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center; cursor: pointer;">
              <div style="font-size: 1.8rem; margin-bottom: 6px;">ℹ️</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">Informasi</div>
              <div style="font-size: 0.725rem; color: #64748b; margin-top: 2px;">Berita Dusun</div>
            </div>

          </div>
        </div>
      `;
      break;

    default:
      mainContent.innerHTML = `<div class="card"><p>Halaman tidak ditemukan.</p></div>`;
  }
}

/* ==========================================================================
   4. SUB-MENU DI DALAM MORE
   ========================================================================== */
window.loadSubAdminPage = async function(subPageKey) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.classList.remove('page-transition');
  void mainContent.offsetWidth;
  mainContent.classList.add('page-transition');

  if (subPageKey === 'pengaturan') {
    mainContent.innerHTML = `
      <div style="margin-bottom: 15px;">
        <button class="btn-back" onclick="navigateTo('more', document.getElementById('nav-more'))">
          ← Kembali ke More
        </button>
      </div>

      <div class="card">
        <h2 style="font-size: 1.1rem; margin-bottom: 6px; color: #0f172a;">⚙️ Pengaturan Aplikasi</h2>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 20px;">Kelola akun login dan konfigurasi aplikasi Dusun Potrobayan.</p>

        <div style="display: flex; flex-direction: column; gap: 12px;">

          <button onclick="loadSubAdminPage('setting-akun')" style="display: flex; align-items: center; gap: 12px; width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
            <span style="font-size: 1.4rem; background: #ecfdf5; width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">👤</span>
            <div style="flex: 1;">
              <div style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">Setting User & Akun</div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">Tambah & kelola hak akses user login</div>
            </div>
            <span style="color: #94a3b8; font-size: 0.85rem;">➔</span>
          </button>

          <button onclick="loadSubAdminPage('setting-profil-wilayah')" style="display: flex; align-items: center; gap: 12px; width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; cursor: pointer; text-align: left; transition: all 0.2s ease;">
            <span style="font-size: 1.4rem; background: #f0f9ff; width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">📍</span>
            <div style="flex: 1;">
              <div style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">Profil Wilayah</div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">Pengaturan informasi & deskripsi dusun</div>
            </div>
            <span style="color: #94a3b8; font-size: 0.85rem;">➔</span>
          </button>

        </div>
      </div>
    `;

  } else if (subPageKey === 'setting-akun') {
    mainContent.innerHTML = `
      <div style="margin-bottom: 15px;">
        <button class="btn-back" onclick="loadSubAdminPage('pengaturan')">
          ← Kembali ke Pengaturan
        </button>
      </div>

      <div class="card form-card" style="margin-bottom: 20px;">
        <div class="form-header">
          <div class="form-icon-bg">👤</div>
          <div>
            <h2 class="form-title">Pendaftaran Akun Login</h2>
            <p class="form-subtitle">Buat akun login baru dan tentukan hak akses (role) pengguna.</p>
          </div>
        </div>

        <div id="form-error-msg" class="alert alert-danger hidden"></div>
        <div id="form-success-msg" class="alert alert-success hidden"></div>

        <form id="add-user-form" autocomplete="off">
          
          <div class="form-group">
            <label class="form-label">Nama Lengkap Pengguna</label>
            <div class="input-container">
              <span class="field-icon">👤</span>
              <input type="text" id="user-nama" required class="custom-input" placeholder="cth: Budi Santoso">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Login</label>
            <div class="input-container">
              <span class="field-icon">📧</span>
              <input type="email" id="user-email" required class="custom-input" placeholder="nama@potrobayan.id">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kata Sandi</label>
            <div class="input-container">
              <span class="field-icon">🔒</span>
              <input type="password" id="user-password" required minlength="6" class="custom-input" placeholder="Minimal 6 karakter">
              <button type="button" id="toggle-pwd-btn" class="toggle-eye-btn" title="Tampilkan Kata Sandi">
                👁️
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Hak Akses / Role</label>
            <div class="input-container">
              <span class="field-icon">🛡️</span>
              <select id="user-role" class="custom-input custom-select">
                <option value="admin">Administrator System (Akses Penuh)</option>
                <option value="pengurus">Pengurus Dusun (Akses Fitur RT/RW)</option>
                <option value="warga">Warga Biasa (Akses Standar)</option>
              </select>
            </div>
          </div>

          <button type="submit" id="btn-save-user" class="btn-submit">
            Daftarkan Akun
          </button>

        </form>
      </div>

      <div class="card">
        <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 10px; color: #0f172a;">📋 Daftar Akun Terdaftar</h2>
        
        <div id="users-loading" style="text-align: center; padding: 15px; color: var(--text-muted); font-size: 0.85rem;">
          Memuat data user...
        </div>

        <div id="users-list-container"></div>
      </div>

      <div id="edit-user-modal" class="modal-overlay">
        <div class="modal-card" style="max-width: 360px; text-align: left; padding: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 1.1rem; color: #0f172a;">✏️ Edit Data Akun</h3>
          <form id="edit-user-form">
            <input type="hidden" id="edit-user-id">
            <div class="form-group">
              <label class="form-label">Nama Pengguna</label>
              <input type="text" id="edit-user-nama" required class="custom-input" style="padding-left: 14px;">
            </div>
            <div class="form-group">
              <label class="form-label">Hak Akses / Role</label>
              <select id="edit-user-role" class="custom-input custom-select" style="padding-left: 14px;">
                <option value="admin">Administrator System</option>
                <option value="pengurus">Pengurus Dusun</option>
                <option value="warga">Warga Biasa</option>
              </select>
            </div>
            <div class="modal-actions" style="margin-top: 16px;">
              <button type="button" id="btn-cancel-edit" class="btn-modal btn-cancel">Batal</button>
              <button type="submit" id="btn-save-edit" class="btn-modal btn-confirm" style="background: var(--primary-color);">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    await renderUsersList();

    const pwdInput = document.getElementById('user-password');
    const toggleBtn = document.getElementById('toggle-pwd-btn');
    if (toggleBtn && pwdInput) {
      toggleBtn.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
      });
    }

    const form = document.getElementById('add-user-form');
    const errorMsg = document.getElementById('form-error-msg');
    const successMsg = document.getElementById('form-success-msg');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSave = document.getElementById('btn-save-user');
        btnSave.disabled = true;
        btnSave.innerText = 'Memproses Pendaftaran...';
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');

        const userData = {
          nama: document.getElementById('user-nama').value.trim(),
          email: document.getElementById('user-email').value.trim(),
          password: document.getElementById('user-password').value,
          role: document.getElementById('user-role').value
        };

        const res = await createUserByAdmin(userData);

        if (res.success) {
          successMsg.innerText = `Akun untuk ${userData.nama} berhasil didaftarkan!`;
          successMsg.classList.remove('hidden');
          form.reset();
          btnSave.disabled = false;
          btnSave.innerText = 'Daftarkan Akun';
          await renderUsersList();
        } else {
          errorMsg.innerText = res.error;
          errorMsg.classList.remove('hidden');
          btnSave.disabled = false;
          btnSave.innerText = 'Daftarkan Akun';
        }
      });
    }

    const editModal = document.getElementById('edit-user-modal');
    const editForm = document.getElementById('edit-user-form');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    if (btnCancelEdit && editModal) {
      btnCancelEdit.addEventListener('click', () => editModal.classList.remove('active'));
    }

    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uid = document.getElementById('edit-user-id').value;
        const updateData = {
          nama: document.getElementById('edit-user-nama').value.trim(),
          role: document.getElementById('edit-user-role').value
        };

        const res = await updateUserByAdmin(uid, updateData);
        if (res.success) {
          editModal.classList.remove('active');
          await renderUsersList();
        } else {
          alert('Gagal memperbarui user: ' + res.error);
        }
      });
    }

  } else if (subPageKey === 'setting-profil-wilayah') {
    mainContent.innerHTML = `
      <div style="margin-bottom: 15px;">
        <button class="btn-back" onclick="loadSubAdminPage('pengaturan')">
          ← Kembali ke Pengaturan
        </button>
      </div>

      <div class="card form-card">
        <div class="form-header">
          <div class="form-icon-bg" style="background: #f0f9ff;">📍</div>
          <div>
            <h2 class="form-title">Profil Wilayah</h2>
            <p class="form-subtitle">Kelola deskripsi dan informasi seputar wilayah Dusun Potrobayan.</p>
          </div>
        </div>

        <form id="form-profil-wilayah">
          <div class="form-group">
            <label class="form-label">Nama Dusun / Wilayah</label>
            <input type="text" id="wilayah-nama" class="custom-input" style="padding-left: 14px;" value="Dusun Potrobayan" required>
          </div>

          <div style="display: flex; gap: 10px;" class="form-group">
            <div style="flex: 1;">
              <label class="form-label">Jumlah RT</label>
              <input type="number" id="wilayah-rt" class="custom-input" style="padding-left: 14px;" value="4" required>
            </div>
            <div style="flex: 1;">
              <label class="form-label">Jumlah RW</label>
              <input type="number" id="wilayah-rw" class="custom-input" style="padding-left: 14px;" value="2" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat / Lokasi</label>
            <input type="text" id="wilayah-alamat" class="custom-input" style="padding-left: 14px;" value="Potrobayan, Srihardono, Pundong, Bantul, DIY" required>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Wilayah</label>
            <textarea id="wilayah-deskripsi" class="custom-input" style="padding: 10px 14px; height: 80px; resize: none;" required>Dusun Potrobayan terletak di wilayah yang asri dengan kebudayaan gotong royong yang kuat.</textarea>
          </div>

          <button type="submit" class="btn-submit">
            Simpan Profil Wilayah
          </button>
        </form>
      </div>
    `;

    const formWilayah = document.getElementById('form-profil-wilayah');
    if (formWilayah) {
      formWilayah.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Profil wilayah berhasil disimpan!');
      });
    }

  } else {
    const titles = {
      warga: '👥 Data & Informasi Warga',
      keuangan: '💰 Pencatatan Keuangan Kas',
      informasi: 'ℹ️ Kelola Informasi & Berita Dusun'
    };

    mainContent.innerHTML = `
      <div style="margin-bottom: 15px;">
        <button class="btn-back" onclick="navigateTo('more', document.getElementById('nav-more'))">
          ← Kembali ke More
        </button>
      </div>
      <div class="card">
        <h2>${titles[subPageKey] || 'Menu Sub'}</h2>
        <p>Halaman pengelolaan ${subPageKey} Dusun Potrobayan.</p>
      </div>
    `;
  }
};

// Render List User Terdaftar
async function renderUsersList() {
  const loadingEl = document.getElementById('users-loading');
  const containerEl = document.getElementById('users-list-container');
  if (!containerEl) return;

  const res = await getAllUsers();
  if (loadingEl) loadingEl.style.display = 'none';

  if (res.success && res.data.length > 0) {
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    res.data.forEach(user => {
      const isAdmin = user.role === 'admin' || user.role === 'pengurus';
      const badgeColor = isAdmin ? '#ef4444' : '#10b981';
      const badgeBg = isAdmin ? '#fef2f2' : '#ecfdf5';

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div>
            <div style="font-weight: 600; font-size: 0.875rem; color: #0f172a;">${user.nama || 'User'}</div>
            <div style="font-size: 0.775rem; color: #64748b;">${user.email}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.725rem; font-weight: 600; color: ${badgeColor}; background: ${badgeBg}; padding: 4px 10px; border-radius: 20px; border: 1px solid ${badgeColor}30;">
              ${(user.role || 'warga').toUpperCase()}
            </span>
            <button class="btn-action-edit" data-id="${user.id}" data-nama="${user.nama || ''}" data-role="${user.role || 'warga'}" style="background: #f1f5f9; border: none; padding: 6px; border-radius: 8px; cursor: pointer;" title="Edit User">
              ✏️
            </button>
            <button class="btn-action-delete" data-id="${user.id}" data-nama="${user.nama || 'User'}" style="background: #fef2f2; border: none; padding: 6px; border-radius: 8px; cursor: pointer; color: #ef4444;" title="Hapus User">
              🗑️
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    containerEl.innerHTML = html;

    document.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const uid = target.getAttribute('data-id');
        const nama = target.getAttribute('data-nama');
        const role = target.getAttribute('data-role');

        document.getElementById('edit-user-id').value = uid;
        document.getElementById('edit-user-nama').value = nama;
        document.getElementById('edit-user-role').value = role;

        document.getElementById('edit-user-modal').classList.add('active');
      });
    });

    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget;
        const uid = target.getAttribute('data-id');
        const nama = target.getAttribute('data-nama');

        if (confirm(`Apakah Anda yakin ingin menghapus akun "${nama}"?`)) {
          const resDelete = await deleteUserByAdmin(uid);
          if (resDelete.success) {
            await renderUsersList();
          } else {
            alert('Gagal menghapus user: ' + resDelete.error);
          }
        }
      });
    });

  } else {
    containerEl.innerHTML = `<p style="text-align:center; color: var(--text-muted); font-size: 0.85rem;">Belum ada user terdaftar.</p>`;
  }
}