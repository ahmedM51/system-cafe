# 🚀 دليل النشر السريع - HUB CAFE System

## الخطوة 1: إعداد البيئة المحلية
```bash
# تثبيت الاعتماديات
npm install

# تشغيل للتأكد من عمل المشروع
npm run dev
```

## الخطوة 2: النشر على Vercel (الأسهل والأسرع)

### الطريقة الأولى: عبر واجهة الويب
1. اذهب إلى [vercel.com](https://vercel.com) وسجل الدخول بحساب GitHub
2. اضغط "Add New Project"
3. اربط حساب GitHub واختر مستودع `hub-cafe-system`
4. Vercel سيكتشف الإعدادات تلقائياً:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. اضغط "Deploy"
6. بعد دقيقة، سيكون موقعك متاح على رابط مثل: `https://hub-cafe-system.vercel.app`

### الطريقة الثانية: عبر CLI
```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel
```

## الخطوة 3: النشر على Netlify

1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل الدخول بحساب GitHub
3. اضغط "Add new site" > "Import an existing project"
4. اختر مستودع GitHub
5. الإعدادات:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. اضغط "Deploy site"

## الخطوة 4: النشر على GitHub Pages

1. في مستودع GitHub، اذهب إلى **Settings** > **Pages**
2. اختر **Source:** GitHub Actions
3. النظام سيقترح workflow تلقائياً أو استخدم الـ workflow الموجود في README

## الخطوة 5: ربط الدومين المخصص (اختياري)

### على Vercel:
1. في إعدادات المشروع، اذهب إلى **Domains**
2. أضف دومينك (مثلاً: `hubcafe.com`)
3. اتبع تعليمات تحديث DNS

### على Netlify:
1. في إعدادات الموقع، اذهب إلى **Domain management**
2. أضف دومينك واتبع تعليمات DNS

## الخطوة 6: إعداد البيئة (Environment Variables)

إذا كنت تستخدم Supabase أو خدمات خارجية:
1. في إعدادات النشر (Vercel/Netlify)
2. أضف المتغيرات البيئية من ملف `.env.example`
3. مثال المتغيرات:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📋 التحقق من النشر

بعد النشر، تأكد من:
- [ ] الموقع يعمل بشكل صحيح
- [ ] الروابط تعمل (SPA routing)
- [ ] الطباعة تعمل (A4 وطابعة فواتير)
- [ ] الإعدادات محفوظة بشكل صحيح
- [ ] النظام متجاوب على الموبايل

## 🔧 استكشاف الأخطاء

### مشكلة الروابط 404:
- تأكد من وجود ملف `vercel.json` أو `netlify.toml`
- تأكد من إعدادات rewrites/redirects

### مشكلة الصور:
- تأكد من استخدام روابط HTTPS للصور
- تحقق من حجم الصور (يفضل أن تكون أقل من 500KB)

### مشكلة الطباعة:
- تأكد من أن CSS للطباعة محمل بشكل صحيح
- جرب طباعة معاينة قبل النشر النهائي

## 🎯 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. راجع logs في منصة النشر
2. تأكد من أن جميع الاعتماديات مثبتة
3. جرب بناء المشروع محلياً أولاً: `npm run build`