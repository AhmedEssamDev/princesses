# Princesses — Google Apps Script Setup

## المتطلبات

- حساب Google
- Google Drive + Google Sheets

---

## 1. إنشاء مشروع Apps Script

1. افتح [script.google.com](https://script.google.com)
2. **New project** → سمّه `Princesses API`
3. انسخ محتوى كل ملف من مجلد `gas/` إلى مشروع Apps Script:

| الملف المحلي | ملف Apps Script |
|-------------|-----------------|
| `Code.gs` | Code.gs |
| `Config.gs` | Config.gs |
| `Utils.gs` | Utils.gs |
| `Auth.gs` | Auth.gs |
| `Router.gs` | Router.gs |
| `SheetsService.gs` | SheetsService.gs |
| `DriveService.gs` | DriveService.gs |
| `DressesHandler.gs` | DressesHandler.gs |
| `CategoriesHandler.gs` | CategoriesHandler.gs |
| `GalleryHandler.gs` | GalleryHandler.gs |
| `TestimonialsHandler.gs` | TestimonialsHandler.gs |
| `AboutHandler.gs` | AboutHandler.gs |

---

## 2. تغيير كلمة مرور الأدمن

في `Config.gs`، غيّر:

```javascript
DEFAULT_ADMIN_PASSWORD: 'Princesses@2008',
```

---

## 3. تشغيل الإعداد الأول

1. من محرر Apps Script، اختر الدالة **`setup`** من القائمة
2. اضغط **Run**
3. وافق على الأذونات (Drive + Sheets)
4. راجع **Execution log** — ستجد:
   - Spreadsheet ID
   - Drive folder ID

هذا ينشئ تلقائياً:
- Google Sheet باسم **Princesses DB** (6 أوراق)
- مجلد Drive باسم **Princesses** (dresses, gallery, testimonials)
- كلمة مرور الأدmin (مشفّرة)
- بيانات افتراضية للتصنيفات وصفحة About

---

## 4. اختبار API محلياً

1. اختر الدالة **`testApi`** → Run
2. تحقق من Execution log

---

## 5. نشر Web App

1. **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. **Deploy** → انسخ **Web App URL**

---

## 6. ربط Frontend

في `js/config.js`:

```javascript
api: {
  baseUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
},
```

---

## 7. Endpoints

### GET (Public)

| URL | الوصف |
|-----|-------|
| `?action=health` | فحص الاتصال |
| `?action=dresses` | كل الفساتين الظاهرة |
| `?action=dress&id=xxx` | فستان واحد |
| `?action=categories` | التصنيفات |
| `?action=gallery` | المعرض |
| `?action=testimonials` | آراء العملاء |
| `?action=about` | محتوى من نحن |

### GET (Admin — requires token)

| URL | الوصف |
|-----|-------|
| `?action=admin/dresses&token=xxx` | كل الفساتين (incl. hidden) |

### POST (JSON body)

| action | method | Auth | الوصف |
|--------|--------|------|-------|
| `login` | POST | No | `{ "password": "..." }` |
| `dress` | POST | Yes | إنشاء فستان |
| `dress&id=xxx` | PUT | Yes | `{ "_method":"PUT", "token":"...", ... }` |
| `dress&id=xxx` | DELETE | Yes | `{ "_method":"DELETE", "token":"..." }` |
| `category` | POST/PUT/DELETE | Yes | CRUD |
| `gallery` | POST/PUT/DELETE | Yes | CRUD |
| `testimonial` | POST/PUT/DELETE | Yes | CRUD |
| `about` | PUT | Yes | تحديث المحتوى |
| `upload` | POST | Yes | `{ "data":"base64...", "folder":"dresses/id" }` |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "optional",
  "error": null
}
```

---

## 8. Google Sheet Structure

### Dresses

`ID | Name | Category | Color | Price | Fabric Type | Estimated Fabric | Estimated Duration | Sizes | Notes | Images | Featured | Hidden | Created At | Updated At`

### Categories

`ID | Name | Slug | Icon | Description | Order | Hidden`

### Gallery

`ID | Title | Image URL | Order | Hidden | Created At`

### Testimonials

`ID | Name | Text | Rating | Avatar | Order | Hidden`

### About (Key-Value)

`Key | Value | Updated At`

### Settings

`Key | Value` — (password hash, salt, session secret)

---

## 9. Google Drive Structure

```
Princesses/
├── dresses/{dress-id}/
├── gallery/
└── testimonials/
```

---

## 10. الأمان

- غيّر كلمة المرور الافتراضية فوراً
- Token صالح لمدة **1 ساعة** (sessionStorage)
- Rate limiting على Login: **5 محاولات / 15 دقيقة**
- لا تضع secrets في GitHub — فقط `config.js` مع URL عام

---

## 11. إعادة النشر بعد التعديل

بعد أي تعديل على `.gs` files:

**Deploy** → **Manage deployments** → ✏️ → **New version** → **Deploy**

> ملاحظة: URL يبقى نفسه إذا عدّلت deployment موجود.
