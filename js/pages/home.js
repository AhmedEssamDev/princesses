/**
 * Home Page — Entry point (sections filled in Phase 3)
 */

import { bootstrap } from '../app.js';
import { CONFIG, resolvePath, buildWhatsAppUrl } from '../config.js';

bootstrap({ loading: true, whatsapp: true });

/* Hero CTA links are static; dynamic sections added in Phase 3 */
onReady(() => {
  const dressesBtn = document.getElementById('hero-cta-dresses');
  const whatsappBtn = document.getElementById('hero-cta-whatsapp');

  if (dressesBtn) {
    dressesBtn.href = resolvePath('pages/dresses.html');
  }

  if (whatsappBtn) {
    whatsappBtn.href = buildWhatsAppUrl(
      `مرحباً، أود الاستفسار عن خدمات ${CONFIG.business.name}`
    );
  }
});

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}
