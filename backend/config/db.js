const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Sequelize with database parameters from .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test DB connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database Connected Successfully');
    
    // Sync all models with database
    // Note: In production, you might want to use migrations instead
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
    }
  } catch (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 