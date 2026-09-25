# 🚀 دليل الرفع على GitHub - HUB CAFE System

## الطريقة الأولى: استخدام الملف الدفعي (الأسرع)

1. **انقر مرتين على ملف `push_to_github.bat`**
2. سيقوم الملف تلقائياً بتنفيذ جميع خطوات الرفع
3. أدخل بيانات الدخول لـ GitHub إذا طُلب منك

## الطريقة الثانية: التنفيذ اليدوي

افتح Terminal أو Command Prompt في مجلد المشروع ونفذ الأوامر التالية:

```bash
# 1. تهيئة Git
git init

# 2. إضافة جميع الملفات
git add .

# 3. حفظ التغييرات
git commit -m "feat: HUB CAFE management system - POS, inventory, playstation, tables, shifts, reports and QA tests with unified branding system"

# 4. تعيين الفرع الرئيسي
git branch -M main

# 5. إضافة رابط GitHub
git remote add origin https://github.com/ahmedM51/system-cafe.git

# 6. الرفع على GitHub
git push -u origin main
```

## ⚠️ إذا واجهت مشاكل في المصادقة

### حل مشكلة GitHub Authentication:

#### الطريقة 1: استخدام Personal Access Token
1. اذهب إلى GitHub Settings > Developer settings > Personal access tokens
2. أنشئ token جديد بصلاحيات `repo`
3. عند طلب كلمة المرور، استخدم الـ token بدلاً من كلمة المرور

#### الطريقة 2: استخدام SSH
```bash
# إنشاء SSH key (إذا لم يكن موجوداً)
ssh-keygen -t ed25519 -C "your_email@example.com"

# إضافة الـ key إلى GitHub
# انسخ محتوى ~/.ssh/id_ed25519.pub وأضفه في GitHub Settings > SSH keys

# تغيير رابط remote إلى SSH
git remote set-url origin git@github.com:ahmedM51/system-cafe.git

# المحاولة مرة أخرى
git push -u origin main
```

## 📋 بعد الرفع بنجاح

1. **تحقق من المستودع:**
   - اذهب إلى: https://github.com/ahmedM51/system-cafe
   - تأكد من ظهور جميع الملفات

2. **النشر على Vercel:**
   - اذهب إلى vercel.com
   - اضغط "Add New Project"
   - اختر مستودع `system-cafe`
   - اضغط "Deploy"

3. **النشر على Netlify:**
   - اذهب إلى netlify.com
   - اضغط "Add new site" > "Import an existing project"
   - اختر مستودع `system-cafe`
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🔧 استكشاف الأخطاء

### خطأ: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/ahmedM51/system-cafe.git
```

### خطأ: "nothing to commit"
```bash
# تحقق من حالة الملفات
git status
# إذا كان هناك ملفات غير مضافة، أضفها
git add .
git commit -m "your message"
```

### خطأ: "failed to push"
```bash
# جلب التغييرات أولاً
git pull origin main --allow-unrelated-histories
# ثم المحاولة مرة أخرى
git push -u origin main
```

## 🎯 التحقق من النجاح

بعد الرفع بنجاح، يمكنك:
- ✅ رؤية جميع الملفات على GitHub
- ✅ رؤية تاريخ الـ commits
- ✅ استخدام المستودع للنشر على Vercel/Netlify
- ✅ التعاون مع فريقك على المشروع