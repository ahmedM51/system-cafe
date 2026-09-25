# HUB CAFE System - نظام إدارة الكافيهات المتكامل

نظام تشغيل وإدارة محاسبية شامل ومخصص للكافيهات (POS، ترابيزات، بلايستيشن، مخزون، ورديات وتقارير مالية).

---

## 🚀 دليل التشغيل المحلي (Local Development)

### 1. تثبيت الاعتماديات:
```bash
npm install
```

### 2. تشغيل السيرفر في وضع التطوير (Dev Server):
```bash
npm run dev
```
سيفتح التطبيق على: `http://localhost:3000`

### 3. بناء المشروع للإنتاج (Production Build):
```bash
npm run build
```
سيتم إنشاء مجلد `dist/` يحتوي على كامل ملفات الموقع المحسنة والمضغوطة.

---

## 🌐 دليل النشر على منصات مختلفة

### 🟢 Vercel Deployment (موصى به)
1. **النشر عبر لوحة تحكم Vercel:**
   - ادخل إلى [vercel.com](https://vercel.com) وسجل الدخول
   - اضغط "Add New Project"
   - اربط حساب GitHub الخاص بك
   - اختر مستودع `hub-cafe-system`
   - Vercel سيكتشف الإعدادات تلقائياً من ملف `vercel.json`
   - اضغط "Deploy"

2. **النشر عبر CLI:**
   ```bash
   npm install -g vercel
   vercel
   ```

### 🔵 Netlify Deployment
1. ادخل إلى [netlify.com](https://netlify.com) وسجل الدخول
2. اضغط "Add new site" > "Import an existing project"
3. اربط حساب GitHub واختر المستودع
4. إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. اضغط "Deploy site"

### 🟡 GitHub Pages Deployment
1. في مستودع GitHub، اذهب إلى Settings > Pages
2. اختر Source: GitHub Actions
3. أنشئ ملف `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### 🟠 Hostinger Deployment
#### الطريقة الأولى: استضافة الويب العادية (Shared / Cloud Web Hosting - مجلد `public_html`)
1. نفذ أمر البناء:
   ```bash
   npm run build
   ```
2. افتح لوحة تحكم هوستنجر (**hPanel**) واذهب إلى **File Manager** (مدير الملفات).
3. ادخل إلى مجلد:
   ```text
   public_html/
   ```
4. ارفع **جميع محتويات مجلد `dist/`** (وليس مجلد dist نفسه)، والتي تشمل:
   - `index.html`
   - مجلد `assets/`
5. الموقع سيعمل مباشرة بنسبة 100% على نطاقك (Domain).

#### الطريقة الثانية: عبر Git Deployment على Hostinger
1. في لوحة تحكم هوستنجر، اختر قسم **Git**.
2. اربط مستودع GitHub الخاص بك واختر الفرع `main`.
3. اضبط أمر النشر التلقائي (Build Command):
   ```bash
   npm install && npm run build
   ```
4. حدد مسار المجلد المنشور ليصبح `dist`.

---

## 🐙 دليل الرفع على GitHub (GitHub Repository Setup)

1. **تهيئة Git في المشروع:**
   ```bash
   git init
   ```

2. **إضافة الملفات وحفظ أول Commit:**
   ```bash
   git add .
   git commit -m "feat: complete HUB CAFE management system with POS, inventory, playstation, and QA tests"
   ```

3. **ربط المستودع بالفرع الرئيسي:**
   ```bash
   git branch -M main
   ```

4. **إضافة رابط الـ Remote الخاص بحسابك على GitHub:**
   ```bash
   git remote add origin https://github.com/USERNAME/hub-cafe-system.git
   ```
   *(استبدل `USERNAME` باسم حسابك و `hub-cafe-system` باسم المستودع الذي أنشأته على GitHub)*

5. **رفع الكود:**
   ```bash
   git push -u origin main
   ```

---

## ✨ المميزات المضمنة في النظام
- **نقطة البيع (POS):** دعم أصناف، إضافات، مقاسات، بحث فوري، وطباعة إيصال حراري (80mm).
- **إدارة الترابيزات:** 12 ترابيزة موزعة على قاعتين مع فواتير منفصلة.
- **قسم البلايستيشن:** 8 أجهزة مع تايمر مباشر وحساب فردي/زوجي وفواتير موحدة للمشروبات ووقت اللعب.
- **إدارة المخزون:** خصم تلقائي للخامات وتنبيهات النواقص.
- **الورديات ومطابقة الدرج:** تقفيل الوردية واكتشاف أي عجز أو زيادة فوراً.
- **التقارير اليومية:** مبيعات، كاش، فيزا، مصروفات، وربح تقديري جاهز للطباعة.
- **سكربت فحص الجودة (QA):** اختبارات آلية تغطي جميع سيناريوهات التشغيل.
- **نظام إعدادات موحد:** تحديث الاسم والشعار والهوية من مكان واحد وتطبيقها على جميع الأجزاء.

---

## 🔧 الملفات المضمنة للنشر
- `vercel.json` - إعدادات النشر على Vercel
- `netlify.toml` - إعدادات النشر على Netlify
- `public/_redirects` - إعادة توجيه الروابط للعميل (SPA)
- `.gitignore` - استبعاد الملفات غير الضرورية من Git
