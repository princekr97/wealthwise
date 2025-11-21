/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 */

console.log('[Serverless Init] Starting...');
console.log('[Serverless Init] MONGODB_URI env var exists:', !!process.env.MONGODB_URI);

import app from '../src/app.js';

console.log('[Serverless Init] App imported successfully');

export default app;

