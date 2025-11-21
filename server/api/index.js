/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 */

import dotenv from 'dotenv';
dotenv.config();

// Import the Express app from src/app.js
import app from '../src/app.js';

// Export as default for Vercel
export default app;
