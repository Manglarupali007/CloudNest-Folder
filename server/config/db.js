
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI && process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not configured');
    }

    const conn = await mongoose.connect(
      mongoURI || 'mongodb://127.0.0.1:27017/cloudnest'
    );

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Database: ${conn.connection.db.databaseName}`);
    console.log(`📍 Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
