/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 * Deployed: 2026-01-20 01:46 IST (Build v6 - chrome-aws-lambda)
 */

console.log('[Serverless Init] === DEPLOYMENT BUILD v6 ===');
console.log('[Serverless Init] Timestamp:', new Date().toISOString());
console.log('[Serverless Init] MONGODB_URI env var exists:', !!process.env.MONGODB_URI);

import app from '../src/app.js';

console.log('[Serverless Init] App imported successfully');
console.log('[Serverless Init] Using chrome-aws-lambda for PDF generation');

export default app;

