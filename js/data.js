/**
 * Princesses — بيانات الموقع (ثابتة — بسيطة)
 * عدّلي الفساتين هنا مباشرة بدون Google Sheets
 */
window.PRINCESSES = {
  contact: {
    whatsapp: '966500000000',
    phone: '+966 50 000 0000',
    email: 'info@princesses.com',
    address: 'الرياض، المملكة العربية السعودية',
  },

  categories: ['الكل', 'سهرة', 'زفاف', 'خطوبة', 'كاجوال'],

  dresses: [
    {
      id: '1',
      name: 'فستان سهرة وردي',
      category: 'سهرة',
      color: 'وردي',
      price: 2800,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      ],
      featured: true,
      notes: 'تصميم أنيق بقصّة مميزة، مناسب للمناسبات الرسمية.',
    },
    {
      id: '2',
      name: 'فستان زفاف كلاسيكي',
      category: 'زفاف',
      color: 'أبيض',
      price: 5500,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
      ],
      featured: true,
      notes: 'فستان زفاف فاخر بتطريز يدوي وتفاصيل دقيقة.',
    },
    {
      id: '3',
      name: 'فستان خطوبة',
      category: 'خطوبة',
      color: 'شampagne',
      price: 3200,
      images: [
        'https://images.unsplash.com/photo-1594938291220-94f3137250e6?w=800&q=80',
      ],
      featured: true,
    },
    {
      id: '4',
      name: 'فستان سهرة أحمر',
      category: 'سهرة',
      color: 'أحمر',
      price: 2600,
      images: [
        'https://images.unsplash.com/photo-1539008835657-9e0419952334?w=800&q=80',
      ],
      featured: false,
    },
    {
      id: '5',
      name: 'فستان كاجوال فاخر',
      category: 'كاجوال',
      color: 'بيج',
      price: 1800,
      images: [
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
      ],
      featured: false,
    },
    {
      id: '6',
      name: 'فستان سهرة أسود',
      category: 'سهرة',
      color: 'أسود',
      price: 2400,
      images: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      ],
      featured: true,
    },
  ],
};
