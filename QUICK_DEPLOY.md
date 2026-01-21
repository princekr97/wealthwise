# 🚀 Quick Deploy to Render - 5 Steps

## Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add Render config with Puppeteer support"
git push
```

## Step 2: Create Render Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your repo: `wealthwise`
4. Click **"Apply"**

## Step 3: Set Environment Variables
In Render dashboard, add:
- `MONGODB_URI` = `your_mongodb_connection_string`
- `JWT_SECRET` = `any_random_secure_string`
- `DOCKER_CONTAINER` = `true` (already in render.yaml)

## Step 4: Wait for Build (5-10 min)
Watch logs for:
```
✓ Installing Chrome...
✓ Installing dependencies...
✓ Building Docker image...
✓ Deployment live!
```

## Step 5: Test PDF
1. Open your app
2. Go to Groups → Any group
3. Click "Trip Report" button
4. PDF should generate ✅

---

## 🆘 Troubleshooting

**Build fails?**
- Check if Dockerfile is in `/server/` folder
- Check if render.yaml is in ROOT folder

**PDF fails?**
- Check `DOCKER_CONTAINER=true` is set
- Check Render logs for Chrome errors
- Share logs with me

**App won't start?**
- Check MONGODB_URI is correct
- Check PORT is 5001 in env vars

---

## 📞 Get Help
If stuck, share:
1. Render build logs
2. Render runtime logs  
3. Error message you see

Done! 🎉
