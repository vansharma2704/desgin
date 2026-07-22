import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGODB_URI || '').trim();
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment');
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
  }
};
