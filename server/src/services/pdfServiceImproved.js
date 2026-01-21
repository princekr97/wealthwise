import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
import { generateTripReportHTML } from '../utils/pdfTemplate.js';

/**
 * IMPROVED Puppeteer PDF Service with Better Stability
 * 
 * IMPROVEMENTS MADE:
 * 1. Request queue to prevent concurrent overload
 * 2. Browser health checks with timeout
 * 3. Better error recovery
 * 4. Comprehensive Chrome args for stability
 * 5. Automatic browser restart on failures
 * 
 * Still has limitations:
 * - Platform-dependent (Chrome required)
 * - Memory intensive
 * - Can still crash under load
 * 
 * For production, consider switching to PDFShift (see pdfServicePDFShift.js)
 */

console.log('[PDF Service] Initializing Improved Puppeteer Service...');
console.log('[PDF Service] Environment:', process.env.NODE_ENV);
console.log('[PDF Service] Vercel:', process.env.VERCEL ? 'Yes' : 'No');

export class PDFService {
  static browserInstance = null;
  static requestQueue = [];
  static isProcessing = false;
  static MAX_CONCURRENT = 1; // Process one PDF at a time to prevent crashes
  static browserRestarts = 0;
  static MAX_RESTARTS_PER_HOUR = 5;

  /**
   * Queue PDF generation request
   */
  static async generateTripReportPDF(data) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued PDF requests
   */
  static async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { data, resolve, reject } = this.requestQueue.shift();
      
      try {
        console.log(`[PDF Service] Processing request (${this.requestQueue.length} in queue)...`);
        const result = await this._generatePDF(data);
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests to prevent overload
      if (this.requestQueue.length > 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Internal PDF generation
   */
  static async _generatePDF(data) {
    let page = null;

    try {
      console.log('[PDF Service] Starting PDF generation...');
      
      // Generate HTML
      const html = generateTripReportHTML(data);
      console.log('[PDF Service] HTML generated, length:', html.length);

      if (!html || html.length < 100) {
        throw new Error('Generated HTML is empty or too short');
      }

      // Get browser
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 });
      
      console.log('[PDF Service] Browser page created');

      // Set content
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for images (with fallback)
      try {
        await page.waitForFunction(
          () => Array.from(document.images).every(img => img.complete),
          { timeout: 8000 }
        );
        console.log('[PDF Service] All images loaded');
      } catch (e) {
        console.warn('[PDF Service] Image loading timeout, proceeding anyway');
      }

      console.log('[PDF Service] Content loaded, generating PDF...');

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        omitBackground: false,
        scale: 0.95,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '10mm',
          right: '10mm',
        },
      });

      console.log('[PDF Service] PDF generated successfully, size:', pdfBuffer.length, 'bytes');

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      // Debug save in development
      if (process.env.NODE_ENV === 'development') {
        const fs = await import('fs');
        const path = await import('path');
        const debugPath = path.join(process.cwd(), 'debug_report.pdf');
        fs.writeFileSync(debugPath, pdfBuffer);
        console.log('[PDF Service] Debug PDF saved to:', debugPath);
      }

      return pdfBuffer;
    } catch (error) {
      console.error('[PDF Service] Error:', error.message);
      console.error('[PDF Service] Stack:', error.stack);
      
      // Handle browser crashes
      if (error.message.includes('closed') || 
          error.message.includes('not opened') || 
          error.message.includes('disconnected') || 
          error.message.includes('Target closed')) {
        console.warn('[PDF Service] Browser crash detected, restarting...');
        await this.cleanup();
        this.browserRestarts++;
      }
      
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (page) {
        try {
          await page.close();
          console.log('[PDF Service] Page closed');
        } catch (e) {
          console.warn('[PDF Service] Error closing page:', e.message);
        }
      }
    }
  }

  /**
   * Get or create browser instance with improved health checks
   */
  static async getBrowser() {
    try {
      // Check if browser is still usable with timeout
      if (this.browserInstance) {
        try {
          const versionPromise = this.browserInstance.version();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Browser health check timeout')), 3000)
          );
          
          const version = await Promise.race([versionPromise, timeoutPromise]);
          console.log('[PDF Service] Reusing existing browser:', version);
          return this.browserInstance;
        } catch (e) {
          console.warn('[PDF Service] Existing browser unusable:', e.message);
          try {
            await this.browserInstance.close();
          } catch (closeErr) {
            console.warn('[PDF Service] Error closing bad browser:', closeErr.message);
          }
          this.browserInstance = null;
        }
      }

      // Launch new browser
      if (!this.browserInstance) {
        const isDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        let options;

        if (isDev) {
          // Development with comprehensive args
          options = {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--no-first-run',
              '--no-zygote',
              '--disable-extensions',
              '--disable-background-networking',
              '--disable-default-apps',
              '--disable-sync',
              '--disable-translate',
              '--hide-scrollbars',
              '--metrics-recording-only',
              '--mute-audio',
              '--safebrowsing-disable-auto-update',
              '--single-process',
            ],
            headless: true,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            timeout: 30000,
          };
          console.log('[PDF Service] DEV mode - Using local Chrome with stability args');
        } else if (process.env.RENDER || process.env.DOCKER_CONTAINER) {
          options = {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable',
            ignoreHTTPSErrors: true
          };
          console.log('[PDF Service] DOCKER mode');
        } else {
          // Vercel with @sparticuz/chromium
          console.log('[PDF Service] VERCEL mode');
          try {
            if (chromiumPkg.setGraphicsMode) {
              await chromiumPkg.setGraphicsMode(false);
            }
          } catch (e) {}
          
          let executablePath = await chromiumPkg.executablePath();
          options = {
            args: chromiumPkg.args,
            defaultViewport: chromiumPkg.defaultViewport,
            executablePath: executablePath,
            headless: chromiumPkg.headless,
            ignoreHTTPSErrors: true,
          };
        }

        console.log(`[PDF Service] Launching browser...`);
        this.browserInstance = await puppeteer.launch(options);
        console.log('[PDF Service] ✓ Browser launched successfully');
      }
      
      return this.browserInstance;
    } catch (error) {
      console.error('[PDF Service] ✗ Browser launch FAILED');
      console.error('[PDF Service] Error:', error.message);
      this.browserInstance = null;
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  /**
   * Cleanup browser
   */
  static async cleanup() {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
        console.log('[PDF Service] Browser closed');
      } catch (e) {
        console.warn('[PDF Service] Browser close error:', e.message);
      } finally {
        this.browserInstance = null;
      }
    }
  }
}

// Cleanup on exit
process.on('exit', () => {
  PDFService.cleanup();
});

process.on('SIGINT', async () => {
  await PDFService.cleanup();
  process.exit(0);
});
