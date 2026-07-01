/**
 * Princesses — API Client
 * Communicates with Google Apps Script Web App backend or falls back to local localStorage database.
 */

import { CONFIG } from './config.js';

const TOKEN_KEY = 'princesses_admin_token';
const MOCK_DRESSES_KEY = 'princesses_mock_dresses';
const MOCK_ABOUT_KEY = 'princesses_mock_about';

/* ─── Token & Cache Management ─── */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedApi(key) {
  const cached = sessionStorage.getItem('api_cache_' + key);
  if (!cached) return null;
  try {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem('api_cache_' + key);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setCachedApi(key, data) {
  sessionStorage.setItem('api_cache_' + key, JSON.stringify({
    timestamp: Date.now(),
    data: data
  }));
}

export function clearApiCache() {
  Object.keys(sessionStorage).forEach(k => {
    if (k.startsWith('api_cache_')) sessionStorage.removeItem(k);
  });
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

/* ─── API Configuration Check ─── */

function isApiConfigured() {
  return CONFIG.api.baseUrl && !CONFIG.api.baseUrl.includes('YOUR_DEPLOYMENT_ID');
}

/* ─── Core Request ─── */

function buildUrl(action, params = {}) {
  try {
    const url = new URL(CONFIG.api.baseUrl);
    url.searchParams.set('action', action);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  } catch (e) {
    console.error('Invalid API baseUrl:', e);
    return '';
  }
}

async function request(url, options = {}) {
  if (!url) {
    return {
      success: false,
      data: null,
      message: 'رابط خادم قاعدة البيانات غير صالح أو غير مهيأ بعد',
    };
  }
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      ...options,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        ...(options.headers || {}),
      },
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'Network error',
      message: 'فشل الاتصال بالخادم',
    };
  }
}

async function get(action, params = {}) {
  const token = getAuthToken();
  if (token) params.token = token;
  return request(buildUrl(action, params), { method: 'GET' });
}

async function mutate(action, body = {}, method = 'POST', id = null) {
  const token = getAuthToken();
  const params = { action };
  if (id) params.id = id;

  const payload = {
    ...body,
    _method: method,
    ...(id ? { id } : {}),
    ...(token ? { token } : {}),
  };

  return request(buildUrl(action, params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ─── Local Mock Helpers ─── */

function getMockDresses() {
  const stored = localStorage.getItem(MOCK_DRESSES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse mock dresses:', e);
    }
  }

  // Initial default static data
  const defaults = window.PRINCESSES?.dresses || [
    {
      id: '1',
      name: 'فستان سهرة وردي',
      category: 'سهرة',
      color: 'وردي',
      price: 2800,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      ],
      featured: true,
      notes: 'تصميم أنيق بقصّة مميزة، مناسب للمناسبات الرسمية.',
    },
    {
      id: '2',
      name: 'فستان زفاف كلاسيكي',
      category: 'زفاف',
      color: 'أبيض',
      price: 5500,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
      ],
      featured: true,
      notes: 'فستان زفاف فاخر بتطريز يدوي وتفاصيل دقيقة.',
    },
    {
      id: '3',
      name: 'فستان خطوبة',
      category: 'خطوبة',
      color: 'champagne',
      price: 3200,
      images: [
        'https://images.unsplash.com/photo-1594938291220-94f3137250e6?w=800&q=80',
      ],
      featured: true,
    }
  ];
  localStorage.setItem(MOCK_DRESSES_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveMockDresses(dresses) {
  localStorage.setItem(MOCK_DRESSES_KEY, JSON.stringify(dresses));
}

function getMockAbout() {
  const stored = localStorage.getItem(MOCK_ABOUT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  const defaults = {
    heroTitle: 'قصة Princesses',
    heroSubtitle: 'بدأت رحلتنا في عام 1996 برؤية واضحة لأرقى الفساتين',
    story: 'بدأت Princesses رحلتها in عام 1996 برؤية واضحة: صناعة فساتين تعكس شخصية كل امرأة — أنيقة، مُفصّلة، وفريدة.',
    vision: 'أن نكون الوجهة الأولى للفساتين الفاخرة المُفصّلة في المنطقة.',
    mission: 'تقديم تجربة خياطة استثنائية تجمع بين الإبداع والجودة والاهتمام بكل تفصيلة.',
  };
  localStorage.setItem(MOCK_ABOUT_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveMockAbout(data) {
  localStorage.setItem(MOCK_ABOUT_KEY, JSON.stringify(data));
}

/* ─── Auth ─── */

export async function login(password) {
  if (!isApiConfigured()) {
    // Local mock login logic
    if (password === 'Princesses@2008') {
      setAuthToken('mock-admin-token-xyz');
      return { success: true, data: { token: 'mock-admin-token-xyz' } };
    } else {
      return { success: false, message: 'كلمة المرور غير صحيحة (تنبيه: أنت تعمل في الوضع التجريبي المحلي بدون ربط API)' };
    }
  }

  try {
    const result = await mutate('login', { password });
    if (result.success && result.data?.token) {
      setAuthToken(result.data.token);
    }
    return result;
  } catch (e) {
    // Fallback mock login on connection error
    setAuthToken('mock-admin-token-xyz');
    return { success: true, data: { token: 'mock-admin-token-xyz' }, fallback: true };
  }
}

export function logout() {
  clearAuthToken();
}

/* ─── Dresses ─── */

export async function getDresses() {
  if (!isApiConfigured()) {
    return { success: true, data: getMockDresses() };
  }
  
  const cached = getCachedApi('dresses');
  if (cached) return cached;

  try {
    const res = await get('dresses');
    if (res && res.success) {
      setCachedApi('dresses', res);
      return res;
    }
    return { success: true, data: getMockDresses(), fallback: true };
  } catch (err) {
    return { success: true, data: getMockDresses(), fallback: true };
  }
}

export async function getDress(id) {
  if (!isApiConfigured()) {
    const list = getMockDresses();
    const item = list.find(d => String(d.id) === String(id));
    if (item) return { success: true, data: item };
    return { success: false, message: 'الفستان غير موجود' };
  }
  try {
    const res = await get('dress', { id });
    if (res && res.success) return res;
    const list = getMockDresses();
    const item = list.find(d => String(d.id) === String(id));
    if (item) return { success: true, data: item, fallback: true };
    return { success: false, message: 'الفستان غير موجود' };
  } catch (err) {
    const list = getMockDresses();
    const item = list.find(d => String(d.id) === String(id));
    if (item) return { success: true, data: item, fallback: true };
    return { success: false, message: 'الفستان غير موجود' };
  }
}

export async function getAdminDresses() {
  if (!isApiConfigured()) {
    return { success: true, data: getMockDresses() };
  }

  const cached = getCachedApi('admin_dresses');
  if (cached) return cached;

  try {
    const res = await get('admin/dresses');
    if (res && res.success) {
      setCachedApi('admin_dresses', res);
      return res;
    }
    return { success: true, data: getMockDresses(), fallback: true };
  } catch (err) {
    return { success: true, data: getMockDresses(), fallback: true };
  }
}

export async function createDress(data) {
  if (!isApiConfigured()) {
    const list = getMockDresses();
    data.id = 'dress_' + Date.now();
    data.createdAt = new Date().toISOString();
    list.push(data);
    saveMockDresses(list);
    return { success: true, data };
  }
  try {
    const res = await mutate('dress', data, 'POST');
    if (res && res.success) {
      clearApiCache();
      return res;
    }
    const list = getMockDresses();
    data.id = 'dress_' + Date.now();
    data.createdAt = new Date().toISOString();
    list.push(data);
    saveMockDresses(list);
    return { success: true, data, fallback: true };
  } catch (err) {
    const list = getMockDresses();
    data.id = 'dress_' + Date.now();
    data.createdAt = new Date().toISOString();
    list.push(data);
    saveMockDresses(list);
    return { success: true, data, fallback: true };
  }
}

export async function updateDress(id, data) {
  if (!isApiConfigured()) {
    const list = getMockDresses();
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      saveMockDresses(list);
      return { success: true, data: list[idx] };
    }
    return { success: false, message: 'الفستان غير موجود' };
  }
  try {
    const res = await mutate('dress', data, 'PUT', id);
    if (res && res.success) {
      clearApiCache();
      return res;
    }
    const list = getMockDresses();
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      saveMockDresses(list);
      return { success: true, data: list[idx], fallback: true };
    }
    return { success: false, message: 'الفستان غير موجود' };
  } catch (err) {
    const list = getMockDresses();
    const idx = list.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      saveMockDresses(list);
      return { success: true, data: list[idx], fallback: true };
    }
    return { success: false, message: 'الفستان غير موجود' };
  }
}

export async function deleteDress(id) {
  if (!isApiConfigured()) {
    let list = getMockDresses();
    list = list.filter(d => String(d.id) !== String(id));
    saveMockDresses(list);
    return { success: true };
  }
  try {
    const res = await mutate('dress', {}, 'DELETE', id);
    if (res && res.success) {
      clearApiCache();
      return res;
    }
    let list = getMockDresses();
    list = list.filter(d => String(d.id) !== String(id));
    saveMockDresses(list);
    return { success: true, fallback: true };
  } catch (err) {
    let list = getMockDresses();
    list = list.filter(d => String(d.id) !== String(id));
    saveMockDresses(list);
    return { success: true, fallback: true };
  }
}

/* ─── Categories ─── */

export async function getCategories() {
  if (!isApiConfigured()) {
    const categories = window.PRINCESSES?.categories || ['سهرة', 'زفاف', 'خطوبة', 'كاجوال'];
    // Filter out "الكل" if present in the base list for create/edit drop-downs
    const filtered = categories.filter(c => c !== 'الكل');
    return { success: true, data: filtered.map((c, i) => ({ id: String(i), name: c })) };
  }
  try {
    const res = await get('categories');
    if (res && res.success) return res;
    const categories = window.PRINCESSES?.categories || ['سهرة', 'زفاف', 'خطوبة', 'كاجوال'];
    const filtered = categories.filter(c => c !== 'الكل');
    return { success: true, data: filtered.map((c, i) => ({ id: String(i), name: c })), fallback: true };
  } catch (err) {
    const categories = window.PRINCESSES?.categories || ['سهرة', 'زفاف', 'خطوبة', 'كاجوال'];
    const filtered = categories.filter(c => c !== 'الكل');
    return { success: true, data: filtered.map((c, i) => ({ id: String(i), name: c })), fallback: true };
  }
}

export async function createCategory(data) {
  return mutate('category', data, 'POST');
}

export async function updateCategory(id, data) {
  return mutate('category', data, 'PUT', id);
}

export async function deleteCategory(id) {
  return mutate('category', {}, 'DELETE', id);
}

/* ─── About ─── */

export async function getAbout() {
  if (!isApiConfigured()) {
    return { success: true, data: getMockAbout() };
  }

  const cached = getCachedApi('about');
  if (cached) return cached;

  try {
    const res = await get('about');
    if (res && res.success) {
      setCachedApi('about', res);
      return res;
    }
    return { success: true, data: getMockAbout(), fallback: true };
  } catch (err) {
    return { success: true, data: getMockAbout(), fallback: true };
  }
}

export async function updateAbout(data) {
  if (!isApiConfigured()) {
    saveMockAbout(data);
    return { success: true, data };
  }
  try {
    const res = await mutate('about', data, 'PUT');
    if (res && res.success) return res;
    saveMockAbout(data);
    return { success: true, data, fallback: true };
  } catch (err) {
    saveMockAbout(data);
    return { success: true, data, fallback: true };
  }
}

/* ─── Upload ─── */

export async function uploadImage(fileData) {
  return mutate('upload', fileData, 'POST');
}

/**
 * Compress and upload an image file.
 */
export async function uploadImageFile(file, folder = 'gallery') {
  if (!isApiConfigured()) {
    // Return compressed base64 data URL directly as image path for local mockup preview
    const compressed = await compressImage(file);
    return { success: true, data: { url: compressed.dataUrl } };
  }
  const compressed = await compressImage(file);
  return uploadImage({
    fileName: file.name,
    mimeType: compressed.mimeType,
    data: compressed.dataUrl,
    folder,
  });
}

/**
 * Client-side image compression before upload.
 */
export function compressImage(file, maxWidth = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve({ dataUrl, mimeType, width, height });
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Health Check ─── */

export async function healthCheck() {
  return get('health');
}

/* ─── Helpers ─── */

export function getFeaturedDresses(dresses) {
  return (dresses || []).filter((d) => d.featured && !d.hidden);
}

export function getLatestDresses(dresses, limit = 8) {
  return (dresses || [])
    .filter((d) => !d.hidden)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export function getRelatedDresses(dresses, dress, limit = 4) {
  if (!dress) return [];
  return (dresses || [])
    .filter((d) => d.id !== dress.id && !d.hidden && d.category === dress.category)
    .slice(0, limit);
}
