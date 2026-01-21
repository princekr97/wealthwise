import axios from 'axios';
import { generateTripReportHTML } from '../utils/pdfTemplate.js';

/**
 * PDF Generation Service using PDFShift API
 * 
 * FUTURE-PROOF SOLUTION:
 * - Works on ANY hosting platform (Vercel, Render, Railway, etc.)
 * - No Chrome/Chromium dependency
 * - No memory issues or crashes
 * - Professional support
 * 
 * Setup:
 * 1. Sign up at https://pdfshift.io (free 250 PDFs/month)
 * 2. Get API key from dashboard
 * 3. Add PDFSHIFT_API_KEY to .env file
 * 
 * Pricing: $9/month for 1,000 PDFs, $29/month for 5,000 PDFs
 */

export class PDFService {
  /**
   * Generate Trip Expense Report PDF
   * @param {Object} data - { group, expenses, balances }
   * @returns {Buffer} PDF buffer
   */
  static async generateTripReportPDF(data) {
    const apiKey = process.env.PDFSHIFT_API_KEY;

    if (!apiKey) {
      throw new Error(
        'PDFSHIFT_API_KEY not configured. ' +
        'Sign up at https://pdfshift.io and add your API key to .env file. ' +
        'Free tier: 250 PDFs/month. Paid plans start at $9/month for 1,000 PDFs.'
      );
    }

    try {
      console.log('[PDF Service] Generating PDF via PDFShift API...');
      
      // Generate HTML from template
      const html = generateTripReportHTML(data);
      console.log('[PDF Service] HTML generated, length:', html.length);

      // Call PDFShift API
      const response = await axios.post(
        'https://api.pdfshift.io/v3/convert/pdf',
        {
          source: html,
          sandbox: true, // Enable JavaScript (for dynamic content if needed)
          format: 'A4',
          margin: {
            top: '10mm',
            bottom: '10mm',
            left: '10mm',
            right: '10mm',
          },
          landscape: false,
          use_print: true, // Use print media styles
          wait_for: 'document', // Wait for document to load
        },
        {
          auth: {
            username: 'api',
            password: apiKey,
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 seconds
        }
      );

      console.log('[PDF Service] ✓ PDF generated successfully via PDFShift');
      console.log('[PDF Service] PDF size:', response.data.byteLength, 'bytes');

      return Buffer.from(response.data);
    } catch (error) {
      console.error('[PDF Service] ✗ PDFShift API error:', error.message);
      
      if (error.response) {
        console.error('[PDF Service] Status:', error.response.status);
        console.error('[PDF Service] Data:', error.response.data?.toString());
      }

      // Provide helpful error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid PDFShift API key. Check your PDFSHIFT_API_KEY in .env file.');
      } else if (error.response?.status === 402) {
        throw new Error('PDFShift quota exceeded. Upgrade your plan at https://pdfshift.io');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('PDF generation timeout. Try again or contact support.');
      }

      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
}
