# Vercel Deployment Configuration - Summary

## What's Been Configured

Your WealthWise project is now ready for deployment to Vercel. Here's what has been set up:

### Backend (Server)

1. **`server/vercel.json`** - Vercel configuration for serverless deployment
2. **`server/api/index.js`** - Serverless function entry point
3. **`server/.env.example`** - Updated with deployment notes
4. **`server/api/README.md`** - Documentation for the serverless setup

### Frontend (Client)

1. **`client/vercel.json`** - Vercel configuration for static hosting with SPA routing
2. **`client/.env.example`** - Environment variables template for frontend
3. **`client/package.json`** - Already configured with proper build scripts

### Documentation

1. **`VERCEL_DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide with troubleshooting
2. **`VERCEL_QUICK_SETUP.sh`** - Quick reference script with step-by-step commands

---

## Quick Start Deployment

### Prerequisites

1. Have both projects on GitHub
2. Vercel account (free tier available)
3. MongoDB Atlas account with active cluster

### Deployment Steps

#### Step 1: Deploy Backend First

```bash
cd server
vercel --prod
```

**During setup:**
- Project name: `wealthwise-backend` (or your choice)
- Framework Preset: `Other`
- Build Command: `npm install`
- Deploy directory: (default)

After deployment, note the backend URL (e.g., `https://wealthwise-backend.vercel.app`)

#### Step 2: Configure Backend Environment Variables

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```
NODE_ENV = production
MONGODB_URI = <your-mongodb-connection-string>
JWT_SECRET = <strong-random-secret-key>
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://wealthwise-frontend.vercel.app
```

#### Step 3: Deploy Frontend

```bash
cd client
vercel --prod
```

**During setup:**
- Project name: `wealthwise-frontend` (or your choice)
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

#### Step 4: Configure Frontend Environment Variables

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```
VITE_API_BASE_URL = https://wealthwise-backend.vercel.app/api
```

(Replace with your actual backend URL)

#### Step 5: Redeploy Both

For the changes to take effect:
```bash
# Backend
cd server && vercel --prod

# Frontend  
cd client && vercel --prod
```

#### Step 6: Test

1. Visit your frontend URL: `https://wealthwise-frontend.vercel.app`
2. Test the API: `https://wealthwise-backend.vercel.app/api/health`
3. Try logging in or using the app features

---

## Key Configuration Files Explained

### Backend: `server/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm install",
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

- Routes all `/api/*` requests to the serverless function
- Memory: 1024 MB (suitable for most apps)
- Max duration: 30 seconds per request

### Backend: `server/api/index.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();
import app from '../src/app.js';
export default app;
```

- Simple entry point that loads environment variables and exports the Express app
- Vercel automatically wraps this as a serverless function

### Frontend: `client/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

- Builds with Vite
- Routes all requests to `index.html` for SPA routing (React Router compatibility)

---

## Environment Variables Summary

### Backend Requirements

| Variable | Value | Example |
|----------|-------|---------|
| `NODE_ENV` | `production` | production |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Strong random secret | Generate one randomly |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CLIENT_URL` | Frontend Vercel domain | `https://wealthwise-frontend.vercel.app` |

### Frontend Requirements

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_BASE_URL` | Backend Vercel domain + `/api` | `https://wealthwise-backend.vercel.app/api` |

---

## Important Notes

1. **MongoDB IP Whitelist**: For Vercel, add `0.0.0.0/0` to your MongoDB Atlas IP whitelist or use VPC peering
2. **CORS**: Backend CORS is configured with `CLIENT_URL`. Both must match after deployment
3. **Redeploy After Environment Changes**: Environment variable changes require a redeploy to take effect
4. **Git Integration**: Best practice is to connect your GitHub repo to Vercel for automatic deployments
5. **Local Development**: Local `.env` files don't affect Vercel deployments

---

## Troubleshooting

### Build Fails on Vercel
- Check that `package.json` has all required dependencies
- Ensure Node.js version is compatible (use Vercel's Node.js version selector)
- Clear build cache: Dashboard → Settings → Git → Clear build cache

### Database Connection Errors
- Verify MongoDB URI is correct
- Check MongoDB cluster status and connection limits
- Add Vercel IPs to MongoDB IP whitelist

### CORS Errors
- Ensure `CLIENT_URL` in backend matches frontend domain
- Ensure `VITE_API_BASE_URL` in frontend matches backend domain
- Check browser console for exact error message

### Blank Page on Frontend
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly
- Test the health endpoint: `https://your-backend.vercel.app/api/health`

---

## Next Steps

1. Read `VERCEL_DEPLOYMENT_GUIDE.md` for detailed information
2. Run through the deployment steps above
3. Test all features after deployment
4. Monitor performance and errors in Vercel dashboard
5. Set up automatic deployments via GitHub integration

---

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Express on Vercel](https://vercel.com/solutions/nodejs)
