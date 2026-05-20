# API Configuration Fix - MovieMatch Frontend

## ✅ สรุปการแก้ไข

### ไฟล์ที่ถูกอัปเดต (6 ไฟล์):

1. **src/pages/Index.tsx**
   - แก้ 2 fetch calls สำหรับ top rated และ recommended movies

2. **src/pages/MoviesPage.tsx** 
   - แก้ 2 fetch calls สำหรับ conditional recommended/top movies

3. **src/pages/MovieDetail.tsx**
   - แก้ 2 fetch calls สำหรับ movie details และ recommendations

4. **src/pages/RecommendedPage.tsx**
   - แก้ 1 fetch call สำหรับ recommended movies by ID

5. **src/pages/SearchPage.tsx**
   - แก้ 1 fetch call สำหรับ search functionality

6. **src/components/HeroSection.tsx**
   - แก้ 1 fetch call สำหรับ featured movie

**Total: 9 API calls ที่ถูกแปลงจาก hardcoded URLs**

---

## 🔄 การเปลี่ยนแปลง Pattern

### Before (Hardcoded):
```javascript
fetch(`https://moviemach-4.onrender.com/search?q=${encodeURIComponent(query)}`)
  .then(res => res.json())
  ...
```

### After (Using Environment Variable):
```javascript
fetch(`${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`)
  .then(res => res.json())
  ...
```

---

## 📋 Environment Files สร้างใหม่/อัปเดต

### 1. `.env` (Build/Production)
```env
# Railway Backend API URL
# This will be set by Railway when you deploy
# Format: https://your-backend-name.up.railway.app
VITE_API_URL=https://your-backend-url.up.railway.app
```

### 2. `.env.local` (Local Development - Git Ignored)
```env
# Local Development Environment Variables
# This file is ignored by git (see .gitignore)

# Local backend URL for development
VITE_API_URL=http://localhost:8000
```

### 3. `.env.example` (Template)
```env
# Environment Variables for MovieMatch Frontend

# Railway Backend API URL
# Replace with your actual Railway backend URL
VITE_API_URL=https://your-backend-name.up.railway.app

# Example for local development:
# VITE_API_URL=http://localhost:8000
```

---

## 🚀 Railway Deployment Setup

### Step 1: ตั้ง Environment Variable บน Railway
1. ไปที่ Railway Dashboard → Project → your-frontend
2. ไปที่ **Variables** tab
3. เพิ่ม environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.up.railway.app`

### Step 2: ตรวจสอบ Vite Config
```typescript
// vite.config.ts - ปัจจุบันปลอดภัย ไม่มี proxy
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```
✅ ไม่มี proxy สำหรับ production ใช้ได้ดี

---

## 🔍 Checklist - Railway Deployment

- ✅ **No hardcoded URLs**: ลบ localhost, 127.0.0.1, hardcoded domains แล้ว
- ✅ **Environment Variables**: ใช้ `import.meta.env.VITE_API_URL` ทั้งหมด
- ✅ **No vite proxy**: ไม่มี proxy configuration
- ✅ **Build config**: `vite build` สร้าง static files ได้
- ✅ **.env files**: สร้างให้ถูกต้อง

---

## 📝 Verification Commands

### Local Development
```bash
# 1. ตั้ง API_URL เป็น localhost
# ✅ อัปเดต .env.local ให้ใช้ http://localhost:8000

# 2. Start dev server
npm run dev

# 3. ตรวจสอบ network tab - API calls ไป localhost:8000
```

### Production Build
```bash
# 1. Build
npm run build

# 2. ตรวจสอบ dist/index.html ไม่มี hardcoded URLs
# 3. Railway จะใช้ env variables ตอน runtime
```

---

## ⚠️ Possible Issues & Solutions

### Issue 1: API Calls ไปไหนก่อนแก้ .env
**Problem**: Production build ยังใช้ environment variable เก่า
**Solution**: 
- อัปเดต `.env` file
- ตั้ง Railway variables ให้ถูก
- Redeploy frontend

### Issue 2: CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS`
**Solution**:
```javascript
// ตรวจสอบ backend CORS headers
// Backend ต้อง allow origin ของ frontend
// Example backend (Flask):
cors = CORS(app, resources={
    r"/*": {"origins": ["https://your-frontend.railway.app"]}
})
```

### Issue 3: .env ไม่ Load เมื่อ Deploy
**Problem**: Environment variables ไม่โหลด
**Solution**:
```bash
# Railway ต้องเห็น .env file ในไป git
# ตรวจสอบ .gitignore ไม่ block .env.example
cat .gitignore | grep "\.env"
# ✅ ต้องมี: *.local (ไม่ .env)
```

### Issue 4: Build Failed - Variables Undefined
**Problem**: `import.meta.env.VITE_API_URL is undefined`
**Solution**:
```javascript
// ใช้ default value เผื่อว่า:
const API_URL = import.meta.env.VITE_API_URL || 'https://default-backend.railway.app';
```

---

## 📦 .gitignore ตรวจสอบ

ตรวจสอบ .gitignore (ปัจจุบันชื่อ gitignore.txt):
```
node_modules
dist
dist-ssr
*.local          ✅ .env.local จะ ignore
```

**Recommendation**: เปลี่ยนชื่อเป็น `.gitignore` (ไม่ .txt)
```bash
mv gitignore.txt .gitignore
```

---

## 🎯 Next Steps

1. **Local Testing**:
   ```bash
   npm run dev
   # ต้องเห็น API calls ไปที่ localhost:8000
   ```

2. **Railway Deployment**:
   ```bash
   # Push code
   git add .
   git commit -m "fix: use environment variable for API URL"
   git push
   
   # Railway จะ auto-deploy
   # ตรวจสอบ Logs ว่า VITE_API_URL set ถูก
   ```

3. **Verify Production**:
   ```bash
   # Check Network tab ใน DevTools
   # API calls ต้องไป Railway backend URL
   ```

---

## 📚 Reference

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway - Environment Variables](https://docs.railway.app/reference/project-structure)
- [React Fetch Best Practices](https://react.dev/reference/react/useEffect)

---

**Generated**: 2026-05-20
**Status**: ✅ All API URLs migrated to environment variables
