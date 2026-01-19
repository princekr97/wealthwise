import express from 'express';
import { pdfController } from '../controllers/pdfController.js';

const router = express.Router();

/**
 * PDF Generation Routes
 * Base path: /api/pdf
 */

// Generate Trip Expense Report PDF
router.post('/trip-report', pdfController.generateTripReport);

export default router;
