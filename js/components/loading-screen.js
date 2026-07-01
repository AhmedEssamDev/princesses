/**
 * Loading Screen — Elegant brand reveal on page load
 */

import { CONFIG, resolvePath } from '../config.js';

export function initLoadingScreen() {
  const existing = document.getElementById('loading-screen');
  if (existing) return hideLoadingScreen(existing);

  const logoSrc = resolvePath('assets/images/logo.png');
  let hidden = false;

  const safeHide = (screen) => {
    if (hidden) return;
    hidden = true;
    hideLoadingScreen(screen);
  };

  const screen = document.createElement('div');
  screen.id = 'loading-screen';
  screen.className = 'loading-screen';
  screen.setAttribute('role', 'status');
  screen.setAttribute('aria-label', 'جاري تحميل الموقع');
  screen.innerHTML = `
    <img src="${logoSrc}" alt="" class="loading-screen__logo" width="160" height="48">
    <p class="loading-screen__brand">${CONFIG.business.name.toUpperCase()}</p>
    <p class="loading-screen__tagline">${CONFIG.business.tagline}</p>
    <div class="loading-screen__progress" aria-hidden="true">
      <div class="loading-screen__progress-bar"></div>
    </div>
  `;

  document.body.prepend(screen);
  document.body.classList.add('no-scroll');

  const duration = CONFIG.animations.loadingDuration;

  window.addEventListener('load', () => {
    setTimeout(() => safeHide(screen), duration);
  });

  if (document.readyState === 'complete') {
    setTimeout(() => safeHide(screen), duration);
  }

  /* Safety: never block the page longer than 3 seconds */
  setTimeout(() => safeHide(screen), 3000);
}

function hideLoadingScreen(screen) {
  screen.classList.add('loading-screen--hidden');
  screen.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');

  setTimeout(() => screen.remove(), 600);
}
