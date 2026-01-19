# PDF Generation Production Fix 🔧

## Problem
PDF generation was failing in production (Vercel) with error:
```json
{"success":false,"message":"PDF generation failed"}
```

## Root Causes Identified

### 1. ⏱️ **Timeout Issues**
- **Problem**: Vercel function timeout was set to 30 seconds
- **Issue**: Puppeteer + Chromium initialization + PDF generation often exceeds 30s
- **Solution**: Increased `maxDuration` to 60 seconds

### 2. 💾 **Memory Constraints**
- **Problem**: Only 1024MB allocated to serverless function
- **Issue**: Chromium requires significant memory (often 1.5-2GB+)
- **Solution**: Increased `memory` to 3008MB (Vercel's max for Pro)

### 3. 🌐 **Network Idle Detection**
- **Problem**: Used `waitUntil: 'networkidle2'` in `page.setContent()`
- **Issue**: In serverless environments, network idle detection can be unreliable and cause timeouts
- **Solution**: Changed to `waitUntil: 'domcontentloaded'` which is faster and more reliable for static HTML

### 4. 🔍 **Poor Error Logging**
- **Problem**: Generic error messages made debugging difficult
- **Issue**: Couldn't identify the root cause from production logs
- **Solution**: Enhanced error logging with detailed browser launch info and error context

## Changes Made

### 📄 `server/vercel.json`
```diff
  "functions": {
    "api/index.js": {
-     "memory": 1024,
-     "maxDuration": 30
+     "memory": 3008,
+     "maxDuration": 60
    }
  }
```

### 📄 `server/src/services/pdfService.js`
1. **Better Browser Launch Error Handling**:
   - Added try-catch around browser initialization
   - Added detailed logging of Chromium paths and args
   - More descriptive error messages

2. **Faster Content Loading**:
```diff
  await page.setContent(html, {
-   waitUntil: 'networkidle2',
-   timeout: 60000,
+   waitUntil: 'domcontentloaded',
+   timeout: 30000,
  });
```

### 📄 `server/src/controllers/pdfController.js`
- Enhanced error response with development/production modes
- Added comprehensive error logging
- Better error serialization for debugging

## Deployment Steps

### 1. **Commit Changes**
```bash
cd /Users/princegupta/Documents/Projects/wealthwise
git add server/vercel.json server/src/services/pdfService.js server/src/controllers/pdfController.js
git commit -m "fix: PDF generation in production - increase timeout/memory, improve error handling"
```

### 2. **Deploy to Vercel**
```bash
cd server
vercel --prod
```

### 3. **Monitor Logs**
After deployment, test PDF generation and check logs:
```bash
vercel logs --prod
```

Look for these success indicators:
- ✅ `[PDF Service] Launching browser in PROD mode...`
- ✅ `[PDF Service] Browser launched successfully`
- ✅ `[PDF Service] PDF generated, size: XXX bytes`

## Testing in Production

### Test Endpoint
```bash
curl -X POST https://your-api.vercel.app/api/pdf/trip-report \
  -H "Content-Type: application/json" \
  -d '{
    "group": {
      "name": "Test Trip",
      "members": ["Alice", "Bob"]
    },
    "expenses": [],
    "balances": {}
  }'
```

### Expected Success Response
- Direct PDF download with headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="Test_Trip_Report.pdf"`

### If Still Failing
Check Vercel logs for:
1. Browser launch errors
2. Memory exhaustion
3. Timeout errors
4. Chromium executable path issues

## Additional Optimization (If Needed)

### Option 1: Use External PDF Service
If issues persist, consider using:
- **PDFShift** (pdfshift.io)
- **DocRaptor** (docraptor.com)
- **Puppeteer as a Service** (browserless.io)

### Option 2: Move to Long-Running Server
- Deploy PDF service to Railway, Render, or AWS EC2
- Keep main API on Vercel
- Make API call to dedicated PDF server

### Option 3: Client-Side PDF Generation
- Use **jsPDF** or **pdfmake.js** for client-side generation
- Pro: No server resources needed
- Con: Limited styling capabilities

## Dependencies Version Check
Ensure these are installed:
```json
{
  "@sparticuz/chromium": "133.0.0",
  "puppeteer-core": "^24.35.0"
}
```

## Common Production Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Protocol error: Connection closed` | Browser crashed (OOM) | Increase memory allocation |
| `Timeout 30000ms exceeded` | Function timeout | Increase `maxDuration` |
| `Cannot find Chrome binary` | Wrong executablePath | Use `@sparticuz/chromium` |
| `ENOMEM` | Out of memory | Increase `memory` to 3008MB |
| `ERR_INSUFFICIENT_RESOURCES` | Too many concurrent requests | Implement request queuing |

## Vercel Limits (Pro Plan)
- Max memory: **3008 MB**
- Max duration: **60 seconds**
- Max payload: **4.5 MB**

If hitting these limits, consider alternative hosting for PDF routes.

---

## Status: ✅ READY FOR DEPLOYMENT

All changes have been applied. Please commit and deploy to test.
