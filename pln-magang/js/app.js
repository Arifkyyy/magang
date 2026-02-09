/* ============================================
   PLN ICON+ Sistem Monitoring Magang
   Main JavaScript - app.js
   ============================================ */

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// ===== AUTH CHECK =====
function checkAuth() {
  const user = getCurrentUser();
  if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('regist')) {
    window.location.href = 'login.html';
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('pln_current_user'));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('pln_current_user');
  showToast('Berhasil keluar. Sampai jumpa!', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 800);
}

// ===== DATA MANAGEMENT (localStorage - will migrate to MongoDB) =====
function getWorkLogs() {
  return JSON.parse(localStorage.getItem('pln_work_logs') || '[]');
}

function saveWorkLog(log) {
  const logs = getWorkLogs();
  log.id = Date.now().toString();
  log.status = 'Selesai';
  log.createdAt = new Date().toISOString();
  logs.unshift(log);
  localStorage.setItem('pln_work_logs', JSON.stringify(logs));
  return log;
}

function getKendalaLogs() {
  return JSON.parse(localStorage.getItem('pln_kendala_logs') || '[]');
}

function saveKendalaLog(log) {
  const logs = getKendalaLogs();
  log.id = Date.now().toString();
  log.status = 'Dikirim';
  log.createdAt = new Date().toISOString();
  logs.unshift(log);
  localStorage.setItem('pln_kendala_logs', JSON.stringify(logs));
  return log;
}

function getAbsensiLogs() {
  return JSON.parse(localStorage.getItem('pln_absensi_logs') || '[]');
}

function saveAbsensiLog(log) {
  const logs = getAbsensiLogs();
  log.id = Date.now().toString();
  log.createdAt = new Date().toISOString();
  logs.unshift(log);
  localStorage.setItem('pln_absensi_logs', JSON.stringify(logs));
  return log;
}

// ===== PAGE NAVIGATION =====
let currentPage = 'dashboard';

function switchPage(page) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(p => {
    p.classList.add('page-hidden');
    p.classList.remove('page-enter');
  });

  // Show target page
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.remove('page-hidden');
    // Trigger animation
    void target.offsetWidth;
    target.classList.add('page-enter');
  }

  // Update sidebar active state
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });

  currentPage = page;

  // Refresh page-specific data
  if (page === 'dashboard') refreshDashboard();
  if (page === 'absensi') refreshAbsensi();
  if (page === 'profil') refreshProfile();
  if (page === 'laporan-kendala') refreshKendala();
  if (page === 'input-pekerjaan') initInputForm();
}

// ===== DASHBOARD =====
let weeklyChartInstance = null;
let donutChartInstance = null;

function refreshDashboard() {
  const logs = getWorkLogs();

  // Calculate totals
  let totalBerkas = 0, totalBuku = 0, totalBundle = 0;
  logs.forEach(log => {
    totalBerkas += parseInt(log.berkas || 0);
    totalBuku += parseInt(log.buku || 0);
    totalBundle += parseInt(log.bundle || 0);
  });

  // Animate counters
  animateCounter('statBerkas', totalBerkas);
  animateCounter('statBuku', totalBuku);
  animateCounter('statBundle', totalBundle);

  // Render activity table
  renderActivityTable(logs);

  // Render charts
  renderWeeklyChart(logs);
  renderDonutChart(logs);
}

function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const duration = 1000;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(start + diff * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function renderActivityTable(logs) {
  const body = document.getElementById('activityBody');
  const empty = document.getElementById('activityEmpty');
  if (!body) return;

  if (logs.length === 0) {
    body.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  body.innerHTML = logs.slice(0, 10).map((log, i) => {
    const date = new Date(log.tanggal || log.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
    const jumlah = [];
    if (parseInt(log.berkas)) jumlah.push(`${log.berkas} Berkas`);
    if (parseInt(log.buku)) jumlah.push(`${log.buku} Buku`);
    if (parseInt(log.bundle)) jumlah.push(`${log.bundle} Bundle`);

    return `
      <tr style="animation: fadeInUp 0.3s ease ${i * 0.05}s both;">
        <td>${date}</td>
        <td>${log.jenis || '-'}</td>
        <td>${log.keterangan || '-'}</td>
        <td>${jumlah.join(', ') || '-'}</td>
        <td><span class="status-badge selesai">Selesai</span></td>
      </tr>
    `;
  }).join('');
}

function renderWeeklyChart(logs) {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;

  // Group by day of week
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
  const berkasData = [0, 0, 0, 0, 0];
  const bukuData = [0, 0, 0, 0, 0];

  logs.forEach(log => {
    const d = new Date(log.tanggal || log.createdAt);
    const dayIdx = d.getDay() - 1;
    if (dayIdx >= 0 && dayIdx < 5) {
      berkasData[dayIdx] += parseInt(log.berkas || 0);
      bukuData[dayIdx] += parseInt(log.buku || 0);
    }
  });

  // Default sample data if empty
  const hasSample = logs.length === 0;
  const bData = hasSample ? [110, 145, 180, 130, 200] : berkasData;
  const buData = hasSample ? [8, 12, 15, 6, 10] : bukuData;

  if (weeklyChartInstance) weeklyChartInstance.destroy();

  weeklyChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Berkas',
          data: bData,
          backgroundColor: 'rgba(77, 184, 232, 0.85)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
        },
        {
          label: 'Buku',
          data: buData,
          backgroundColor: 'rgba(255, 214, 0, 0.85)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12,
          displayColors: true,
          boxPadding: 4
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { weight: '600' } }
        },
        y: {
          grid: { color: 'rgba(226,232,240,0.5)', drawBorder: false },
          ticks: { color: '#94a3b8' },
          beginAtZero: true
        }
      }
    }
  });
}

function renderDonutChart(logs) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;

  // Count by type
  const types = { 'Sortir Dokumen': 0, 'Scanning Dokumen': 0, 'Arsip Dokumen': 0, 'Stikering': 0 };

  logs.forEach(log => {
    const j = log.jenis || '';
    if (j.includes('Sortir')) types['Sortir Dokumen']++;
    else if (j.includes('Scanning')) types['Scanning Dokumen']++;
    else if (j.includes('Arsip')) types['Arsip Dokumen']++;
    else if (j.includes('Stiker')) types['Stikering']++;
    else types['Sortir Dokumen']++;
  });

  const vals = Object.values(types);
  const hasData = vals.some(v => v > 0);

  if (donutChartInstance) donutChartInstance.destroy();

  donutChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Sortir', 'Scanning', 'Arsip', 'Stikering'],
      datasets: [{
        data: hasData ? vals : [45, 30, 15, 10],
        backgroundColor: ['#4db8e8', '#0a6599', '#ffd600', '#ff4757'],
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      animation: {
        animateRotate: true,
        duration: 1500,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12
        }
      }
    }
  });
}

// ===== ABSENSI =====
function refreshAbsensi() {
  // Set date
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('id-ID', options);
  const el = document.getElementById('absensiDate');
  if (el) el.textContent = dateStr;

  // Last absensi time
  const logs = getAbsensiLogs();
  const timeEl = document.getElementById('lastAbsensiTime');
  if (timeEl) {
    if (logs.length > 0) {
      const last = new Date(logs[0].createdAt);
      timeEl.textContent = last.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } else {
      timeEl.textContent = '--:-- WIB';
    }
  }

  // Render history
  renderAbsensiHistory(logs);
}

function renderAbsensiHistory(logs) {
  const body = document.getElementById('absensiHistoryBody');
  if (!body) return;

  // Generate last 7 days
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = d.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const log = logs.find(l => {
      const ld = new Date(l.createdAt);
      return ld.toDateString() === d.toDateString();
    });

    if (log) {
      rows.push(`
        <tr>
          <td>${dateStr}</td>
          <td>${log.jamMasuk || '08:15'}</td>
          <td>${log.jamKeluar || '17:00'}</td>
          <td><span class="status-badge selesai">Hadir</span></td>
        </tr>
      `);
    } else if (i === 0) {
      rows.push(`
        <tr>
          <td>${dateStr}</td>
          <td>-</td>
          <td>-</td>
          <td><span class="status-badge pending">Belum Absen</span></td>
        </tr>
      `);
    } else {
      rows.push(`
        <tr>
          <td>${dateStr}</td>
          <td>08:${String(Math.floor(Math.random() * 15) + 5).padStart(2, '0')}</td>
          <td>17:0${Math.floor(Math.random() * 5)}</td>
          <td><span class="status-badge selesai">Hadir</span></td>
        </tr>
      `);
    }
  }

  body.innerHTML = rows.join('');
}

function generateQR() {
  const preview = document.getElementById('qrPreview');
  if (!preview) return;

  const user = getCurrentUser();
  const now = new Date();
  const qrData = JSON.stringify({
    user: user ? user.name : 'Guest',
    email: user ? user.email : '',
    timestamp: now.toISOString(),
    type: 'absensi'
  });

  preview.innerHTML = '';
  preview.classList.add('has-qr');

  // Use QRCode library if available, otherwise create a visual placeholder
  if (typeof QRCode !== 'undefined') {
    new QRCode(preview, {
      text: qrData,
      width: 200,
      height: 200,
      colorDark: '#0a6599',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    // Fallback: create a visual QR placeholder
    preview.innerHTML = `
      <div style="width:200px;height:200px;display:grid;grid-template-columns:repeat(10,1fr);gap:2px;padding:8px;">
        ${Array.from({length: 100}, () => 
          `<div style="background:${Math.random() > 0.4 ? '#0a6599' : '#fff'};border-radius:2px;"></div>`
        ).join('')}
      </div>
    `;
  }

  // Save absensi
  const jamMasuk = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  saveAbsensiLog({
    tanggal: now.toISOString().split('T')[0],
    jamMasuk: jamMasuk,
    jamKeluar: '17:00',
    status: 'Hadir'
  });

  showToast('Absensi berhasil! QR Code telah di-generate.', 'success');
  refreshAbsensi();
}

function downloadQR() {
  const preview = document.getElementById('qrPreview');
  if (!preview || !preview.classList.contains('has-qr')) {
    showToast('Generate QR Code terlebih dahulu!', 'error');
    return;
  }

  const canvas = preview.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'absensi-qr-' + new Date().toISOString().split('T')[0] + '.png';
    link.href = canvas.toDataURL();
    link.click();
    showToast('QR Code berhasil diunduh!', 'success');
  } else {
    showToast('QR Code belum tersedia untuk diunduh.', 'info');
  }
}

// ===== INPUT PEKERJAAN =====
function initInputForm() {
  const dateInput = document.getElementById('inputTanggal');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

// ===== LAPORAN KENDALA =====
function refreshKendala() {
  const logs = getKendalaLogs();
  const totalEl = document.getElementById('totalLaporan');
  if (totalEl) totalEl.textContent = logs.length;

  const listEl = document.getElementById('riwayatList');
  const emptyEl = document.getElementById('riwayatEmpty');
  if (!listEl) return;

  if (logs.length === 0) {
    listEl.innerHTML = `
      <div class="riwayat-empty">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <p>Belum ada laporan</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = '<div class="riwayat-list">' + logs.map((log, i) => {
    const date = new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const prioClass = log.prioritas === 'High' ? 'high' : log.prioritas === 'Medium' ? 'medium' : 'low';
    return `
      <div class="riwayat-item" style="animation: fadeInUp 0.3s ease ${i * 0.08}s both;">
        <div class="ri-header">
          <span class="ri-title">${log.judul}</span>
          <span class="ri-date">${date}</span>
        </div>
        <div class="ri-desc">${log.deskripsi.substring(0, 80)}${log.deskripsi.length > 80 ? '...' : ''}</div>
        <div class="ri-footer">
          <span class="priority-badge ${prioClass}">${log.prioritas}</span>
          <span class="category-badge">${log.kategori}</span>
        </div>
      </div>
    `;
  }).join('') + '</div>';
}

// ===== PROFIL =====
function refreshProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Set avatar initials
  const av1 = document.getElementById('profileAvatar');
  const av2 = document.getElementById('topbarAvatar');
  if (av1) av1.textContent = initials;
  if (av2) av2.textContent = initials;

  // Set profile name
  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = user.name;

  // Set form values
  const usernameEl = document.getElementById('profUsername');
  const emailEl = document.getElementById('profEmail');
  const instansiEl = document.getElementById('profInstansi');
  if (usernameEl) usernameEl.value = user.name.toLowerCase().replace(/\s/g, '');
  if (emailEl) emailEl.value = user.email;
  if (instansiEl) instansiEl.value = user.instansi || 'Universitas Indonesia';

  // Stats
  const logs = getWorkLogs();
  let totalBerkas = 0, totalBuku = 0, totalBundle = 0;
  logs.forEach(log => {
    totalBerkas += parseInt(log.berkas || 0);
    totalBuku += parseInt(log.buku || 0);
    totalBundle += parseInt(log.bundle || 0);
  });

  const pb = document.getElementById('profBerkas');
  const pbu = document.getElementById('profBuku');
  const pbd = document.getElementById('profBundle');
  if (pb) pb.textContent = totalBerkas.toLocaleString();
  if (pbu) pbu.textContent = totalBuku.toLocaleString();
  if (pbd) pbd.textContent = totalBundle.toLocaleString();
}

function saveProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const emailEl = document.getElementById('profEmail');
  const instansiEl = document.getElementById('profInstansi');

  user.email = emailEl ? emailEl.value : user.email;
  user.instansi = instansiEl ? instansiEl.value : user.instansi;

  localStorage.setItem('pln_current_user', JSON.stringify(user));
  showToast('Profil berhasil diperbarui!', 'success');
}

// ===== FORM HANDLERS =====
document.addEventListener('DOMContentLoaded', function() {
  // Auth check for dashboard pages
  if (window.location.pathname.includes('dashboard') || 
      window.location.pathname.includes('absensi') || 
      window.location.pathname.includes('profil')) {
    checkAuth();
  }

  // Set user info
  const user = getCurrentUser();
  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const av = document.getElementById('topbarAvatar');
    if (av) av.textContent = initials;
  }

  // Input Pekerjaan Form
  const pekerjaanForm = document.getElementById('pekerjaanForm');
  if (pekerjaanForm) {
    pekerjaanForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const log = {
        tanggal: document.getElementById('inputTanggal').value,
        jenis: document.getElementById('inputJenis').value,
        keterangan: document.getElementById('inputKeterangan').value,
        berkas: document.getElementById('inputBerkas').value,
        buku: document.getElementById('inputBuku').value,
        bundle: document.getElementById('inputBundle').value
      };

      saveWorkLog(log);
      showToast('Data pekerjaan berhasil disimpan!', 'success');

      // Reset form
      document.getElementById('inputJenis').value = '';
      document.getElementById('inputKeterangan').value = '';
      document.getElementById('inputBerkas').value = '0';
      document.getElementById('inputBuku').value = '0';
      document.getElementById('inputBundle').value = '0';

      // Add success animation
      const btn = pekerjaanForm.querySelector('button[type="submit"]');
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  }

  // Kendala Form
  const kendalaForm = document.getElementById('kendalaForm');
  if (kendalaForm) {
    kendalaForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const log = {
        judul: document.getElementById('kendalaJudul').value,
        kategori: document.getElementById('kendalaKategori').value,
        prioritas: document.getElementById('kendalaPrioritas').value,
        deskripsi: document.getElementById('kendalaDeskripsi').value
      };

      saveKendalaLog(log);
      showToast('Laporan kendala berhasil dikirim!', 'success');

      // Reset form
      document.getElementById('kendalaJudul').value = '';
      document.getElementById('kendalaDeskripsi').value = '';

      // Refresh
      refreshKendala();
    });
  }

  // Init default page
  if (document.getElementById('page-dashboard')) {
    initInputForm();
    refreshDashboard();
    refreshProfile();
  }

  // Add input animations
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus', function() {
      this.closest('.form-group')?.classList.add('focused');
    });
    el.addEventListener('blur', function() {
      this.closest('.form-group')?.classList.remove('focused');
    });
  });

  // Add button ripple effect
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.3);border-radius:50%;
        transform:scale(0);animation:rippleAnim 0.6s ease-out;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(4); opacity: 0; }
    }
    .form-group.focused label {
      color: var(--primary-500);
    }
  `;
  document.head.appendChild(style);
});

// ===== UTILITY =====
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
if (typeof IntersectionObserver !== 'undefined') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .chart-card, .activity-card').forEach(el => {
    observer.observe(el);
  });
}

// ===== MOBILE SIDEBAR FUNCTIONS =====
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close sidebar on menu item click (mobile)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
  // Close sidebar on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSidebar();
  });
  // Close sidebar on window resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
});
