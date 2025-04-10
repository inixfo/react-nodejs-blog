const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

async function createDatabase() {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL');

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Close the connection
    await connection.end();
    console.log('Connection closed successfully');
    
    console.log('Script completed successfully!');
    
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDatabase(); 