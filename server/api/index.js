/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function for Vercel
 * Handles connection pooling for serverless environment
 */

// Load environment variables
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

console.log('[Serverless Init] Process env MONGODB_URI:', !!process.env.MONGODB_URI);

// Keep a persistent connection
let cachedConnection = null;

async function getConnection() {
  // If mongoose is already connected, return
  if (mongoose.connection.readyState === 1) {
    console.log('[Serverless] Reusing existing connection');
    return mongoose.connection;
  }

  // If we have a cached connection, try to verify it's still alive
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('[Serverless] Using cached connection');
    return cachedConnection;
  }

  // Create new connection
  console.log('[Serverless] Creating new MongoDB connection...');
  try {
    const conn = await connectDB();
    cachedConnection = conn;
    console.log('[Serverless] MongoDB connection established');
    return conn;
  } catch (error) {
    console.error('[Serverless] MongoDB connection failed:', error.message);
    console.error('[Serverless] Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    console.log('[Request] Path:', req.path, 'ReadyState:', mongoose.connection.readyState);
    
    if (req.path === '/api/health') {
      // Health check doesn't need DB
      return next();
    }

    await getConnection();
    next();
  } catch (error) {
    console.error('[Middleware] Connection error:', error.message);
    res.status(503).json({
      message: 'Database service unavailable. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default app;
