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
    const error = 'MONGODB_URI is not defined in environment variables';
    console.error('[connectDB]', error);
    throw new Error(error);
  }

  try {
    console.log('[connectDB] Connecting to MongoDB...');
    console.log('[connectDB] URI starts with:', uri.substring(0, 30) + '...');
    
    const conn = await mongoose.connect(uri, {
      dbName: 'wealthwise',
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4, // Force IPv4
      directConnection: false // Use SRV record (recommended for Atlas)
    });

    console.log('[connectDB] MongoDB connected successfully');
    console.log('[connectDB] Connection readyState:', mongoose.connection.readyState);
    return conn;
  } catch (error) {
    console.error('[connectDB] Connection failed');
    console.error('[connectDB] Error name:', error.name);
    console.error('[connectDB] Error message:', error.message);
    console.error('[connectDB] Error code:', error.code);
    if (error.reason) {
      console.error('[connectDB] Error reason:', error.reason);
    }
    throw error;
  }
};