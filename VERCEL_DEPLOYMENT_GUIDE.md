# WealthWise Vercel Deployment Guide

## Overview
This guide covers deploying the WealthWise application (frontend and backend) to Vercel.

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- MongoDB Atlas account (or similar)

---

## Backend Deployment (Node.js API)

### Step 1: Prepare Backend for Vercel

The backend is configured to run as serverless functions on Vercel. Key files:
- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless function entry point
- `server.js` - Local development entry point

### Step 2: Set Environment Variables on Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add the following variables:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://your_user:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority&appName=wealthwise
JWT_SECRET = your_super_secret_jwt_key (use a strong random key)
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend-vercel-domain.vercel.app
```

**Important**: 
- Replace `CLIENT_URL` with your actual Vercel frontend domain
- Keep `JWT_SECRET` secure and generate a strong random value
- Ensure MongoDB connection string is valid for production

### Step 3: Connect Backend Repository

1. Push your code to GitHub
2. In Vercel Dashboard, click "Add New..." → "Project"
3. Import the repository
4. Configure:
   - Root Directory: `server`
   - Framework Preset: `Other`
   - Build Command: `npm install`
   - Output Directory: (leave empty, Vercel handles it)

5. Add environment variables (from Step 2)
6. Deploy

Your backend will be available at: `https://your-backend-project.vercel.app`

---

## Frontend Deployment (React + Vite)

### Step 1: Update Client Environment Variables

For Vercel deployment, update your client `.env.production` file:

```
VITE_API_BASE_URL = https://your-backend-project.vercel.app/api
```

Or set this as an environment variable in Vercel:
- Go to Settings → Environment Variables
- Add: `VITE_API_BASE_URL = https://your-backend-project.vercel.app/api`

### Step 2: Connect Frontend Repository

1. In Vercel Dashboard, click "Add New..." → "Project"
2. Import your repository (or same repo with frontend in root/subdirectory)
3. Configure:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Add environment variables:
   - `VITE_API_BASE_URL = https://your-backend-project.vercel.app/api`

5. Deploy

Your frontend will be available at: `https://your-frontend-project.vercel.app`

---

## CORS Configuration

The backend is configured with CORS to accept requests from:
- Local: `http://localhost:5173`
- Production: The `CLIENT_URL` environment variable

**Make sure to update `CLIENT_URL` in backend environment variables to match your frontend Vercel domain.**

---

## Complete Environment Variables Summary

### Backend (Server)
```
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-vercel-domain.vercel.app
PORT=3000 (optional, Vercel may override)
```

### Frontend (Client)
```
VITE_API_BASE_URL=https://your-backend-vercel-domain.vercel.app/api
```

---

## Deployment Checklist

- [ ] Backend MongoDB URI is correct and active
- [ ] JWT_SECRET is a strong random value
- [ ] CLIENT_URL in backend matches frontend Vercel domain
- [ ] VITE_API_BASE_URL in frontend matches backend Vercel domain
- [ ] All environment variables are set in Vercel dashboard
- [ ] Both projects have correct root directories configured
- [ ] Backend deployed first, then frontend
- [ ] Test API health check: `https://your-backend.vercel.app/api/health`
- [ ] Test frontend loads and can communicate with backend

---

## Troubleshooting

### Backend not connecting to MongoDB
- Verify MongoDB URI in environment variables
- Check if your MongoDB cluster has IP whitelist enabled
- For Vercel: Add `0.0.0.0/0` to IP whitelist (or specific Vercel IPs)

### CORS errors
- Ensure `CLIENT_URL` in backend matches your frontend domain
- Check that frontend API URL (`VITE_API_BASE_URL`) is correct

### Environment variables not working
- In Vercel, environment variables take effect on next deployment
- Redeploy after updating variables
- Use Vercel CLI to verify: `vercel env pull .env.production.local`

### Build fails
- Clear build cache in Vercel Dashboard → Settings → Git
- Ensure all dependencies are in `package.json`
- Check for Node.js version compatibility

---

## Local Development

To test locally before deploying:

```bash
# Terminal 1: Start backend
cd server
npm install
npm start
# Backend runs on http://localhost:5000

# Terminal 2: Start frontend
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Ensure local `.env` files match your development environment.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
