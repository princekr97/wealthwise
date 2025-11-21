# MongoDB Connection Timeout - SOLUTION

## Problem
```
{"message":"Database connection timeout. Please try again."}
```

This error means Vercel cannot reach your MongoDB cluster.

## Root Cause: IP Whitelist

MongoDB Atlas requires whitelisting the IP addresses that can connect to it. Vercel's serverless functions have dynamic IPs, so you need to allow all IPs or add Vercel's specific IP ranges.

## Solution: Add Vercel IPs to MongoDB

### Option 1: Quick Fix (Allow All IPs - For Testing)

**SECURITY WARNING**: This allows anyone to connect if they have your connection string. Use only for testing.

1. Go to **MongoDB Atlas** → https://cloud.mongodb.com
2. Click your **Cluster** → **Network Access** (or Security → Network Access)
3. Click **"Add IP Address"** button
4. In the dialog, enter: **`0.0.0.0/0`**
5. Click **"Confirm"**
6. Wait for changes to apply (usually 1-2 minutes, shows "Pending" then "Active")

### Option 2: Production-Ready (Add Vercel IP Ranges)

Add these specific Vercel IP ranges to your IP whitelist:

```
104.199.0.0/16
137.184.0.0/16
```

Steps:
1. Go to **MongoDB Atlas** → **Network Access**
2. Click **"Add IP Address"** multiple times:
   - First: `104.199.0.0/16`
   - Second: `137.184.0.0/16`
3. Click **"Confirm"** for each
4. Wait for "Active" status

## Verification

After updating the IP whitelist, wait 1-2 minutes, then test:

```bash
curl https://wealthwise-backend-delta.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "WealthWise API is running",
  "database": "connected",
  "timestamp": "2025-11-21T..."
}
```

If `"database": "disconnected"`, the IP whitelist still hasn't taken effect. Wait another minute.

## Additional Checks

### 1. Verify MongoDB Cluster is Running
- MongoDB Atlas Dashboard
- Select your cluster
- Should show status: **"ACTIVE"** (green circle)

### 2. Verify Connection String in Vercel
1. Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Check `MONGODB_URI` is set
3. Format should be: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=wealthwise`

### 3. Verify Credentials
In your MongoDB Atlas:
- Go to **Database Access**
- Find your user (e.g., "princekrgupta97")
- Password should match the one in `MONGODB_URI`
- Status should be **"Active"**

## If Still Not Working

### Check MongoDB Logs
1. MongoDB Atlas → Cluster → Logs
2. Look for connection attempts and errors

### Test Connection Locally
From your local machine, test if MongoDB credentials work:
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=wealthwise"
```

Should connect successfully (not timeout).

### Check Vercel Logs
1. Vercel Dashboard → Backend Project → Deployments
2. Click latest deployment
3. Click **"Runtime Logs"**
4. Make a request to trigger logs
5. Look for specific error messages

## Network Connectivity Diagram

```
Your Browser
    ↓
Frontend (Vercel)
    ↓
HTTPS API Call
    ↓
Backend (Vercel Serverless)
    ↓
MongoDB Query
    ↓
MongoDB Atlas Cluster
    ↓ (Must whitelist Vercel IPs!)
```

If the connection fails at the "MongoDB Atlas" step, it's the IP whitelist issue.

## Complete Troubleshooting Checklist

- [ ] MongoDB cluster shows "ACTIVE" status
- [ ] IP whitelist includes `0.0.0.0/0` OR Vercel IP ranges
- [ ] IP whitelist shows "Active" (not "Pending")
- [ ] Connection string is correct in `MONGODB_URI`
- [ ] Database user credentials are correct
- [ ] Can test connection locally from your machine
- [ ] Backend environment variables set in Vercel
- [ ] Latest code deployed (commit `5aff2e9`)

## Quick Reference

**MongoDB IP Whitelist Location:**
```
https://cloud.mongodb.com 
→ Project 
→ Cluster 
→ Security 
→ Network Access 
→ Add IP Address
```

**Vercel Backend URL:**
```
https://wealthwise-backend-delta.vercel.app/api/health
```

**Expected Response (When Working):**
```json
{
  "status": "ok",
  "message": "WealthWise API is running",
  "database": "connected",
  "timestamp": "2025-11-21T20:45:30.123Z"
}
```

---

**After fixing the IP whitelist:**
1. Wait 1-2 minutes for changes to apply
2. Test the health endpoint
3. Try logging in to your app
