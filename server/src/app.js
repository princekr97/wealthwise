import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import lendingRoutes from './routes/lendingRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import { connectDB } from './config/db.js';

const app = express();

app.use(helmet());

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Global connection management
let dbConnectionPromise = null;

// Middleware to ensure DB connection for all API routes
app.use(async (req, res, next) => {
  // Skip middleware for health check
  if (req.path === '/api/health' || req.path === '/api/test-db') {
    return next();
  }

  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // If connection is in progress, wait for it
    if (dbConnectionPromise) {
      await dbConnectionPromise;
      if (mongoose.connection.readyState === 1) {
        return next();
      }
    }

    // Start a new connection attempt
    dbConnectionPromise = connectDB();
    await dbConnectionPromise;
    next();
  } catch (error) {
    console.error('[App Middleware] Connection error:', error.message);
    res.status(503).json({
      message: 'Database service unavailable. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    // Ensure connection is established
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'ok',
      message: 'WealthWise API is running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[health] Error:', error.message);
    res.json({
      status: 'ok',
      message: 'WealthWise API is running',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Diagnostic endpoint to test connection
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('[test-db] Testing MongoDB connection...');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return res.status(500).json({ error: 'MONGODB_URI not set' });
    }

    // Ensure connection is established
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Try to ping the database
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();

    res.json({
      status: 'connected',
      ping: result,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('[test-db] Error:', error.message);
    res.status(503).json({
      error: error.message,
      name: error.name,
      code: error.code
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/groups', groupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;