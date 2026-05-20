# Railway Deployment Guide - MovieMatch Frontend

## 🚀 Quick Start

### Prerequisites
- Railway account with backend already deployed
- Backend URL: `https://your-backend-name.up.railway.app`
- Frontend code with API URL fixes applied ✅

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare for Deployment

#### 1.1 Update Backend URL
```bash
# Edit .env file
# Replace placeholder with actual Railway backend URL
VITE_API_URL=https://YOUR-ACTUAL-BACKEND.up.railway.app
```

#### 1.2 Verify Changes
```bash
# Make sure no hardcoded URLs remain
grep -r "localhost\|127.0.0.1\|:8000\|onrender" src/

# Should return nothing (no matches)
```

#### 1.3 Test Locally First
```bash
# Create .env.local with backend URL
echo "VITE_API_URL=https://your-backend.up.railway.app" > .env.local

# Build and preview
npm run build
npm run preview

# Or test with local backend
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

---

### Step 2: Deploy to Railway

#### 2.1 Connect Repository
```bash
# If not already connected
# Option A: GitHub integration
# 1. Go to Railway Dashboard
# 2. New Project → GitHub Repo

# Option B: CLI deployment
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link
```

#### 2.2 Set Environment Variables

**In Railway Dashboard:**

1. Go to **Projects** → Select your frontend project
2. Click on **Variables** tab
3. Click **Add Variable**
4. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.up.railway.app`
5. Click **Add**

**Or via Railway CLI:**
```bash
railway variable add VITE_API_URL https://your-backend-name.up.railway.app
```

---

### Step 3: Build & Deploy

#### 3.1 Update Dockerfile (if needed)
Railway typically auto-detects Node.js apps. If you need custom build:

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_API_URL=https://your-backend.up.railway.app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

#### 3.2 Deploy
```bash
# Push to GitHub (auto-deploys via Railway)
git add .
git commit -m "fix: configure API URL for Railway deployment"
git push

# Or manually trigger
railway deploy

# Watch deployment
railway logs --follow
```

---

### Step 4: Verify Deployment

#### 4.1 Check Railway Logs
```bash
# Monitor deployment
railway logs --follow

# Should see:
# ✅ npm install
# ✅ npm run build
# ✅ Server started
```

#### 4.2 Test the Deployed App
1. Get your Railway URL:
   - Railway Dashboard → Frontend Project → Deployments → URL
2. Open in browser
3. Open DevTools → Network tab
4. Navigate to trigger API calls
5. Verify API calls go to: `https://your-backend.up.railway.app/...`

#### 4.3 Check for Errors
```bash
# View production logs
railway logs

# Look for:
❌ 404 errors = Wrong API URL
❌ CORS errors = Backend not allowing frontend origin
❌ undefined = VITE_API_URL not set
```

---

## 🔧 Troubleshooting

### Issue 1: "Cannot GET /"
**Symptom**: App returns 404 error

**Solution**:
```bash
# Ensure build process runs correctly
# In Railway, check Build Command:
npm run build

# And Start Command:
npm run preview
# or
npm install -g serve && serve -s dist
```

---

### Issue 2: API Calls Return 404
**Symptom**: Network shows 404 on API calls

**Checks**:
```bash
# 1. Verify backend is running
curl https://your-backend.up.railway.app/movies

# 2. Check frontend is calling correct URL
# Open DevTools Console:
console.log(import.meta.env.VITE_API_URL)
# Should show: https://your-backend.up.railway.app

# 3. Check Railway variables
railway variable list
# Should show VITE_API_URL with correct value
```

---

### Issue 3: CORS Errors
**Symptom**: 
```
Access to XMLHttpRequest at 'https://...' from origin 'https://frontend.railway.app' 
has been blocked by CORS policy
```

**Solution** (Backend - Flask/FastAPI):
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://your-frontend.up.railway.app",
            "http://localhost:3000",  # for local dev
            "http://localhost:5173"   # for Vite dev
        ]
    }
})
```

---

### Issue 4: Environment Variable Not Loaded
**Symptom**: `import.meta.env.VITE_API_URL` is undefined

**Checks**:
```bash
# 1. Make sure .env is tracked in git
git ls-files | grep .env

# 2. Verify variable in Railway Dashboard
railway variable list

# 3. Check build log
railway logs | grep VITE_API_URL

# 4. Redeploy
railway deploy
```

---

### Issue 5: "Not Found" on Page Refresh
**Symptom**: Refreshing page returns 404

**Solution**: 
Configure catch-all routes in Railway. Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Or use Nginx in Dockerfile:
```dockerfile
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📊 Verification Commands

```bash
# 1. Check deployed app
curl https://your-frontend.up.railway.app

# 2. Verify API URL is set
railway variable list | grep VITE_API_URL

# 3. View recent logs
railway logs --limit 50

# 4. Check environment during build
railway logs | grep -A 5 "Building"

# 5. Test API connectivity
# From browser console on deployed app:
fetch(`${import.meta.env.VITE_API_URL}/movies?page=1&limit=5`)
  .then(r => r.json())
  .then(console.log)
```

---

## 🚨 Pre-Deployment Checklist

- [ ] `.env` file has correct Railway backend URL
- [ ] `.env.local` in `.gitignore` (for local dev only)
- [ ] No hardcoded URLs in code: `grep -r "localhost\|127.0.0.1\|:8000\|onrender" src/`
- [ ] All API calls use `import.meta.env.VITE_API_URL`
- [ ] `npm run build` succeeds locally
- [ ] `npm run preview` works with Railway backend URL
- [ ] `VITE_API_URL` set in Railway Variables
- [ ] Backend CORS allows frontend origin
- [ ] Git repository is clean and up to date

---

## 📝 Environment Summary

### Development
```env
# .env.local (not committed)
VITE_API_URL=http://localhost:8000
```

### Staging/Production  
```env
# .env (in git, used as base)
VITE_API_URL=https://placeholder-backend.up.railway.app

# Railway Variables (overrides .env)
VITE_API_URL=https://actual-backend.up.railway.app
```

---

## 🔗 Useful Links

- [Railway Docs - Variables](https://docs.railway.app/reference/project-structure#environment-variables)
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway - Node.js Deployment](https://docs.railway.app/guides/nodejs)
- [CORS Troubleshooting](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 💡 Next Steps

1. **Update .env** with your actual backend URL
2. **Test locally**: `npm run dev` with `.env.local`
3. **Build test**: `npm run build && npm run preview`
4. **Push to git**: `git push`
5. **Set Railway variables** with backend URL
6. **Monitor logs**: `railway logs --follow`
7. **Verify deployment** works from browser

---

**Last Updated**: 2026-05-20
**Status**: ✅ Ready for Railway Deployment
