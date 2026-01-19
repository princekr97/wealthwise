import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateTripReportHTML } from '../utils/pdfTemplate.js';

/**
 * PDF Generation Service using Puppeteer
 * Converts HTML templates to high-quality PDFs
 * Optimized for Vercel/Serverless environments
 * 
 * Environment Variables (Optional):
 * - CHROMIUM_EXECUTABLE_PATH: Override chromium binary path
 * - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: Set to 'true' if using @sparticuz/chromium
 */

// Log versions for debugging
console.log('[PDF Service] Initializing...');
console.log('[PDF Service] Environment:', process.env.NODE_ENV);
console.log('[PDF Service] Vercel:', process.env.VERCEL ? 'Yes' : 'No');

export class PDFService {
  static browserInstance = null;

  /**
   * Get or create browser instance (reuse for performance)
   */
  static async getBrowser() {
    try {
      if (!this.browserInstance || !this.browserInstance.isConnected()) {
        const isDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        
        let options;
        
        if (isDev) {
          // Local development
          options = {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          };
          console.log('[PDF Service] DEV mode - Using local Chrome');
        } else {
          // Production (Vercel) - Use @sparticuz/chromium
          console.log('[PDF Service] PROD mode - Configuring Chromium for serverless...');
          
          // CRITICAL: Set graphics mode BEFORE getting executablePath
          await chromium.setGraphicsMode(false); // Disable GPU for serverless
          
          let executablePath;
          try {
            // Allow override via environment variable for flexibility
            executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || await chromium.executablePath();
            console.log('[PDF Service] ✓ Chromium path resolved:', executablePath);
          } catch (pathError) {
            console.error('[PDF Service] ✗ Failed to get chromium path:', pathError);
            throw new Error(`Chromium path resolution failed: ${pathError.message}. Try setting CHROMIUM_EXECUTABLE_PATH env var.`);
          }
          
          // Validate path exists
          if (!executablePath || executablePath.length === 0) {
            throw new Error('Chromium executablePath is empty or undefined. Ensure @sparticuz/chromium v143+ is installed.');
          }
          
          options = {
            args: [
              ...chromium.args,
              '--disable-gpu',
              '--disable-dev-shm-usage',
              '--disable-setuid-sandbox',
              '--no-sandbox',
              '--single-process', // Important for serverless
              '--no-zygote', // Important for serverless
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
          };
          
          console.log('[PDF Service] Chromium config:', {
            headless: chromium.headless,
            argsCount: options.args.length,
            execPath: executablePath.substring(0, 30) + '...', // Truncate for logs
          });
        }

        console.log(`[PDF Service] Launching browser...`);
        this.browserInstance = await puppeteer.launch(options);
        console.log('[PDF Service] ✓ Browser launched successfully');
      }
      return this.browserInstance;
    } catch (error) {
      console.error('[PDF Service] ✗ Browser launch FAILED');
      console.error('[PDF Service] Error:', error.message);
      console.error('[PDF Service] Stack:', error.stack);
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  /**
   * Generate Trip Expense Report PDF
   * @param {Object} data - { group, expenses, balances }
   * @returns {Buffer} PDF buffer
   */
  static async generateTripReportPDF(data) {
    let page = null;

    try {
      console.log('[PDF Service] Starting PDF generation...');
      
      // Generate HTML
      const html = generateTripReportHTML(data);
      console.log('[PDF Service] HTML generated, length:', html.length);

      // Validate HTML
      if (!html || html.length < 100) {
        throw new Error('Generated HTML is empty or too short');
      }

      // Launch browser
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      console.log('[PDF Service] Browser page created');

      // Set content
      await page.setContent(html, {
        waitUntil: 'domcontentloaded', // Faster and more reliable on serverless (no external resources)
        timeout: 30000, 
      });

      console.log('[PDF Service] Content loaded, generating PDF...');

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
      });

      console.log('[PDF Service] PDF generated, size:', pdfBuffer.length, 'bytes');

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      // Debug: Save to file to verify PDF is valid
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
      
      // If we failed to create a page or browser seems broken, clean up
      if (!page || error.message.includes('closed') || error.message.includes('not opened')) {
          console.warn('[PDF Service] Browser/Page issue detected, resetting instance...');
          await PDFService.cleanup();
      }
      
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (page) {
        await page.close();
        console.log('[PDF Service] Page closed');
      }
    }
  }

  /**
   * Cleanup browser instance
   */
  static async cleanup() {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }
}

// Cleanup on process exit
process.on('exit', () => {
  PDFService.cleanup();
});

process.on('SIGINT', async () => {
  await PDFService.cleanup();
  process.exit(0);
});
