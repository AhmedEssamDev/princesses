/**
 * Site Footer — Links, contact info, social media
 */

import { CONFIG, resolvePath, getBasePath } from '../config.js';

const FOOTER_LINKS = [
  { label: 'الرئيسية', href: 'index.html' },
  { label: 'الفساتين', href: 'pages/dresses.html' },
  { label: 'التصنيفات', href: 'pages/categories.html' },
  { label: 'المعرض', href: 'pages/gallery.html' },
  { label: 'من نحن', href: 'pages/about.html' },
  { label: 'تواصل معنا', href: 'pages/contact.html' },
];

function linkHref(href) {
  if (href === 'index.html') {
    return getBasePath() === '..' ? '../index.html' : './index.html';
  }
  return resolvePath(href);
}

const SOCIAL_ICONS = {
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.07a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.91 1.62V6.86a4.85 4.85 0 0 1-1-.17z"/></svg>`,
  snapchat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C9.5 2 7.5 3.5 7 5.5c-.5 0-1 .2-1.3.5-.4.4-.5 1-.5 1.5 0 .8.4 1.5 1 2-.3.2-.5.5-.5.9 0 .6.5 1.1 1.1 1.1.1 1.5 1.3 2.7 2.8 2.9.3.5.8.9 1.4 1.1-.1.3-.2.7-.2 1.1 0 .6.2 1 .5 1.3.3.3.7.5 1.2.5h4.4c.5 0 .9-.2 1.2-.5.3-.3.5-.7.5-1.3 0-.4-.1-.8-.2-1.1.6-.2 1.1-.6 1.4-1.1 1.5-.2 2.7-1.4 2.8-2.9.6 0 1.1-.5 1.1-1.1 0-.4-.2-.7-.5-.9.6-.5 1-1.2 1-2 0-.5-.1-1.1-.5-1.5-.3-.3-.8-.5-1.3-.5C16.5 3.5 14.5 2 12 2z"/></svg>`,
};

export function renderFooter(container) {
  /* Use existing static footer if already in HTML */
  if (container?.querySelector('.footer') || document.querySelector('.footer')) {
    return;
  }

  const logoSrc = resolvePath('assets/images/logo.png');
  const year = new Date().getFullYear();

  const socialLinks = Object.entries(CONFIG.social)
    .filter(([, url]) => url)
    .map(([platform, url]) => {
      const icon = SOCIAL_ICONS[platform] || '';
      const label = { instagram: 'إنستغرام', tiktok: 'تيك توك', snapchat: 'سناب شات' }[platform] || platform;
      return `<a href="${url}" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon}</a>`;
    })
    .join('');

  container.innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <img src="${logoSrc}" alt="${CONFIG.business.name}" class="footer__logo" width="160" height="40">
            <p class="footer__tagline">${CONFIG.business.tagline}</p>
            <div class="footer__social" style="margin-top: var(--space-lg)">
              ${socialLinks}
            </div>
          </div>

          <div>
            <h3 class="footer__heading">روابط سريعة</h3>
            <ul class="footer__links">
              ${FOOTER_LINKS.map(({ label, href }) =>
                `<li><a href="${linkHref(href)}" class="footer__link">${label}</a></li>`
              ).join('')}
            </ul>
          </div>

          <div>
            <h3 class="footer__heading">تواصل معنا</h3>
            <div class="footer__contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${CONFIG.contact.address}</span>
            </div>
            <div class="footer__contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span dir="ltr">${CONFIG.contact.phone}</span>
            </div>
            <div class="footer__contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>${CONFIG.contact.email}</span>
            </div>
          </div>

          <div>
            <h3 class="footer__heading">ساعات العمل</h3>
            <div class="footer__contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${CONFIG.hours.weekdays}</span>
            </div>
            <div class="footer__contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${CONFIG.hours.friday}</span>
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <p>&copy; ${year} ${CONFIG.business.name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  `;
}
