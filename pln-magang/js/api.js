/* ============================================
   PLN ICON+ Monitoring Magang
   api.js — Frontend API Service
   Menghubungkan frontend ke backend MongoDB
   ============================================ */

const API_BASE = window.location.origin + '/api';

// ===== TOKEN MANAGEMENT =====
function getToken() {
  return localStorage.getItem('pln_token');
}

function setToken(token) {
  localStorage.setItem('pln_token', token);
}

function removeToken() {
  localStorage.removeItem('pln_token');
  localStorage.removeItem('pln_current_user');
}

// ===== HTTP HELPER =====
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await res.json();

    if (res.status === 401) {
      // Token expired / invalid
      removeToken();
      window.location.href = 'login.html';
      return null;
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Gagal terhubung ke server. Pastikan backend berjalan.' };
  }
}

const API = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// ===== AUTH API =====
const AuthAPI = {
  async login(email, password) {
    const res = await API.post('/auth/login', { email, password });
    if (res && res.success) {
      setToken(res.data.token);
      localStorage.setItem('pln_current_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async register(name, email, password, instansi) {
    const res = await API.post('/auth/register', { name, email, password, instansi });
    if (res && res.success) {
      setToken(res.data.token);
      localStorage.setItem('pln_current_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getProfile() {
    return API.get('/auth/me');
  },

  async updateProfile(data) {
    const res = await API.put('/auth/profile', data);
    if (res && res.success) {
      localStorage.setItem('pln_current_user', JSON.stringify(res.data));
    }
    return res;
  },

  logout() {
    removeToken();
    window.location.href = 'login.html';
  },

  isLoggedIn() {
    return !!getToken();
  },

  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('pln_current_user')); } catch { return null; }
  }
};

// ===== USERS API (Admin) =====
const UsersAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

// ===== WORK LOGS API =====
const WorkLogAPI = {
  getAll: (params = '') => API.get(`/work-logs${params ? '?' + params : ''}`),
  create: (data) => API.post('/work-logs', data),
  update: (id, data) => API.put(`/work-logs/${id}`, data),
  submit: (id) => API.put(`/work-logs/${id}/submit`),
  delete: (id) => API.delete(`/work-logs/${id}`),
  getMyStats: () => API.get('/work-logs/stats/me'),
};

// ===== ATTENDANCE API =====
const AttendanceAPI = {
  getAll: (params = '') => API.get(`/attendance${params ? '?' + params : ''}`),
  scan: (token) => API.post('/attendance/scan', { token }),
  checkout: (id) => API.put(`/attendance/${id}/checkout`),
  getToday: () => API.get('/attendance/today'),
};

// ===== COMPLAINTS API =====
const ComplaintAPI = {
  getAll: (params = '') => API.get(`/complaints${params ? '?' + params : ''}`),
  create: (data) => API.post('/complaints', data),
  updateStatus: (id, status) => API.put(`/complaints/${id}/status`, { status }),
  getStats: () => API.get('/complaints/stats'),
};

// ===== QR CODE API =====
const QRCodeAPI = {
  generate: () => API.post('/qrcode/generate'),
  getToday: () => API.get('/qrcode/today'),
  getHistory: () => API.get('/qrcode/history'),
};

// ===== DASHBOARD API =====
const DashboardAPI = {
  getAdmin: () => API.get('/dashboard/admin'),
  getUser: () => API.get('/dashboard/user'),
};
