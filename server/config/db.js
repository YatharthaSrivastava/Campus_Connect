const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return true;

  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<password>') || uri.includes('cluster0.mongodb.net')) {
    console.log('⚠️ No live MongoDB Atlas connection string configured in .env');
    console.log('💡 CampusConnect is running in In-Memory / Resilient Fallback Mode with sample PSIT data.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection not available (${error.message}).`);
    console.log('💡 CampusConnect is running in In-Memory / Resilient Fallback Mode with sample PSIT data.');
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
