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
      res.status(500).json({
        success: false,
        message: 'PDF generation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
};
