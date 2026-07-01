/**
 * Princesses — Application Bootstrap
 * Initializes shared components across all pages.
 */

import { CONFIG } from './config.js';
import { onReady } from './utils/dom.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initLoadingScreen } from './components/loading-screen.js';
import { initWhatsAppFloat } from './components/whatsapp-float.js';
import { initAnimations } from './animations.js';

/**
 * Bootstrap the application shell (header, footer, loading, whatsapp).
 * @param {Object} options
 * @param {boolean} [options.loading=true] — Show loading screen
 * @param {boolean} [options.whatsapp=true] — Show WhatsApp float button
 * @param {string}  [options.whatsappMessage] — Custom WhatsApp message
 * @param {boolean} [options.animations=true] — Initialize GSAP/AOS
 */
export function bootstrap(options = {}) {
  const {
    loading = true,
    whatsapp = true,
    whatsappMessage,
    animations = true,
  } = options;

  onReady(async () => {
    /* Shared layout components */
    const headerEl = document.getElementById('site-header-root');
    const footerEl = document.getElementById('site-footer-root');

    if (headerEl) renderHeader(headerEl);
    if (footerEl) renderFooter(footerEl);

    /* Inject decorative shapes only if not in HTML */
    injectBackgroundShapes();

    if (loading) initLoadingScreen();
    if (whatsapp) initWhatsAppFloat(whatsappMessage);
    if (animations) await initAnimations();

    document.body.classList.add('page-enter');
  });
}

function injectBackgroundShapes() {
  if (document.querySelector('.bg-shapes')) return;

  const shapes = document.createElement('div');
  shapes.className = 'bg-shapes';
  shapes.setAttribute('aria-hidden', 'true');
  shapes.innerHTML = `
    <div class="bg-shape bg-shape--1 float-element"></div>
    <div class="bg-shape bg-shape--2 float-element float-element--delay-1"></div>
    <div class="bg-shape bg-shape--3 float-element float-element--delay-2"></div>
    <div class="bg-shape bg-shape--4 float-element float-element--delay-3"></div>
  `;
  document.body.prepend(shapes);
}

export { CONFIG };
