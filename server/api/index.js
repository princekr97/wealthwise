/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 * Handles connection pooling for serverless environment
 */

import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';

// Global connection flag
let dbConnected = false;
let connecting = false;

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Prevent multiple simultaneous connection attempts
  if (connecting) {
    // Wait for connection attempt to complete
    const maxWait = 30000; // 30 seconds
    const startTime = Date.now();
    while (mongoose.connection.readyState !== 1 && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database service unavailable. Please try again later.'
      });
    }
    return next();
  }

  if (!dbConnected) {
    connecting = true;
    try {
      await connectDB();
      dbConnected = true;
      connecting = false;
      console.log('Database connected on serverless request');
      return next();
    } catch (error) {
      connecting = false;
      console.error('Database connection failed:', error.message);
      return res.status(503).json({
        message: 'Database service unavailable. Please try again later.'
      });
    }
  }
  next();
});

// Export as default for Vercel
export default app;
