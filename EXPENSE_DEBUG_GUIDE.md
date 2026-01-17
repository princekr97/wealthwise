# Expense Data Not Showing - Debugging Steps

## 🔍 Problem
Expense data is not displaying on:
- http://localhost:5173/app/expenses
- http://localhost:5173/app/dashboard

## ✅ Fixes Applied

### 1. Fixed Date Range Utility
**File:** `/server/src/utils/dateRange.js`
- Fixed `getLastMonthsRange()` to start from the 1st day of the month
- This was causing expenses to not show if added before today's date in the current month

### 2. Created API Testing Tool
**File:** `/client/test-api.html`
- Open this file in your browser to test API endpoints
- Check authentication
- Test expense endpoints
- Add sample data

## 🚀 Next Steps

### Step 1: Use the API Tester
1. Open the test file in your browser:
   ```bash
   open client/test-api.html
   ```
   (or just double-click `test-api.html` in Finder)

2. Click **"Check Health"** to ensure server is running
3. Login or Register:
   - Use the pre-filled credentials or your own
   - Click **"Login"** or **"Register"**
4. Test Expenses:
   - Click **"Get All Expenses"** to see if you have any
   - If empty, click **"Add Sample Expense"** to create test data
   - Click **"Get By Category"** to check category analytics

### Step 2: Check Your Frontend

1. **Restart your dev server** (in case the .env change didn't reload):
   ```bash
   cd client
   npm run dev
   ```

2. **Open the browser console** (F12 or Cmd+Option+I)
   - Look for the DEBUG logs from `useExpenses.js`
   - Check for any error messages in red

3. **Check if you're logged in:**
   - Go to http://localhost:5173
   - If not logged in, register/login first
   - Then navigate to /app/expenses

### Step 3: Verify Backend

The server should be running on port **5001** (not 5000).

Check if server is running:
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{"status":"ok","message":"WealthWise API is running","database":"connected"}
```

## 🐛 Common Issues

### Issue 1: Not Logged In
- **Symptom:** API returns 401 Unauthorized
- **Fix:** Login at http://localhost:5173/login

### Issue 2: No Data
- **Symptom:** Empty arrays returned from API
- **Fix:** Add sample expenses using the test tool or the web interface

### Issue 3: Wrong Port
- **Symptom:** CORS errors or connection refused
- **Fix:** Ensure server is on port 5001 and client .env has `VITE_API_BASE_URL=http://localhost:5001/api`

### Issue 4: Date Range Issues
- **Symptom:** Expenses exist but don't show up
- **Fix:** Already fixed in `dateRange.js` - restart the server (nodemon should auto-restart)

## 📝 Check These Files

If still having issues, check:

1. **Client .env file** (`/client/.env`):
   ```
   VITE_API_BASE_URL=http://localhost:5001/api
   ```

2. **Server .env file** (`/server/.env`):
   ```
   PORT=5001
   MONGODB_URI=mongodb+srv://...your-connection-string
   CLIENT_URL=http://localhost:5173
   ```

3. **Browser Local Storage:**
   - Open console (F12)
   - Go to Application/Storage → Local Storage
   - Look for `wealthwise-token`
   - If missing, you need to login

## 🎯 Expected Behavior

After fixes:
1. ✅ Server runs on port 5001
2. ✅ CORS configured correctly
3. ✅ Date range includes full month from day 1
4. ✅ Expenses API returns data if logged in
5. ✅ Dashboard shows expense breakdown

## Need More Help?

1. **Check browser console** for exact error messages
2. **Use the API tester** (test-api.html) to isolate the issue
3. **Check server logs** in the terminal where nodemon is running
4. Look for the DEBUG console.logs from the useExpenses hook

The debug logs will show:
```
DEBUG: catData = {...}
DEBUG: catData.categories = [...]
DEBUG: Processing category = Food amount = 1500
DEBUG: Final categoryData = {Food: 1500, ...}
```

If you don't see these logs, the hook isn't loading or the API isn't returning data.
