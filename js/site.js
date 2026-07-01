/**
 * Princesses — Main Application Script (ES Module)
 * Dynamically fetches data from Google Apps Script Web App API, falling back to local data.
 */

import { CONFIG, formatPrice, resolvePath, buildWhatsAppUrl } from './config.js';
import { getDresses, getCategories, getAbout } from './api.js';

let DATA = window.PRINCESSES || { dresses: [], categories: [] };

/* ─── Page Loader ─── */

function hideLoader() {
  var loader = document.getElementById('page-loader');
  if (loader) {
    // Small delay so the page doesn't flash
    setTimeout(function () { loader.classList.add('hidden'); }, 300);
  }
}

function showSkeletons(container, count) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count || 4 }, function () {
    return '<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line skeleton-line--short"></div><div class="skeleton-line skeleton-line--price"></div></div></div>';
  }).join('');
}

/* ─── Helpers ─── */

function $(sel, parent) {
  return (parent || document).querySelector(sel);
}

function $$(sel, parent) {
  return Array.prototype.slice.call((parent || document).querySelectorAll(sel));
}

function isInPages() {
  return /pages[/\\]/i.test(window.location.pathname);
}

function dressUrl(id) {
  return (isInPages() ? '' : 'pages/') + 'dress.html?id=' + encodeURIComponent(id);
}

function dressesUrl(category) {
  var url = (isInPages() ? '' : 'pages/') + 'dresses.html';
  if (category && category !== 'الكل') url += '?category=' + encodeURIComponent(category);
  return url;
}

function getDress(id) {
  return DATA.dresses.find(function (d) { return String(d.id) === String(id); });
}

/* ─── Dress Card HTML ─── */

function dressCard(dress) {
  var img = (dress.images && dress.images[0]) || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80';
  var price = dress.price ? '<p class="card__price">' + formatPrice(dress.price) + '</p>' : '';

  return (
    '<article class="card">' +
      '<a href="' + dressUrl(dress.id) + '" class="card__link">' +
        '<div class="card__image-wrapper">' +
          '<img src="' + img + '" alt="' + dress.name + '" class="card__image" loading="lazy">' +
        '</div>' +
        '<div class="card__body">' +
          (dress.category ? '<span class="card__category">' + dress.category + '</span>' : '') +
          '<h3 class="card__title">' + dress.name + '</h3>' +
          price +
        '</div>' +
      '</a>' +
    '</article>'
  );
}

function renderGrid(container, dresses) {
  if (!container) return;
  if (!dresses.length) {
    container.innerHTML = '<p class="empty-msg">لا توجد فساتين حالياً.</p>';
    return;
  }
  container.innerHTML = dresses.map(dressCard).join('');
}

/* ─── Navigation & Floating Elements ─── */

function initNav() {
  var header = $('#site-header');
  var toggle = $('#nav-toggle');
  var mobileNav = $('#mobile-nav');

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('header--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('nav-toggle--open');
      mobileNav.classList.toggle('mobile-nav--open', open);
      toggle.setAttribute('aria-expanded', open);
      mobileNav.setAttribute('aria-hidden', !open);
      document.body.classList.toggle('no-scroll', open);
    });

    $$('.mobile-nav__link', mobileNav).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('nav-toggle--open');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.classList.remove('no-scroll');
      });
    });
  }
}

function initWhatsApp() {
  if ($('#whatsapp-float')) return;
  var a = document.createElement('a');
  a.id = 'whatsapp-float';
  a.className = 'whatsapp-float';
  a.href = buildWhatsAppUrl('مرحباً، أود الاستفسار عن خدمات Princesses');
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', 'واتساب');
  a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(a);
}

/* ─── Page Renderers ─── */

function initHome() {
  var featured = DATA.dresses.filter(function (d) { return d.featured && !d.hidden; });
  renderGrid($('#featured-dresses-grid'), featured.slice(0, 4));

  var latest = DATA.dresses
    .filter(function (d) { return !d.hidden; })
    .slice()
    .reverse()
    .slice(0, 4);
  renderGrid($('#latest-dresses-grid'), latest);

  var ctaDresses = $('#hero-cta-dresses');
  var ctaWa = $('#hero-cta-whatsapp');
  if (ctaDresses) ctaDresses.href = dressesUrl();
  if (ctaWa) ctaWa.href = buildWhatsAppUrl('مرحباً، أود الاستفسار عن خدمات Princesses');
}

function initDressesList() {
  var params = new URLSearchParams(window.location.search);
  var category = params.get('category') || 'الكل';

  var filtered = category === 'الكل'
    ? DATA.dresses.filter(function (d) { return !d.hidden; })
    : DATA.dresses.filter(function (d) { return d.category === category && !d.hidden; });

  renderGrid($('#dresses-grid'), filtered);

  var filters = $('#category-filters');
  if (filters) {
    filters.innerHTML = DATA.categories.map(function (cat) {
      var active = cat === category ? ' filter-btn--active' : '';
      return '<a href="' + dressesUrl(cat === 'الكل' ? null : cat) + '" class="filter-btn' + active + '">' + cat + '</a>';
    }).join('');
  }
}

function initDressDetail() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var dress = getDress(id);
  var root = $('#dress-detail');

  if (!dress || !root) {
    if (root) root.innerHTML = '<p class="empty-msg">الفستان غير موجود. <a href="dresses.html">العودة للفساتين</a></p>';
    return;
  }

  document.title = dress.name + ' | Princesses';

  var images = dress.images || [];
  var mainImg = images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80';

  var infoRows = [
    ['التصنيف', dress.category],
    ['اللون', dress.color],
    ['السعر', dress.price ? formatPrice(dress.price) : ''],
    ['نوع القماش', dress.fabricType],
    ['كمية القماش المقدرة', dress.estimatedFabric],
    ['مدة العمل التقريبية', dress.estimatedDuration],
    ['تفاصيل التصميم وملاحظات', dress.notes],
  ].filter(function (row) { return row[1]; });

  var infoHtml = infoRows.map(function (row) {
    return '<div class="dress-info__row"><span class="dress-info__label">' + row[0] + '</span><span class="dress-info__value">' + row[1] + '</span></div>';
  }).join('');

  var thumbs = images.map(function (src, i) {
    return '<button type="button" class="dress-gallery__thumb' + (i === 0 ? ' dress-gallery__thumb--active' : '') + '" data-src="' + src + '"><img src="' + src + '" alt=""></button>';
  }).join('');

  var related = DATA.dresses
    .filter(function (d) { return d.id !== dress.id && d.category === dress.category && !d.hidden; })
    .slice(0, 3);

  root.innerHTML =
    '<div class="dress-detail">' +
      '<div class="dress-gallery">' +
        '<div class="dress-gallery__main"><img id="dress-main-img" src="' + mainImg + '" alt="' + dress.name + '"></div>' +
        (images.length > 1 ? '<div class="dress-gallery__thumbs">' + thumbs + '</div>' : '') +
      '</div>' +
      '<div class="dress-info">' +
        '<h1 class="dress-info__title">' + dress.name + '</h1>' +
        infoHtml +
        '<a href="' + buildWhatsAppUrl('مرحباً، أود الاستفسار عن فستان: ' + dress.name) + '" class="btn btn--whatsapp btn--lg" target="_blank" rel="noopener">استفسر عن هذا الفستان</a>' +
      '</div>' +
    '</div>' +
    (related.length ? '<section class="section section--white"><div class="container"><h2 class="section-header__title" style="margin-bottom:1.5rem">فساتين مشابهة</h2><div class="grid grid--3" id="related-dresses"></div></div></section>' : '');

  $$('.dress-gallery__thumb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $('#dress-main-img').src = btn.dataset.src;
      $$('.dress-gallery__thumb').forEach(function (b) { b.classList.remove('dress-gallery__thumb--active'); });
      btn.classList.add('dress-gallery__thumb--active');
    });
  });

  renderGrid($('#related-dresses'), related);
}

function initAbout(aboutData) {
  const root = $('.content-page');
  if (!root || !aboutData) return;

  root.innerHTML = `
    <h1>${aboutData.heroTitle || 'قصة Princesses'}</h1>
    <p>${aboutData.heroSubtitle || ''}</p>
    <p style="margin-top: var(--space-md)">${aboutData.story || ''}</p>

    ${aboutData.vision ? `<h2>رؤيتنا</h2><p>${aboutData.vision}</p>` : ''}
    ${aboutData.mission ? `<h2>رسالتنا</h2><p>${aboutData.mission}</p>` : ''}

    <h2>قيمنا</h2>
    <ul style="list-style:disc;padding-right:1.5rem;color:var(--color-text-muted)">
      <li><strong>الجودة</strong> — أجود الأقمشة والخياطة</li>
      <li><strong>الأناقة</strong> — تصاميم عصرية بلمسة فاخرة</li>
      <li><strong>الثقة</strong> — علاقة طويلة الأمد مع كل عميلة</li>
    </ul>

    <h2>خبرتنا</h2>
    <p>أكثر من 30 عاما من الخبرة في تصميم وتفصيل الفساتين لآلاف العميلات السعيدات.</p>
  `;
}

async function syncDataFromApi() {
  try {
    const [dressesRes, categoriesRes, aboutRes] = await Promise.all([
      getDresses(),
      getCategories(),
      getAbout()
    ]);

    if (dressesRes.success && dressesRes.data) {
      DATA.dresses = dressesRes.data;
    }
    if (categoriesRes.success && categoriesRes.data) {
      // Format to array of names, adding "الكل" at the beginning
      DATA.categories = ['الكل', ...categoriesRes.data.map(c => c.name)];
    }

    return aboutRes.success ? aboutRes.data : null;
  } catch (err) {
    console.error('Error syncing dynamic data:', err);
    return null;
  }
}

/* ─── Init ─── */

async function init() {
  initNav();
  initWhatsApp();

  var page = document.body.dataset.page;

  // Show skeleton grids while fetching
  if (page === 'home') {
    showSkeletons($('#featured-dresses-grid'), 4);
    showSkeletons($('#latest-dresses-grid'), 4);
  }
  if (page === 'dresses') {
    showSkeletons($('#dresses-grid'), 8);
  }

  const aboutData = await syncDataFromApi();

  if (page === 'home') initHome();
  if (page === 'dresses') initDressesList();
  if (page === 'dress') initDressDetail();
  if (page === 'about' && aboutData) initAbout(aboutData);

  hideLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
