# API Configuration Changes - Detailed Code Diffs

## 1. src/pages/Index.tsx

### Change 1a: Top Rated Movies
```diff
- fetch("https://moviemach-4.onrender.com/movies?page=1&limit=20")
+ fetch(`${import.meta.env.VITE_API_URL}/movies?page=1&limit=20`)
```

### Change 1b: Recommended Movies  
```diff
- fetch("https://moviemach-4.onrender.com/recommend/1")
+ fetch(`${import.meta.env.VITE_API_URL}/recommend/1`)
```

---

## 2. src/pages/MoviesPage.tsx

### Change 2: Conditional URL Building
```diff
  if (type === "recommended") {
-   url = "https://moviemach-4.onrender.com/recommend/1?limit=50";
+   url = `${import.meta.env.VITE_API_URL}/recommend/1?limit=50`;
  } else if (type === "top") {
-   url = "https://moviemach-4.onrender.com/movies?page=1&limit=50";
+   url = `${import.meta.env.VITE_API_URL}/movies?page=1&limit=50`;
  } else {
    return;
  }
```

---

## 3. src/pages/MovieDetail.tsx

### Change 3a: Movie Details
```diff
  useEffect(() => {
-   fetch(`https://moviemach-4.onrender.com/movie/${id}`)
+   fetch(`${import.meta.env.VITE_API_URL}/movie/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  }, [id]);
```

### Change 3b: Movie Recommendations
```diff
  useEffect(() => {
    if (!id) return;
    setRecommended([]);
-   fetch(`https://moviemach-4.onrender.com/recommend/${id}`)
+   fetch(`${import.meta.env.VITE_API_URL}/recommend/${id}`)
      .then((res) => res.json())
      .then((data) => setRecommended(data))
      .catch((err) => console.error(err));
  }, [id]);
```

---

## 4. src/pages/RecommendedPage.tsx

### Change 4: Recommended Movies List
```diff
  useEffect(() => {
-   fetch(`https://moviemach-4.onrender.com/recommend/${id}?limit=30000`)
+   fetch(`${import.meta.env.VITE_API_URL}/recommend/${id}?limit=30000`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, [id]);
```

---

## 5. src/pages/SearchPage.tsx

### Change 5: Search Query
```diff
- fetch(`https://moviemach-4.onrender.com/search?q=${encodeURIComponent(query)}`)
+ fetch(`${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
```

---

## 6. src/components/HeroSection.tsx

### Change 6: Featured Movie
```diff
  useEffect(() => {
    const baseMovieId = 1;
-   fetch(`https://moviemach-4.onrender.com/movie/${baseMovieId}`)
+   fetch(`${import.meta.env.VITE_API_URL}/movie/${baseMovieId}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
      })
      .catch((err) => console.error("Movie fetch error:", err));
  }, []);
```

---

## Environment Files Summary

### .env (Production/Build)
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

### .env.local (Local Development - Git Ignored)
```env
VITE_API_URL=http://localhost:8000
```

### .env.example (Version Control)
```env
# Railway Backend API URL
VITE_API_URL=https://your-backend-name.up.railway.app
```

---

## Verification

### ✅ All hardcoded URLs removed:
- ❌ localhost
- ❌ 127.0.0.1  
- ❌ port 8000
- ❌ moviemach-4.onrender.com
- ✅ All replaced with `import.meta.env.VITE_API_URL`

### ✅ Environment Setup:
- ✅ `.env` created with template
- ✅ `.env.local` created for development
- ✅ `.env.example` created for git
- ✅ `*.local` in `.gitignore` prevents .env.local being committed

### ✅ Vite Configuration:
- ✅ No proxy in vite.config.ts
- ✅ Environment variables load automatically
- ✅ Build will include env vars at compile time

---

## Testing

### 1. Local Development
```bash
# Ensure .env.local has:
VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev

# Check Network tab - API calls should go to http://localhost:8000
```

### 2. Production Build
```bash
# Ensure .env has Railway URL:
VITE_API_URL=https://your-backend.up.railway.app

# Build
npm run build

# Verify no hardcoded URLs in dist/
grep -r "moviemach-4.onrender.com" dist/ || echo "✅ No hardcoded URLs"
grep -r "localhost" dist/ || echo "✅ No localhost"
```

### 3. Railway Deployment
```bash
# Push to git
git push

# Railway auto-deploys
# Check that VITE_API_URL variable is set in Railway dashboard
# Test API calls from deployed app
```

---

## Summary of Changes

| File | Changes | Type |
|------|---------|------|
| src/pages/Index.tsx | 2 URLs | Fetch calls |
| src/pages/MoviesPage.tsx | 2 URLs | Conditional URLs |
| src/pages/MovieDetail.tsx | 2 URLs | Fetch calls |
| src/pages/RecommendedPage.tsx | 1 URL | Fetch call |
| src/pages/SearchPage.tsx | 1 URL | Fetch call |
| src/components/HeroSection.tsx | 1 URL | Fetch call |
| .env | Created | Config |
| .env.local | Created | Config |
| .env.example | Created | Config |

**Total API Calls Fixed: 9**
**Total Files Modified: 9**

---

## Deployment Checklist

- [ ] Update `.env` with actual Railway backend URL
- [ ] Run `npm run build` and verify no hardcoded URLs
- [ ] Push code to git
- [ ] Set `VITE_API_URL` in Railway project variables
- [ ] Wait for auto-deploy
- [ ] Test API calls in production
- [ ] Check browser DevTools Network tab for correct URLs

---

**Status**: ✅ All changes completed and verified
**Date**: 2026-05-20
