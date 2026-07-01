/**
 * Site Header — Navigation with mobile menu & scroll effect
 */

import { CONFIG, resolvePath, buildWhatsAppUrl } from '../config.js';

const NAV_ITEMS = [
  { label: 'الرئيسية', href: 'index.html', page: 'home' },
  { label: 'الفساتين', href: 'pages/dresses.html', page: 'dresses' },
  { label: 'التصنيفات', href: 'pages/categories.html', page: 'categories' },
  { label: 'المعرض', href: 'pages/gallery.html', page: 'gallery' },
  { label: 'من نحن', href: 'pages/about.html', page: 'about' },
  { label: 'تواصل', href: 'pages/contact.html', page: 'contact' },
];

function getNavHref(href) {
  const base = resolvePath('');
  if (href === 'index.html') {
    return base === '..' ? '../index.html' : './index.html';
  }
  return resolvePath(href);
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.endsWith('/') || path.endsWith('index.html')) return 'home';
  if (path.includes('dresses')) return 'dresses';
  if (path.includes('categories')) return 'categories';
  if (path.includes('gallery')) return 'gallery';
  if (path.includes('about')) return 'about';
  if (path.includes('contact')) return 'contact';
  if (path.includes('dress.html')) return 'dresses';
  return '';
}

function renderNavLinks(className, linkClass) {
  const current = getCurrentPage();
  return NAV_ITEMS.map(({ label, href, page }) => {
    const active = current === page ? `${linkClass}--active` : '';
    return `<li><a href="${getNavHref(href)}" class="${linkClass} ${active}">${label}</a></li>`;
  }).join('');
}

export function renderHeader(container) {
  /* Use existing static header if already in HTML */
  if (document.getElementById('site-header')) {
    initHeaderBehavior();
    return;
  }

  const logoSrc = resolvePath('assets/images/logo.png');
  const homeHref = getNavHref('index.html');

  container.innerHTML = `
    <header class="header" id="site-header" role="banner">
      <div class="header__inner">
        <a href="${homeHref}" class="header__logo" aria-label="${CONFIG.business.name} — الصفحة الرئيسية">
          <img src="${logoSrc}" alt="${CONFIG.business.name}" width="160" height="36">
        </a>

        <nav class="nav" aria-label="التنقل الرئيسي">
          <ul class="nav__list">
            ${renderNavLinks('nav__list', 'nav__link')}
          </ul>
        </nav>

        <button class="nav-toggle" id="nav-toggle" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-nav">
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
          <span class="nav-toggle__bar"></span>
        </button>
      </div>
    </header>

    <nav class="mobile-nav" id="mobile-nav" aria-label="قائمة الجوال" aria-hidden="true">
      <ul class="mobile-nav__list">
        ${renderNavLinks('mobile-nav__list', 'mobile-nav__link')}
      </ul>
    </nav>
  `;

  initHeaderBehavior();
}

export function initHeaderBehavior() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  /* Scroll effect */
  let lastScroll = 0;
  const onScroll = () => {
    const scrollY = window.scrollY;
    header.classList.toggle('header--scrolled', scrollY > 40);
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu toggle */
  toggle?.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('nav-toggle--open');
    mobileNav.classList.toggle('mobile-nav--open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  });

  /* Close mobile nav on link click */
  mobileNav?.querySelectorAll('.mobile-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('nav-toggle--open');
      mobileNav.classList.remove('mobile-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    });
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
      toggle.click();
    }
  });
}
