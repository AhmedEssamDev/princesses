/**
 * Princesses — Admin Portal Controller
 * Manages Authentication, Tab Views, Dresses CRUD, Image Compression, and File Uploads.
 */

import {
  login,
  logout,
  isAuthenticated,
  getAdminDresses,
  createDress,
  updateDress,
  deleteDress,
  getCategories,
  getAbout,
  updateAbout,
  uploadImageFile
} from '../api.js';

import { CONFIG, formatPrice } from '../config.js';

// Application State
let dresses = [];
let categories = ['سهرة', 'زفاف', 'خطوبة', 'كاجوال'];
let activeTab = 'dresses-tab';
let selectedImages = []; // Stores mix of URLs (strings) and new files (File objects)

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const loginSubmitBtn = document.getElementById('login-submit-btn');

const adminDressesList = document.getElementById('admin-dresses-list');
const adminSearchInput = document.getElementById('admin-search-input');
const adminCategoryFilter = document.getElementById('admin-category-filter');
const addDressBtn = document.getElementById('add-dress-btn');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// About Form
const aboutForm = document.getElementById('about-form');
const aboutTitleInput = document.getElementById('about-title-input');
const aboutSubtitleInput = document.getElementById('about-subtitle-input');
const aboutStoryInput = document.getElementById('about-story-input');
const aboutVisionInput = document.getElementById('about-vision-input');
const aboutMissionInput = document.getElementById('about-mission-input');
const aboutSaveMsg = document.getElementById('about-save-msg');

// Modal Elements
const dressModal = document.getElementById('dress-modal');
const dressModalOverlay = document.getElementById('dress-modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const dressForm = document.getElementById('dress-form');
const modalTitle = document.getElementById('modal-title');

// Form Fields
const dressIdInput = document.getElementById('dress-id-input');
const dressNameInput = document.getElementById('dress-name-input');
const dressCategoryInput = document.getElementById('dress-category-input');
const dressColorInput = document.getElementById('dress-color-input');
const dressPriceInput = document.getElementById('dress-price-input');
const dressFabricInput = document.getElementById('dress-fabric-input');
const dressFabricEstInput = document.getElementById('dress-fabric-est-input');
const dressDurationInput = document.getElementById('dress-duration-input');
const dressNotesInput = document.getElementById('dress-notes-input');
const dressFeaturedInput = document.getElementById('dress-featured-input');
const dressHiddenInput = document.getElementById('dress-hidden-input');

// Dropzone
const imageDropzone = document.getElementById('image-dropzone');
const imageFileInput = document.getElementById('image-file-input');
const previewsContainer = document.getElementById('image-previews-container');
const formError = document.getElementById('form-error');
const formSuccess = document.getElementById('form-success');
const saveDressBtn = document.getElementById('save-dress-btn');

/* ─── 1. INITIALIZATION & ROUTING ─── */

document.addEventListener('DOMContentLoaded', async () => {
  // CRITICAL: Attach event listeners FIRST so buttons always work
  try {
    setupEventListeners();
    console.log('[Admin] Event listeners attached successfully.');
  } catch (e) {
    console.error('[Admin] Failed to attach event listeners:', e);
  }

  // Then load dashboard data (errors here should NOT block button functionality)
  try {
    await showDashboard();
  } catch (e) {
    console.error('[Admin] showDashboard error:', e);
  }
});

function showLogin() {
  if (loginContainer) loginContainer.style.display = 'none';
  if (dashboardContainer) dashboardContainer.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';
}

async function showDashboard() {
  if (loginContainer) loginContainer.style.display = 'none';
  if (dashboardContainer) dashboardContainer.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none'; // Keep logout hidden

  // Silently authenticate in the background to acquire token for backend API requests
  if (!isAuthenticated()) {
    try {
      await login('Princesses@2008');
    } catch (e) {
      console.warn('Silent login failed:', e);
    }
  }

  // Load Dashboard Data — each wrapped individually so one failure doesn't block others
  try { await loadCategories(); } catch (e) { console.error('[Admin] loadCategories error:', e); }
  try { await loadDresses(); } catch (e) { console.error('[Admin] loadDresses error:', e); }
  try { await loadAboutData(); } catch (e) { console.error('[Admin] loadAboutData error:', e); }
}

/* ─── 2. EVENT LISTENERS ─── */

function setupEventListeners() {
  // Login Form (disabled/hidden)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => e.preventDefault());
  }

  // Logout Button (disabled/hidden)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => e.preventDefault());
  }

  // Tabs Navigation
  if (tabButtons && tabContents) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('tab-btn--active'));
        tabContents.forEach(c => c.style.display = 'none');

        btn.classList.add('tab-btn--active');
        const targetId = btn.dataset.tab;
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';
        activeTab = targetId;
      });
    });
  }

  // Search & Filters
  if (adminSearchInput) adminSearchInput.addEventListener('input', renderDressesList);
  if (adminCategoryFilter) adminCategoryFilter.addEventListener('change', renderDressesList);

  // Modal open & close
  if (addDressBtn) {
    addDressBtn.addEventListener('click', () => {
      console.log('[Admin] Add dress button clicked');
      openDressModal();
    });
  } else {
    console.error('[Admin] add-dress-btn not found in DOM!');
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeDressModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeDressModal);
  if (dressModalOverlay) dressModalOverlay.addEventListener('click', closeDressModal);

  // Image Upload Dropzone
  if (imageDropzone && imageFileInput) {
    imageDropzone.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageDropzone.classList.add('image-dropzone--active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageDropzone.classList.remove('image-dropzone--active');
      }, false);
    });

    imageDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });
  }

  // Dress Form Submit
  if (dressForm) dressForm.addEventListener('submit', handleDressFormSubmit);

  // About Form Submit
  if (aboutForm) aboutForm.addEventListener('submit', handleAboutFormSubmit);

  console.log('[Admin] All event listeners setup complete.');
}

/* ─── 3. CATEGORIES & DRESSES LOADERS ─── */

async function loadCategories() {
  const result = await getCategories();
  if (result.success && result.data?.length) {
    categories = result.data.map(cat => cat.name);
  }

  // Populate Filter Select
  adminCategoryFilter.innerHTML = '<option value="الكل">كل التصنيفات</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  // Populate Form Category Dropdown
  dressCategoryInput.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

async function loadDresses() {
  adminDressesList.innerHTML = '<tr><td colspan="7" class="table-loading">جاري تحميل الفساتين...</td></tr>';
  const result = await getAdminDresses();

  if (result.success) {
    dresses = result.data || [];
    renderDressesList();
  } else {
    adminDressesList.innerHTML = `<tr><td colspan="7" class="table-empty">خطأ في تحميل الفساتين: ${result.message}</td></tr>`;
  }
}

function renderDressesList() {
  const searchVal = adminSearchInput.value.trim().toLowerCase();
  const filterVal = adminCategoryFilter.value;

  const filtered = dresses.filter(dress => {
    const matchesSearch = !searchVal || 
      String(dress.name || '').toLowerCase().includes(searchVal) ||
      String(dress.id || '').toLowerCase().includes(searchVal) ||
      String(dress.notes || '').toLowerCase().includes(searchVal);

    const matchesCategory = filterVal === 'الكل' || dress.category === filterVal;

    return matchesSearch && matchesCategory;
  });

  if (!filtered.length) {
    adminDressesList.innerHTML = '<tr><td colspan="7" class="table-empty">لا توجد فساتين مطابقة للبحث.</td></tr>';
    return;
  }

  adminDressesList.innerHTML = filtered.map(dress => {
    const mainImg = dress.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&q=80';
    
    // Status Badges
    const statusBadges = [];
    if (dress.hidden) {
      statusBadges.push('<span class="badge badge--hidden">مخفي</span>');
    } else {
      statusBadges.push('<span class="badge badge--visible">ظاهر</span>');
    }
    if (dress.featured) {
      statusBadges.push('<span class="badge badge--featured">مميز</span>');
    }

    return `
      <tr>
        <td><img src="${mainImg}" alt="${dress.name}" class="table-thumbnail"></td>
        <td dir="ltr" style="font-size: 11px; font-family: monospace;">#${dress.id?.substring(0, 8)}...</td>
        <td><strong>${dress.name}</strong></td>
        <td>${dress.category}</td>
        <td>${dress.price ? formatPrice(dress.price) : '—'}</td>
        <td><div style="display:flex;gap:4px">${statusBadges.join('')}</div></td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn--icon btn--edit" data-id="${dress.id}" title="تعديل">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="btn--icon btn--delete" data-id="${dress.id}" title="حذف">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Action Listeners
  adminDressesList.querySelectorAll('.btn--edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const dressId = btn.dataset.id;
      const dress = dresses.find(d => String(d.id) === String(dressId));
      if (dress) openDressModal(dress);
    });
  });

  adminDressesList.querySelectorAll('.btn--delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const dressId = btn.dataset.id;
      const dress = dresses.find(d => String(d.id) === String(dressId));
      if (dress && confirm(`هل أنت متأكد من حذف الفستان "${dress.name}" نهائياً؟`)) {
        await handleDressDelete(dressId);
      }
    });
  });
}

/* ─── 4. DRESS ADD/EDIT FORM & MODAL ─── */

function openDressModal(dress = null) {
  formError.style.display = 'none';
  formSuccess.style.display = 'none';
  selectedImages = [];
  previewsContainer.innerHTML = '';

  if (dress) {
    // Edit Mode
    modalTitle.textContent = 'تعديل الفستان';
    dressIdInput.value = dress.id;
    dressNameInput.value = dress.name || '';
    dressCategoryInput.value = dress.category || categories[0];
    dressColorInput.value = dress.color || '';
    dressPriceInput.value = dress.price || '';
    dressFabricInput.value = dress.fabricType || '';
    dressFabricEstInput.value = dress.estimatedFabric || '';
    dressDurationInput.value = dress.estimatedDuration || '';
    dressNotesInput.value = dress.notes || '';
    dressFeaturedInput.checked = Boolean(dress.featured);
    dressHiddenInput.checked = Boolean(dress.hidden);

    // Existing Images
    if (dress.images && dress.images.length) {
      selectedImages = [...dress.images];
      renderPreviews();
    }
  } else {
    // Add Mode
    modalTitle.textContent = 'إضافة فستان جديد';
    dressForm.reset();
    dressIdInput.value = '';
    dressFeaturedInput.checked = false;
    dressHiddenInput.checked = false;
  }

  dressModal.style.display = 'flex';
  document.body.classList.add('no-scroll');
}

function closeDressModal() {
  dressModal.style.display = 'none';
  document.body.classList.remove('no-scroll');
}

/* ─── 5. FILE UPLOAD & DRAG/DROP ─── */

function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      selectedImages.push(file);
    }
  }
  renderPreviews();
}

function renderPreviews() {
  previewsContainer.innerHTML = '';

  selectedImages.forEach((item, index) => {
    const previewThumb = document.createElement('div');
    previewThumb.className = 'preview-thumb';

    const img = document.createElement('img');
    if (typeof item === 'string') {
      // Existing image URL
      img.src = item;
    } else {
      // New File object
      img.src = URL.createObjectURL(item);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'preview-thumb__remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
      selectedImages.splice(index, 1);
      renderPreviews();
    });

    previewThumb.appendChild(img);
    previewThumb.appendChild(removeBtn);
    previewsContainer.appendChild(previewThumb);
  });
}

/* ─── 6. CRUD HANDLERS ─── */

async function handleDressFormSubmit(e) {
  e.preventDefault();
  formError.style.display = 'none';
  formSuccess.style.display = 'none';
  setLoading(saveDressBtn, true);

  const dressId = dressIdInput.value;
  const isUpdate = Boolean(dressId);

  try {
    // 1. Process and upload files to Google Drive
    const finalImageUrls = [];
    const uploadFolder = `dresses/${dressId || 'new_' + Date.now()}`;

    for (const item of selectedImages) {
      if (typeof item === 'string') {
        // Keep existing URL
        finalImageUrls.push(item);
      } else {
        // Upload new File object (compresses client-side first)
        formSuccess.textContent = `جاري ضغط ورفع الصورة: ${item.name}...`;
        formSuccess.style.display = 'block';

        const uploadResult = await uploadImageFile(item, uploadFolder);
        if (uploadResult.success && uploadResult.data?.id) {
          finalImageUrls.push(`https://lh3.googleusercontent.com/d/${uploadResult.data.id}`);
        } else if (uploadResult.success && (uploadResult.data?.thumbnailUrl || uploadResult.data?.url)) {
          finalImageUrls.push(uploadResult.data.thumbnailUrl || uploadResult.data.url);
        } else {
          throw new Error(uploadResult.error || `فشل رفع الصورة: ${item.name}`);
        }
      }
    }

    // 2. Prepare Payload
    const payload = {
      name: dressNameInput.value.trim(),
      category: dressCategoryInput.value,
      color: dressColorInput.value.trim(),
      price: Number(dressPriceInput.value),
      fabricType: dressFabricInput.value.trim(),
      estimatedFabric: dressFabricEstInput.value.trim(),
      estimatedDuration: dressDurationInput.value.trim(),
      notes: dressNotesInput.value.trim(),
      featured: dressFeaturedInput.checked,
      hidden: dressHiddenInput.checked,
      images: finalImageUrls,
    };

    // 3. Send Metadata to API
    formSuccess.textContent = 'جاري حفظ بيانات الفستان في قاعدة البيانات...';
    
    let result;
    if (isUpdate) {
      result = await updateDress(dressId, payload);
    } else {
      result = await createDress(payload);
    }

    if (result.success) {
      formSuccess.textContent = isUpdate ? 'تم تحديث الفستان بنجاح' : 'تم إضافة الفستان بنجاح';
      formSuccess.style.display = 'block';
      
      // Reload dresses grid
      await loadDresses();

      setTimeout(() => {
        closeDressModal();
      }, 1200);
    } else {
      throw new Error(result.message || 'فشل حفظ بيانات الفستان');
    }
  } catch (error) {
    console.error('Error saving dress:', error);
    formError.textContent = error.message || 'حدث خطأ غير متوقع أثناء الحفظ';
    formError.style.display = 'block';
    formSuccess.style.display = 'none';
  } finally {
    setLoading(saveDressBtn, false);
  }
}

async function handleDressDelete(id) {
  const result = await deleteDress(id);
  if (result.success) {
    alert('تم حذف الفستان بنجاح');
    await loadDresses();
  } else {
    alert(`فشل في حذف الفستان: ${result.message}`);
  }
}

/* ─── 7. ABOUT CONTENT MANAGEMENT ─── */

async function loadAboutData() {
  const result = await getAbout();
  if (result.success && result.data) {
    const data = result.data;
    aboutTitleInput.value = data.heroTitle || '';
    aboutSubtitleInput.value = data.heroSubtitle || '';
    aboutStoryInput.value = data.story || '';
    aboutVisionInput.value = data.vision || '';
    aboutMissionInput.value = data.mission || '';
  }
}

async function handleAboutFormSubmit(e) {
  e.preventDefault();
  aboutSaveMsg.style.display = 'none';
  
  const submitBtn = document.getElementById('about-submit-btn');
  setLoading(submitBtn, true);

  const payload = {
    heroTitle: aboutTitleInput.value.trim(),
    heroSubtitle: aboutSubtitleInput.value.trim(),
    story: aboutStoryInput.value.trim(),
    vision: aboutVisionInput.value.trim(),
    mission: aboutMissionInput.value.trim(),
  };

  const result = await updateAbout(payload);
  setLoading(submitBtn, false);

  if (result.success) {
    aboutSaveMsg.textContent = 'تم حفظ محتوى صفحة "من نحن" بنجاح';
    aboutSaveMsg.className = 'success-alert';
    aboutSaveMsg.style.display = 'block';
  } else {
    aboutSaveMsg.textContent = result.message || 'فشل حفظ التعديلات';
    aboutSaveMsg.className = 'error-alert';
    aboutSaveMsg.style.display = 'block';
  }
}

/* ─── 8. UI HELPERS ─── */

function setLoading(buttonEl, isLoading) {
  const textEl = buttonEl.querySelector('span');
  const spinnerEl = buttonEl.querySelector('.spinner');

  if (isLoading) {
    buttonEl.disabled = true;
    if (spinnerEl) spinnerEl.style.display = 'inline-block';
  } else {
    buttonEl.disabled = false;
    if (spinnerEl) spinnerEl.style.display = 'none';
  }
}
