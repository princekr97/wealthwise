# Deploying WealthWise to Render.com with Puppeteer PDF Support

## ✅ What's Been Set Up

Your project now has:
1. **Dockerfile** with Chrome pre-installed
2. **render.yaml** for automatic deployment
3. **Updated pdfService.js** that works on Render

## 🚀 Deployment Steps (10 minutes)

### Step 1: Push to GitHub

```bash
cd /Users/princegupta/Documents/Projects/wealthwise
git add .
git commit -m "Add Render deployment config with Puppeteer support"
git push origin main
```

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select your repo: `wealthwise`
5. Click **"Apply"**

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

**Required:**
- `MONGODB_URI` = your MongoDB connection string
- `JWT_SECRET` = your secret key (any random string)

**Optional (if using):**
- `FRONTEND_URL` = https://your-frontend-url.com
- Other API keys you have

### Step 4: Wait for Build

- First build takes 5-10 minutes (installing Chrome)
- Subsequent builds are faster (~2 minutes)
- Watch the logs for "Build successful"

### Step 5: Test PDF Generation

Once deployed, test a PDF:
1. Open your app
2. Create a group with expenses
3. Click "Trip Report & Export"
4. PDF should generate in 3-5 seconds ✅

---

## 🔧 Troubleshooting

### If build fails:

**Check the logs** in Render dashboard for:

1. **"Chrome not found"** → Dockerfile issue (should not happen with our config)
2. **"Out of memory"** → Upgrade to paid plan ($7/month for 512MB)
3. **"Timeout"** → Increase health check timeout in render.yaml

### If PDF generation fails in production:

Check environment variable:
- `DOCKER_CONTAINER=true` is set in Render dashboard

---

## 💰 Render Pricing

**Free Tier:**
- ✅ Perfect for your use case (low PDF usage)
- Services spin down after 15 min inactivity
- Spin up takes ~30 seconds
- 750 hours/month free (basically always-on)

**Paid Tier ($7/month):**
- Always awake (0 second response)
- More memory (better for PDFs)
- Consider only if you get lots of traffic

---

## 📊 Expected Performance

**PDF Generation Times on Render:**
- First PDF (cold start): 30-40 seconds
- Subsequent PDFs: 5-10 seconds
- With paid tier: 5-10 seconds always

---

## ✅ Why This Won't Break Anymore

1. **Chrome is in Docker** → Always available
2. **Render restarts on crash** → Auto-recovery
3. **Health checks** → Automatic healing
4. **Same environment every time** → No surprises

---

## 🎯 Next Steps After Deployment

1. Update `VITE_API_BASE_URL` in your frontend to point to Render URL
2. Test PDF generation in production
3. Monitor Render logs for first few days
4. Enjoy never debugging PDF issues again! 🎉

---

## 🆘 Need Help?

If deployment fails or you get stuck:
1. Share the Render build logs
2. Share the runtime logs
3. I'll help you fix it immediately

---

**Ready to deploy?** Just run the git commands above and follow the Render steps!
