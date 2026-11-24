const mongoose = require('mongoose');
const seedProducts = require('./seedProducts');

const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^:@]+)@/, ':****@'));
    
    // Connect with options
    await mongoose.connect(uri, {
      dbName: 'orange_garments',
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    
    console.log('MongoDB Atlas Database connected successfully..!');
    
    // Seed initial garment catalog if needed
    await seedProducts();

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Tip: Ensure your MongoDB Atlas cluster is active (not paused) and Network Access allows your IP (0.0.0.0/0).');
    
    // Retry connection after delay if Atlas is resuming
    setTimeout(() => {
      console.log('Retrying MongoDB connection...');
      connectMongoDB();
    }, 15000);
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

module.exports = connectMongoDB;
