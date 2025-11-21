# Vercel Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment Setup

### GitHub & Repositories
- [ ] Both client and server code are pushed to GitHub
- [ ] Repository is accessible (public or private with Vercel access)
- [ ] Main branch is clean and has no uncommitted changes

### Local Configuration
- [ ] Backend `.env` file has all required variables for local testing
- [ ] Frontend `.env` file points to local backend (`http://localhost:5000/api`)
- [ ] Both apps run successfully locally (`npm run dev` for client, `npm start` for server)

### MongoDB & Database
- [ ] MongoDB Atlas account created
- [ ] Cluster is active and running
- [ ] Database user created with appropriate permissions
- [ ] Connection string is valid
- [ ] IP whitelist includes `0.0.0.0/0` (for Vercel) or add specific Vercel IPs

### Credentials & Secrets
- [ ] Generate a strong `JWT_SECRET` (at least 32 characters, random)
- [ ] Have your MongoDB connection string ready
- [ ] Have your frontend Vercel domain ready (you can update this later)

---

## Backend Deployment

### Step 1: Deploy to Vercel
- [ ] Navigate to `server` directory
- [ ] Run `vercel --prod`
- [ ] Select appropriate project name (e.g., `wealthwise-backend`)
- [ ] Framework: `Other`
- [ ] Build Command: `npm install`
- [ ] Deployment succeeds
- [ ] **Note the backend URL** (e.g., `https://wealthwise-backend.vercel.app`)

### Step 2: Environment Variables
- [ ] Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
- [ ] Add `NODE_ENV = production`
- [ ] Add `MONGODB_URI = <your-mongodb-connection-string>`
- [ ] Add `JWT_SECRET = <strong-random-secret>`
- [ ] Add `JWT_EXPIRES_IN = 7d`
- [ ] Add `CLIENT_URL = https://your-frontend-domain.vercel.app` (update after frontend deployment)

### Step 3: Verify Backend
- [ ] Test health endpoint: `https://your-backend-url.vercel.app/api/health`
- [ ] Should return: `{ "status": "ok", "message": "WealthWise API is running" }`

---

## Frontend Deployment

### Step 1: Deploy to Vercel
- [ ] Navigate to `client` directory
- [ ] Run `vercel --prod`
- [ ] Select appropriate project name (e.g., `wealthwise-frontend`)
- [ ] Framework: `Vite`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Deployment succeeds
- [ ] **Note the frontend URL** (e.g., `https://wealthwise-frontend.vercel.app`)

### Step 2: Environment Variables
- [ ] Go to Vercel Dashboard → Frontend Project → Settings → Environment Variables
- [ ] Add `VITE_API_BASE_URL = https://your-backend-url.vercel.app/api`

### Step 3: Verify Frontend
- [ ] Visit frontend URL in browser
- [ ] Page loads without errors
- [ ] Check browser console for any error messages

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
- [ ] Update `CLIENT_URL` to your frontend URL (if not already set)
- [ ] Redeploy backend: `vercel --prod` from `server` folder

### Verify Connectivity
- [ ] Frontend can reach backend (check network tab in browser dev tools)
- [ ] API requests complete successfully
- [ ] No CORS errors in browser console

---

## Testing

### Authentication Flow
- [ ] Register a new account (navigate to Register page)
- [ ] Verify user is created in MongoDB
- [ ] Login with new credentials
- [ ] Dashboard loads without errors

### Core Features
- [ ] Add income - verify it appears in the app
- [ ] Add expense - verify it appears in the app
- [ ] View dashboard - verify charts load
- [ ] Update budget - verify changes persist
- [ ] View all feature pages (Loans, Investments, Lending, etc.)

### Performance
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor response times
- [ ] Check for any errors in Function Logs

### Error Handling
- [ ] Try invalid login credentials - proper error message
- [ ] Try accessing protected routes without login - redirect to login
- [ ] Check network failures are handled gracefully

---

## Monitoring & Maintenance

### Vercel Dashboard
- [ ] Enable GitHub notifications for deployments
- [ ] Set up error monitoring
- [ ] Check analytics dashboard

### MongoDB
- [ ] Monitor connection limits and usage
- [ ] Check disk space available
- [ ] Review slow query logs if performance issues arise

### Security
- [ ] Ensure JWT_SECRET is strong and rotated periodically
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities

---

## Rollback & Troubleshooting

### If Deployment Fails
- [ ] Check Vercel build logs for error messages
- [ ] Verify all environment variables are set correctly
- [ ] Ensure `package.json` scripts are correct
- [ ] Try redeploying with `vercel --prod`

### If Features Don't Work
- [ ] Check browser console for JavaScript errors
- [ ] Check Vercel Function Logs for backend errors
- [ ] Verify MongoDB connection is active
- [ ] Check CORS settings and environment variables

### If You Need to Rollback
- [ ] Vercel keeps deployment history
- [ ] Go to Deployments tab and select a previous version
- [ ] Redeploy or promote previous deployment

---

## Documentation

- [ ] Read `VERCEL_DEPLOYMENT_SUMMARY.md` - Overview of all changes
- [ ] Read `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed step-by-step guide
- [ ] Check `server/api/README.md` - How serverless function works
- [ ] Review `.env.example` files - Environment variable reference

---

## Final Verification

Before considering deployment complete:

- [ ] Frontend loads without errors
- [ ] Can login/register successfully
- [ ] Can perform all CRUD operations
- [ ] All pages render correctly
- [ ] No console errors
- [ ] API health check passes
- [ ] Performance is acceptable
- [ ] Mobile responsive design works

---

## Completion

Once all items are checked:

✅ **Deployment to Vercel is complete!**

Share your frontend URL: `https://your-frontend-vercel-domain.vercel.app`

---

**Questions or Issues?**

Refer to:
- `VERCEL_DEPLOYMENT_GUIDE.md` → Troubleshooting section
- Vercel Documentation: https://vercel.com/docs
- Check Vercel Dashboard Logs
