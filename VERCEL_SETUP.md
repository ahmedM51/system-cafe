# 🔧 إعداد Vercel و Node.js - HUB CAFE System (MongoDB Atlas)

## ✅ البنية المعمارية:
يعتمد النظام كلياً وبشكل حصري على **MongoDB Atlas** السحابية لقاعدة البيانات وحفظ الطلبات والمستخدمين والمنتجات.

- **قاعدة البيانات:** MongoDB Atlas (`cluster0.w7l7m9v.mongodb.net`)
- **اسم قاعدة البيانات:** `hub_cafe_db`

## 🚀 متغيرات البيئة (Environment Variables):

```
MONGODB_URI=mongodb+srv://ahmedmohamedm4336_db_user:QRJyIXO7ZZNlY5rI@cluster0.w7l7m9v.mongodb.net/hub_cafe_db
PORT=3000
```

## 📋 تشغيل وبناء المشروع:

```bash
npm install
npm run build
npm start
```