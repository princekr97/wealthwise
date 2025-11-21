# Vercel Deployment Instructions for WealthWise

## Important: Separate Projects Needed

You need to deploy **TWO separate Vercel projects**:
1. One for the Frontend (client)
2. One for the Backend (server)

## Frontend Deployment (React + Vite)

### In Vercel Dashboard:
1. Click "Add New Project"
2. Import your GitHub repository
3. **IMPORTANT**: Set "Root Directory" to `client` (not root directory)
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend-vercel-url.vercel.app/api`

### Deploy:
- The frontend will be available at your Vercel URL

## Backend Deployment (Node.js + Express)

### In Vercel Dashboard:
1. Click "Add New Project"  
2. Import the SAME GitHub repository
3. **IMPORTANT**: Set "Root Directory" to `server`
4. Framework Preset: Other (Node.js)
5. Build Command: `npm install`
6. Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your JWT secret key
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `https://your-frontend-vercel-url.vercel.app`

### Deploy:
- The backend will be available at your Vercel URL

## Troubleshooting

### Frontend not building: "Could not resolve ./src/main.jsx"
- Solution: Make sure "Root Directory" is set to `client` in Vercel project settings
- NOT: `/client` or root directory

### Backend dependencies failing
- Solution: Already configured with `.npmrc` using `legacy-peer-deps=true`

### Frontend can't connect to backend
- Solution: Ensure `VITE_API_BASE_URL` is set to your backend's actual URL
- Redeploy frontend after changing this variable
