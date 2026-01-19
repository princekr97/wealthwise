# PDF Production Fix - Deploy Instructions

## What Was Fixed
The PDF generation was failing on Vercel with error:
```
Could not find Chrome (ver. 143.0.7499.192)
cache path: /home/sbx_user1051/.cache/puppeteer
```

**Root Cause**: `chromium.executablePath()` was either:
1. Returning undefined/empty path
2. Version mismatch between puppeteer-core and @sparticuz/chromium

## Changes Made

### 1. Updated Dependencies (package.json)
```json
"@sparticuz/chromium": "^143.0.1"  // Was: 133.0.0
"puppeteer-core": "^24.1.0"        // Was: ^24.35.0
```
✓ Both now target Chrome 143 (compatible versions)

### 2. Improved Error Handling (pdfService.js)
- Added explicit validation of `executablePath`
- Try-catch around chromium path resolution
- Better logging to debug production issues
- Validates path is not empty before using

## Deploy Steps

1. **Commit Changes**
   ```bash
   cd server
   git add package.json src/services/pdfService.js
   git commit -m "fix: PDF generation on Vercel - chromium v143 + path validation"
   ```

2. **Push to Deploy**
   ```bash
   git push origin main
   ```

3. **Verify on Vercel**
   - Check deployment logs for: `[PDF Service] ✓ Chromium path resolved`
   - Test PDF generation endpoint
   - Should see clean logs without cache path errors

## Expected Logs (Success)
```
[PDF Service] PROD mode - Resolving Chromium for serverless...
[PDF Service] ✓ Chromium path resolved: /tmp/chromium
[PDF Service] Chromium config: { headless: true, argsCount: 15 }
[PDF Service] Launching browser...
[PDF Service] ✓ Browser launched successfully
```

## If Still Failing
Check Vercel logs for exact error:
- `✗ Failed to get chromium path` = chromium package issue
- `executablePath is empty` = path resolution failed
- `Browser launch FAILED` = puppeteer launch issue

Then we'll know exactly where to fix next!
