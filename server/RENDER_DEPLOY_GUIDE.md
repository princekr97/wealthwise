# 🚀 Moving to Render (The Permanent Fix)

You have chosen **Option C: External Server**. This is the robust, professional solution.
Render.com uses Docker, so we are not limited by Vercel's 50MB cap. We use a full Chrome instance.

## 1. Setup Render
1.  Push the latest code to GitHub (I will do this now).
2.  Go to [Render.com Dashboard](https://dashboard.render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository (`wealthwise`).
5.  **Root Directory**: `server` (Important!).

## 2. Configure Service
*   **Runtime**: Docker (Render should detect the `Dockerfile` automatically).
*   **Region**: Singapore (or nearest).
*   **Instance Type**: Free (or Starter).

## 3. Environment Variables
Add these in the Render Dashboard (Environment tab):
*   `MONGODB_URI`: (Copy from your Vercel/local `.env`)
*   `JWT_SECRET`: (Copy from .env)
*   `CLIENT_URL`: `https://khatabahi-pg.vercel.app` (Your frontend URL)
*   `NODE_ENV`: `production`

## 4. Updates needed in Frontend
Once Render deploys, it will give you a new URL (e.g., `https://wealthwise-backend.onrender.com`).
1.  Go to your Frontend (`client` folder).
2.  Update the API base URL to point to this new Render URL.

## Summary
*   **Vercel**: Hosts Frontend (React).
*   **Render**: Hosts Backend (Node + Chrome + PDF).

This architecture is **Unbreakable**.
