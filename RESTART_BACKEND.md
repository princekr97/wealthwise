# ⚠️ IMPORTANT: Restart Backend Server

The Group model enum has been updated to support 'Personal' category.

## Steps to Apply Changes:

1. **Stop the backend server** (Ctrl+C in the terminal running the server)

2. **Restart the backend server**:
   ```bash
   cd server
   npm run dev
   ```

3. **Clear browser cache** (optional but recommended):
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open DevTools → Application → Clear Storage → Clear site data

## What Changed:
- Backend: `server/src/models/groupModel.js`
  - Enum updated from `['Trip', 'Home', 'Couple', 'Other']`
  - To: `['Trip', 'Home', 'Personal', 'Other']`

- Frontend: Already using 'Personal' correctly

After restart, all 4 categories will work:
✅ Home 🏠
✅ Trip ✈️
✅ Personal 👤
✅ Other 📄
