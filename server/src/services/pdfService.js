import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateTripReportHTML } from '../utils/pdfTemplate.js';

/**
 * PDF Generation Service using Puppeteer
 * Converts HTML templates to high-quality PDFs
 * Optimized for Vercel/Serverless environments
 */

export class PDFService {
  static browserInstance = null;

  /**
   * Get or create browser instance (reuse for performance)
   */
  static async getBrowser() {
    try {
      if (!this.browserInstance || !this.browserInstance.isConnected()) {
        const isDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
        
        const options = isDev 
          ? {
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
              headless: true,
              executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            }
          : {
              args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
              defaultViewport: chromium.defaultViewport,
              executablePath: await chromium.executablePath(),
              headless: chromium.headless,
              ignoreHTTPSErrors: true,
            };

        console.log(`[PDF Service] Launching browser in ${isDev ? 'DEV' : 'PROD'} mode...`);
        if (!isDev) {
          console.log('[PDF Service] Using executablePath:', options.executablePath);
          console.log('[PDF Service] Chromium args:', options.args);
        }
        
        this.browserInstance = await puppeteer.launch(options);
        console.log('[PDF Service] Browser launched successfully');
      }
      return this.browserInstance;
    } catch (error) {
      console.error('[PDF Service] Browser launch failed:', error.message);
      console.error('[PDF Service] Error stack:', error.stack);
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
