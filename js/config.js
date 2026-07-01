/**
 * Princesses — Central Configuration
 * Single source of truth for all site settings.
 * Update values here before deployment.
 */

export const CONFIG = {
  business: {
    name: 'Princesses',
    nameAr: 'Princesses',
    tagline: 'أناقة مُفصّلة لك',
    founded: 2008,
  },

  contact: {
    whatsapp: '+966500000000',
    phone: '+966500000000',
    email: 'info@princesses.com',
    address: 'الرياض، المملكة العربية السعودية',
    mapsUrl: 'https://maps.google.com/?q=Riyadh',
  },

  hours: {
    weekdays: 'السبت – الخميس: 10 ص – 9 م',
    friday: 'الجمعة: 4 م – 9 م',
  },

  social: {
    instagram: 'https://instagram.com/princesses',
    tiktok: 'https://tiktok.com/@princesses',
    snapchat: 'https://snapchat.com/add/princesses',
  },

  api: {
    baseUrl: 'https://script.google.com/macros/s/AKfycbx7PfbNF0B3RfVSpVCNMUgs_JstdSEaB8Zsv0opq6EqABK9FxLUJSBUpOERgErdDVAF/exec',
  },

  theme: {
    colors: {
      white: '#FFFFFF',
      cream: '#FAF9F6',
      beige: '#F5EDE6',
      beigeDark: '#E8DDD4',
      pinkSoft: '#F7F2EB',
      pink: '#E3D5CA',
      roseGold: '#C5A880',
      roseGoldLight: '#DFD3C3',
      text: '#2C2C2C',
      textMuted: '#6B6B6B',
      textLight: '#9A9A9A',
    },
  },

  seo: {
    defaultTitle: 'Princesses | خياطة فساتين فاخرة',
    defaultDescription:
      'Princesses — ورشة خياطة فساتين فاخرة منذ 2008. تصاميم أنيقة مُفصّلة بعناية لتمنحك إطلالة استثنائية.',
    siteUrl: 'https://your-username.github.io/princesses',
    locale: 'ar_SA',
  },

  paths: {
    home: '/',
    dresses: '/pages/dresses.html',
    categories: '/pages/categories.html',
    gallery: '/pages/gallery.html',
    about: '/pages/about.html',
    contact: '/pages/contact.html',
    dressDetail: '/pages/dress.html',
  },

  pagination: {
    dressesPerPage: 12,
  },

  animations: {
    loadingDuration: 2200,
    aosDuration: 800,
    aosOnce: true,
  },
};

/**
 * Resolve asset paths relative to site root.
 * Works on GitHub Pages subpath deployments.
 */
export function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '..';
  return '.';
}

export function resolvePath(relativePath) {
  const base = getBasePath();
  return `${base}/${relativePath.replace(/^\//, '')}`;
}

export function buildWhatsAppUrl(message) {
  const phone = CONFIG.contact.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildDressWhatsAppMessage(dress) {
  const parts = ['مرحباً، أود الاستفسار عن فستان'];
  if (dress?.name) parts.push(`: ${dress.name}`);
  if (dress?.id) parts.push(`(رقم: ${dress.id})`);
  return parts.join(' ');
}

export function formatPrice(price) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(price);
}
