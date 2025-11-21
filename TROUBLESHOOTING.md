# Troubleshooting: MongoDB Timeout & CSS Issues

## MongoDB Connection Timeout Error

### Error:
```
{"message":"Operation `users.findOne()` buffering timed out after 10000ms"}
```

### Causes & Solutions:

#### 1. **Verify MongoDB Connection String in Vercel**
- Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
- Check that `MONGODB_URI` is set correctly
- Ensure the MongoDB cluster is active in MongoDB Atlas

#### 2. **IP Whitelist Issue** ⚠️ **MOST COMMON**
MongoDB Atlas needs to allow Vercel's IPs:

1. Go to MongoDB Atlas → Network Access → IP Whitelist
2. Add `0.0.0.0/0` to allow all IPs (for testing) OR
3. Add specific Vercel IP ranges:
   - `104.199.0.0/16`
   - `137.184.0.0/16`
   - Or check Vercel's IP ranges at: https://vercel.com/docs/edge-network/regions-and-providers

#### 3. **Verify Environment Variables Are Set**
Backend needs these variables in Vercel:
```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=wealthwise
JWT_SECRET = your-secret-key
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend-url.vercel.app
```

#### 4. **Test the Connection**
Visit your backend health endpoint:
```
https://your-backend-url.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "WealthWise API is running",
  "database": "connected",
  "timestamp": "2025-11-21T20:30:00.000Z"
}
```

If `database` is `disconnected`, the MongoDB connection failed.

---

## CSS Not Rendering

### Symptoms:
- Page loads but styling looks broken
- Dark theme not applied
- Colors and fonts are incorrect

### Solutions:

#### 1. **Clear Browser Cache**
- Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
- Clear cached images and files
- Refresh the page (Ctrl+R or Cmd+R)

#### 2. **Verify Tailwind CSS Build**
- Check that `src/styles/index.css` is being imported in `main.jsx`
- Ensure `vite.config.mjs` has PostCSS configuration
- Check that `.vercelignore` doesn't exclude `src/` folder

#### 3. **Check Network Tab**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for any failed CSS/JS file requests
5. Check file sizes - CSS should be several KB (not 0 bytes)

#### 4. **Verify MUI Theme**
- MUI styles should be applied by `<ThemeProvider>` in `main.jsx`
- If MUI styles missing: check that `theme/muiTheme.js` is correct
- Ensure `CssBaseline` component is present

---

## Complete Troubleshooting Checklist

### Backend Issues:
- [ ] MONGODB_URI environment variable set in Vercel
- [ ] MongoDB cluster is running and active
- [ ] IP whitelist includes Vercel IPs (0.0.0.0/0 or specific ranges)
- [ ] Health endpoint returns `"database": "connected"`
- [ ] JWT_SECRET is set
- [ ] CLIENT_URL matches frontend domain

### Frontend Issues:
- [ ] VITE_API_BASE_URL environment variable set in Vercel
- [ ] Browser cache cleared
- [ ] .vercelignore doesn't exclude src/
- [ ] CSS files load in Network tab (check file size > 0)
- [ ] Dark mode class visible in HTML element
- [ ] No CORS errors in browser console

### API Connection Issues:
- [ ] Frontend VITE_API_BASE_URL points to correct backend URL
- [ ] Backend CLIENT_URL matches frontend domain
- [ ] CORS headers are correct (check Response headers in Network tab)
- [ ] Authentication token is being sent in API requests

---

## Quick Fix Steps

### If MongoDB is timing out:
1. Go to MongoDB Atlas
2. Network Access → IP Whitelist
3. Add `0.0.0.0/0` (temporary for testing)
4. Redeploy backend on Vercel

### If CSS is not rendering:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open DevTools → Network tab
3. Refresh page
4. Check CSS file is loaded (size > 0)
5. If missing, redeploy frontend on Vercel

### If API calls are failing:
1. Test health endpoint: `https://your-backend.vercel.app/api/health`
2. Check browser console for CORS errors
3. Verify VITE_API_BASE_URL is correct
4. Check Authorization header in Network tab

---

## Redeploy After Fixes

After making changes or fixing environment variables:

**Backend:**
```bash
vercel --prod
# OR go to Vercel Dashboard → Backend Project → Redeploy
```

**Frontend:**
```bash
vercel --prod
# OR go to Vercel Dashboard → Frontend Project → Redeploy
```

**IMPORTANT**: Environment variable changes require a redeploy to take effect.

---

## Support Resources

- MongoDB Atlas Help: https://docs.mongodb.com/manual/
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
