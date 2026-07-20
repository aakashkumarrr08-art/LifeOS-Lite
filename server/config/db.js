import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI is required to start the server.');
  }

  const connection = await mongoose.connect(config.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

export default connectDB;
