/**
 * Database Configuration
 *
 * Handles MongoDB connection using Mongoose.
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGODB_URI from environment variables.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'wealthwise',
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4 // Force IPv4
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};