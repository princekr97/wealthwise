import { PDFService } from '../services/pdfService.js';

/**
 * PDF Generation Controller
 * Handles HTTP requests for PDF generation
 */

export const pdfController = {
  /**
   * Generate Trip Expense Report PDF
   * POST /api/pdf/trip-report
   */
  async generateTripReport(req, res) {
    try {
      const { group, expenses, balances } = req.body;

      // Validation
      if (!group || !expenses || !balances) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: group, expenses, balances',
        });
      }

      if (!group.name || !group.members || !Array.isArray(group.members)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid group data',
        });
      }

      if (!Array.isArray(expenses)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expenses data',
        });
      }

      // Generate PDF
      const pdfBuffer = await PDFService.generateTripReportPDF({
        group,
        expenses,
        balances,
      });

      // Set headers
      const filename = `${group.name.replace(/\s+/g, '_')}_Report.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF as binary
      res.end(pdfBuffer, 'binary');
    } catch (error) {
      console.error('PDF Generation Controller Error:', error);
      console.error('Error stack:', error.stack);
      
      // More detailed error response
      const errorResponse = {
        success: false,
        message: 'PDF generation failed',
      };

      // Add more details in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error = error.message;
        errorResponse.stack = error.stack;
      } else {
        // In production, still log the full error but return sanitized message
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        errorResponse.hint = 'Check server logs for details';
      }

      res.status(500).json(errorResponse);
    }
  },
};
