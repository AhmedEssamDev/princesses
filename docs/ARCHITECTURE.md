# Princesses — خطة المعمارية والمشروع

> **الخطوة 1:** التخطيط والمعمارية  
> **الحالة:** مكتمل — جاهز للتنفيذ  
> **التاريخ:** يوليو 2026

---

## 1. نظرة عامة

**Princesses** موقع عربي (RTL) لورشة خياطة فساتين فاخرة. يجمع بين:

| الطبقة | التقنية |
|--------|---------|
| الواجهة | HTML5 + CSS3 + Vanilla JS (ES Modules) |
| الاستضافة | GitHub Pages (Static) |
| الـ API | Google Apps Script (Web App) |
| قاعدة البيانات | Google Sheets |
| الصور | Google Drive |
| التحكم بالإصدارات | Git |

### مبدأ التصميم المعماري

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Static)                     │
│  HTML Pages │ CSS Modules │ JS Modules │ config.js          │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch() — REST JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Apps Script Web App (API)                │
│  doGet / doPost │ Auth Middleware │ CRUD Handlers           │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────────────┐
│   Google Sheets      │      │      Google Drive            │
│  Dresses, Categories │      │  /Princesses/Images/         │
│  Gallery, Testimonials│      │  Public URLs stored in Sheet │
│  About, Settings     │      └──────────────────────────────┘
└──────────────────────┘
```

**لماذا هذا النمط؟**
- GitHub Pages مجاني وسريع للملفات الثابتة
- Google Apps Script يوفر backend بدون سيرفر
- Google Sheets سهل الإدارة والنسخ الاحتياطي
- الفصل بين Frontend و API يسمح بالصيانة المستقلة

---

## 2. هيكل المجلدات

```
princesses/
├── index.html                    # الصفحة الرئيسية
├── 404.html
├── robots.txt
├── sitemap.xml
│
├── assets/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero/                 # صور ثابتة للموقع
│   │   ├── placeholders/         # fallback فقط عند فشل التحميل
│   │   └── decorative/           # أشكال زخرفية خلفية
│   ├── icons/                    # SVG icons
│   └── fonts/                    # Cairo + Alexandria (self-hosted)
│
├── css/
│   ├── base.css                  # Reset, variables, typography
│   ├── layout.css                # Grid, containers, sections
│   ├── components.css            # Cards, buttons, forms, nav
│   ├── animations.css            # Keyframes, transitions
│   ├── pages/                    # Page-specific overrides
│   │   ├── home.css
│   │   ├── dresses.css
│   │   ├── dress-detail.css
│   │   ├── gallery.css
│   │   ├── about.css
│   │   ├── contact.css
│   │   └── admin.css
│   └── responsive.css            # Breakpoints (mobile-first)
│
├── js/
│   ├── config.js                 # ⚙️ إعدادات مركزية (مصدر واحد للحقيقة)
│   ├── app.js                    # Bootstrap, routing helpers, init
│   ├── api.js                    # HTTP client → GAS endpoints
│   ├── components/
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── nav.js
│   │   ├── dress-card.js
│   │   ├── loading-screen.js
│   │   ├── whatsapp-float.js
│   │   └── lightbox.js
│   ├── pages/
│   │   ├── home.js
│   │   ├── dresses.js
│   │   ├── dress-detail.js
│   │   ├── gallery.js
│   │   ├── about.js
│   │   ├── contact.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── format.js             # تنسيق الأسعار، التواريخ
│   │   ├── sanitize.js           # XSS prevention
│   │   ├── lazy-load.js
│   │   └── url.js                # Query params, friendly URLs
│   ├── search.js
│   ├── filters.js
│   ├── gallery.js                # Masonry + lightbox logic
│   └── animations.js             # GSAP + AOS init
│
├── pages/
│   ├── about.html
│   ├── gallery.html
│   ├── dresses.html
│   ├── dress.html                # ?id=xxx
│   ├── categories.html
│   ├── contact.html
│   └── secret-admin.html         # /pages/secret-admin.html
│
├── gas/
│   ├── Code.gs                   # Entry point
│   ├── Config.gs                 # Sheet IDs, folder IDs, secrets
│   ├── Auth.gs                   # Login/session tokens
│   ├── Router.gs                 # Route dispatcher
│   ├── SheetsService.gs          # CRUD for all entities
│   ├── DriveService.gs           # Upload, delete, public URL
│   ├── DressesHandler.gs
│   ├── CategoriesHandler.gs
│   ├── GalleryHandler.gs
│   ├── TestimonialsHandler.gs
│   ├── AboutHandler.gs
│   └── Utils.gs                  # JSON response, validation
│
├── docs/
│   └── ARCHITECTURE.md             # هذا الملف
│
└── README.md
```

---

## 3. نظام التصميم (Design System)

### 3.1 الألوان (CSS Custom Properties)

```css
:root {
  /* Primary Palette */
  --color-white:        #FFFFFF;
  --color-cream:        #FAF7F5;
  --color-beige:        #F5EDE6;
  --color-beige-dark:   #E8DDD4;
  --color-pink-soft:    #F8E8EE;
  --color-pink:         #E8B4BC;
  --color-rose-gold:    #B76E79;
  --color-rose-gold-light: #D4A5A5;
  --color-text:         #2C2C2C;
  --color-text-muted:   #6B6B6B;
  --color-text-light:   #9A9A9A;

  /* Glassmorphism */
  --glass-bg:           rgba(255, 255, 255, 0.72);
  --glass-border:       rgba(255, 255, 255, 0.45);
  --glass-blur:         16px;

  /* Shadows */
  --shadow-soft:        0 4px 24px rgba(183, 110, 121, 0.08);
  --shadow-medium:      0 8px 32px rgba(183, 110, 121, 0.12);
  --shadow-hover:       0 12px 40px rgba(183, 110, 121, 0.18);

  /* Spacing Scale (8px base) */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;

  /* Border Radius */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  28px;
  --radius-full: 9999px;

  /* Typography */
  --font-display: 'Alexandria', sans-serif;
  --font-body:    'Cairo', sans-serif;

  /* Transitions */
  --transition-fast:   200ms ease;
  --transition-normal: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Layout */
  --container-max: 1280px;
  --header-height: 72px;
}
```

### 3.2 Typography Scale

| الاستخدام | الخط | الحجم (Desktop) | الوزن |
|-----------|------|-----------------|-------|
| Hero Title | Alexandria | clamp(2rem, 5vw, 3.5rem) | 700 |
| Section Title | Alexandria | clamp(1.5rem, 3vw, 2.25rem) | 600 |
| Card Title | Alexandria | 1.125rem | 600 |
| Body | Cairo | 1rem | 400 |
| Small/Caption | Cairo | 0.875rem | 400 |
| Price | Alexandria | 1.25rem | 700 |

### 3.3 Breakpoints (Mobile First)

```css
/* Base: 0–639px (mobile) */
@media (min-width: 640px)  { /* sm — large phones */ }
@media (min-width: 768px)  { /* md — tablets */ }
@media (min-width: 1024px) { /* lg — laptops */ }
@media (min-width: 1280px) { /* xl — desktops */ }
```

### 3.4 مكتبات خارجية (CDN)

| المكتبة | الاستخدام | التحميل |
|---------|-----------|---------|
| GSAP 3.x | Hero animations, page transitions | defer |
| AOS 2.x | Scroll reveal | defer |
| — | لا jQuery — Vanilla JS فقط | — |

---

## 4. نموذج البيانات (Data Models)

### 4.1 Dress (الفساتين)

```typescript
interface Dress {
  id: string;              // UUID — مطلوب
  name?: string;
  category?: string;       // slug أو اسم التصنيف
  color?: string;
  price?: number;          // بالريال/العملة المحلية
  fabricType?: string;
  estimatedFabric?: string;
  estimatedDuration?: string;
  sizes?: string;          // JSON string: [{size, bust, waist, hip, length}]
  notes?: string;
  images?: string;         // JSON string: ["url1", "url2"]
  featured?: boolean;      // default: false
  hidden?: boolean;        // default: false
  createdAt?: string;      // ISO 8601
  updatedAt?: string;
}
```

### 4.2 Category (التصنيفات)

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;           // SVG path أو emoji
  description?: string;
  order?: number;
  hidden?: boolean;
}
```

### 4.3 Gallery Item

```typescript
interface GalleryItem {
  id: string;
  title?: string;
  imageUrl: string;
  order?: number;
  hidden?: boolean;
  createdAt?: string;
}
```

### 4.4 Testimonial

```typescript
interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating?: number;         // 1–5
  avatar?: string;
  order?: number;
  hidden?: boolean;
}
```

### 4.5 About (صفحة واحدة — key-value)

```typescript
interface AboutContent {
  heroTitle?: string;
  heroSubtitle?: string;
  story?: string;            // HTML-safe markdown/plain
  vision?: string;
  mission?: string;
  values?: string;           // JSON: [{title, description}]
  experience?: string;
  quality?: string;
  customerSatisfaction?: string;
  updatedAt?: string;
}
```

---

## 5. Google Sheets — هيكل الأوراق

### Sheet: `Dresses`

| Column | Type | Notes |
|--------|------|-------|
| ID | string | Primary key |
| Name | string | |
| Category | string | |
| Color | string | |
| Price | number | |
| Fabric Type | string | |
| Estimated Fabric | string | |
| Estimated Duration | string | |
| Sizes | string | JSON |
| Notes | string | |
| Images | string | JSON array of URLs |
| Featured | boolean | TRUE/FALSE |
| Hidden | boolean | TRUE/FALSE |
| Created At | datetime | |
| Updated At | datetime | |

### Sheet: `Categories`

| ID | Name | Slug | Icon | Description | Order | Hidden |

### Sheet: `Gallery`

| ID | Title | Image URL | Order | Hidden | Created At |

### Sheet: `Testimonials`

| ID | Name | Text | Rating | Avatar | Order | Hidden |

### Sheet: `About`

| Key | Value | Updated At |

*(Key-Value pairs: heroTitle, story, vision, mission, values, etc.)*

### Sheet: `Settings`

| Key | Value |
|-----|-------|
| admin_password_hash | bcrypt-like hash |
| session_secret | random string |

---

## 6. Google Apps Script API

### 6.1 Base URL

```
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

### 6.2 Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "optional",
  "error": null
}
```

### 6.3 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `?action=dresses` | No | List all visible dresses |
| GET | `?action=dress&id={id}` | No | Single dress |
| POST | `?action=dress` | Yes | Create dress |
| PUT | `?action=dress&id={id}` | Yes | Update dress |
| DELETE | `?action=dress&id={id}` | Yes | Delete dress |
| GET | `?action=categories` | No | List categories |
| POST | `?action=category` | Yes | Create |
| PUT | `?action=category&id={id}` | Yes | Update |
| DELETE | `?action=category&id={id}` | Yes | Delete |
| GET | `?action=gallery` | No | List gallery |
| POST | `?action=gallery` | Yes | Add item |
| PUT | `?action=gallery&id={id}` | Yes | Update |
| DELETE | `?action=gallery&id={id}` | Yes | Delete |
| GET | `?action=testimonials` | No | List |
| POST | `?action=testimonial` | Yes | Create |
| PUT | `?action=testimonial&id={id}` | Yes | Update |
| DELETE | `?action=testimonial&id={id}` | Yes | Delete |
| GET | `?action=about` | No | Get about content |
| PUT | `?action=about` | Yes | Update about |
| POST | `?action=login` | No | Admin login → token |
| POST | `?action=upload` | Yes | Upload image → Drive URL |
| GET | `?action=admin/dresses` | Yes | All dresses incl. hidden |

### 6.4 Authentication Flow

```
1. Admin POST /login { password }
2. GAS validates against Settings sheet hash
3. Returns { token: "signed-jwt-like-string", expires: timestamp }
4. Frontend stores token in sessionStorage
5. All admin requests: Authorization: Bearer {token}
6. GAS validates token signature + expiry on each request
```

### 6.5 CORS

GAS Web Apps deployed as "Anyone" with `doGet`/`doPost` returning JSON.
Frontend uses `mode: 'cors'` — GAS handles via `ContentService.createTextOutput`.

---

## 7. Google Drive — إدارة الصور

```
/Princesses/
├── dresses/
│   ├── {dress-id}/
│   │   ├── image-1.jpg
│   │   └── image-2.jpg
├── gallery/
│   └── {item-id}.jpg
└── testimonials/
    └── {id}-avatar.jpg
```

**Upload Flow:**
1. Admin selects images → Frontend compresses (Canvas API, max 1920px, quality 0.85)
2. POST base64 to `?action=upload` with folder path
3. GAS saves to Drive, sets sharing "Anyone with link can view"
4. Returns public URL → stored in Sheet

---

## 8. config.js — الإعدادات المركزية

```javascript
export const CONFIG = {
  business: {
    name: 'Princesses',
    nameAr: 'برincesses',
    tagline: 'أناقة مُفصّلة لك',
    founded: 2008,
  },
  contact: {
    whatsapp: '+966XXXXXXXXX',      // ← يُعدّل
    phone: '+966XXXXXXXXX',
    email: 'info@princesses.com',
    address: 'الرياض، المملكة العربية السعودية',
    mapsUrl: 'https://maps.google.com/...',
  },
  hours: {
    weekdays: 'السبت – الخميس: 10 ص – 9 م',
    friday: 'الجمعة: 4 م – 9 م',
  },
  social: {
    instagram: 'https://instagram.com/...',
    tiktok: 'https://tiktok.com/...',
    snapchat: 'https://snapchat.com/...',
  },
  api: {
    baseUrl: 'https://script.google.com/macros/s/XXX/exec',
  },
  theme: {
    colors: { /* mirrors CSS vars for JS use */ },
  },
  seo: {
    defaultTitle: 'Princesses | خياطة فساتين فاخرة',
    defaultDescription: '...',
    siteUrl: 'https://username.github.io/princesses',
  },
};
```

---

## 9. الصفحات — المواصفات التفصيلية

### 9.1 Home (`index.html`)

| Section | Components | Data Source |
|---------|------------|-------------|
| Loading Screen | Logo fade + progress | Static |
| Header/Nav | Sticky, glass effect | Static |
| Hero | Full-width banner, 2 CTAs | Static + optional API hero |
| Featured Dresses | Grid 2→4 cols | API: featured dresses |
| Categories | Icon cards | API: categories |
| Why Choose Us | 3–4 premium cards | Static content |
| Latest Dresses | Grid carousel | API: newest 8 |
| Testimonials | Slider/cards | API: testimonials |
| Instagram Gallery | Masonry preview | API: gallery (6 items) |
| Footer | Links, social, hours | config.js |
| WhatsApp Float | Fixed bottom-left (RTL) | config.js |

### 9.2 Dresses (`pages/dresses.html`)

- Search bar (debounced 300ms)
- Filter panel: Category, Color, Price range, Newest
- Sort: Price ↑↓, Name, Newest
- View toggle: Grid / List
- Pagination: 12 per page
- Lazy load images (Intersection Observer)
- Empty state + loading skeletons

### 9.3 Dress Detail (`pages/dress.html?id=`)

- Image gallery with thumbnails, zoom, lightbox
- Dynamic fields (hide if empty)
- Size table (responsive, scrollable on mobile)
- Related dresses (same category, max 4)
- WhatsApp CTA with pre-filled message

### 9.4 Categories (`pages/categories.html`)

- All categories as premium cards
- Link to filtered dresses page

### 9.5 Gallery (`pages/gallery.html`)

- CSS Masonry layout
- Lightbox with keyboard nav
- Lazy loading

### 9.6 About (`pages/about.html`)

- Brand story (since 2008)
- Vision, Mission, Values sections
- Timeline/experience block
- Content from API (editable via admin)

### 9.7 Contact (`pages/contact.html`)

- Contact card (glassmorphism)
- WhatsApp, Maps, Social links
- Working hours from config
- Optional contact form (future phase)

### 9.8 Secret Admin (`pages/secret-admin.html`)

- **NOT in navigation**
- Login screen → Dashboard
- Tabs: Dresses | Categories | Gallery | Testimonials | About
- CRUD for each entity
- Image upload with drag-drop, preview, remove
- Preview before publish toggle
- Search & sort in dress list

### 9.9 404 (`404.html`)

- Elegant error page with link home

---

## 10. SEO & Accessibility

### SEO Checklist

- [ ] `<html lang="ar" dir="rtl">` on every page
- [ ] Unique `<title>` and `<meta description>` per page
- [ ] Open Graph + Twitter Card meta tags
- [ ] JSON-LD Schema.org (`LocalBusiness`, `Product` on dress pages)
- [ ] `robots.txt` + `sitemap.xml`
- [ ] Semantic HTML5 (`header`, `main`, `nav`, `article`, `footer`)
- [ ] Canonical URLs
- [ ] `loading="lazy"` on images
- [ ] Preconnect to fonts CDN

### Accessibility Checklist

- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape for modals)
- [ ] Focus visible styles
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Alt text on all images
- [ ] Skip-to-content link
- [ ] Reduced motion: `@media (prefers-reduced-motion)`

---

## 11. الأداء (Performance)

| Technique | Implementation |
|-----------|----------------|
| Lazy Loading | `IntersectionObserver` + `loading="lazy"` |
| Image Compression | Client-side Canvas before upload; WebP where supported |
| Minification | Build step or manual minified copies in `/dist` |
| Code Splitting | ES Modules — page-specific imports only |
| Caching | `CacheService` in GAS for GET endpoints (5 min TTL) |
| Font Loading | `font-display: swap` + preload critical fonts |
| Critical CSS | Inline above-fold CSS in `<head>` (optional) |
| Debouncing | Search 300ms, resize 150ms |

**Target:** Lighthouse Performance ≥ 90 on mobile

---

## 12. الأمان (Security)

- Admin password hashed in Settings sheet (SHA-256 + salt via GAS Utilities)
- Session tokens signed with expiry (1 hour)
- Input sanitization on frontend (`sanitize.js`) and backend
- No secrets in `config.js` committed to Git — use `.env.example` pattern for API URL
- XSS prevention: never use `innerHTML` with user data; use `textContent` or DOMPurify
- Rate limiting on login endpoint (GAS CacheService counter)
- Hidden admin route not linked anywhere public

---

## 13. خطة التنفيذ — المراحل

### المرحلة 1 — الأساس (Foundation) ← **التالية**
- [ ] إنشاء هيكل المجلدات
- [ ] `config.js`
- [ ] CSS Design System (base, layout, components, responsive)
- [ ] Header, Footer, Loading Screen components
- [ ] `index.html` skeleton

### المرحلة 2 — Google Backend
- [ ] `Code.gs` + all GAS modules
- [ ] Auto-create Sheets on first run
- [ ] Drive folder setup
- [ ] All CRUD endpoints tested

### المرحلة 3 — الصفحة الرئيسية
- [ ] Hero, Featured, Categories, Why Us, Latest, Testimonials, Gallery preview
- [ ] GSAP + AOS animations
- [ ] WhatsApp float button

### المرحلة 4 — صفحات الفساتين
- [ ] Dresses listing (search, filter, sort, pagination)
- [ ] Dress detail page
- [ ] Categories page

### المرحلة 5 — صفحات المحتوى
- [ ] About (with API content)
- [ ] Gallery (masonry + lightbox)
- [ ] Contact
- [ ] 404

### المرحلة 6 — لوحة التحكم
- [ ] Login + auth flow
- [ ] Dress CRUD + image upload
- [ ] Categories, Gallery, Testimonials, About management
- [ ] Preview mode

### المرحلة 7 — SEO & Polish
- [ ] Meta tags, Schema.org, sitemap, robots.txt
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] README complete

### المرحلة 8 — النشر
- [ ] GitHub Pages deployment
- [ ] GAS Web App deployment
- [ ] Final testing on real devices

---

## 14. قرارات معمارية مهمة

| القرار | الاختيار | السبب |
|--------|----------|-------|
| No framework | Vanilla JS ES Modules | Lightweight, GitHub Pages friendly |
| No build step (initially) | Direct file serving | Simplicity; minification in Phase 7 |
| Single config.js | Central config | Easy client updates |
| GAS as REST | Query param routing | GAS limitation; works reliably |
| JSON in Sheet cells | sizes, images, values | Flexible schema without multiple sheets |
| sessionStorage for auth | Not localStorage | Session expires on tab close |
| Mobile-first CSS | min-width media queries | Better mobile UX for fashion browsing |
| Self-hosted fonts | Cairo + Alexandria | Performance + offline resilience |

---

## 15. WhatsApp Integration

```javascript
// utils/whatsapp.js
export function buildWhatsAppUrl(phone, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`;
}

// Dress detail example message:
// "مرحباً، أود الاستفسار عن فستان: {name} (رقم: {id})"
```

---

*نهاية الخطوة 1 — التخطيط والمعمارية*
