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
    founded: 1996,
  },

  contact: {
    whatsapp: '+201283293727',
    phone: '+201283293727',
    email: 'info@princesses.com',
    address: 'الزقازيق، مصر',
    mapsUrl: 'https://maps.google.com/?q=Zagazig',
  },

  hours: {
    weekdays: 'السبت للخميس: من 6 مساءً حتى 12 منتصف الليل',
    friday: 'الجمعة: مغلق', // Assuming Friday is not specified, or just remove friday
  },

  social: {
    facebook: 'https://www.facebook.com/princesses.78',
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
      'Princesses — ورشة خياطة فساتين فاخرة منذ 1996. تصاميم أنيقة مُفصّلة بعناية لتمنحك إطلالة استثنائية.',
    siteUrl: 'https://your-username.github.io/princesses',
    locale: 'ar_EG',
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
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
}
