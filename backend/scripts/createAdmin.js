const dotenv = require('dotenv');
const { User } = require('../models');
const { connectDB } = require('../config/db');

dotenv.config();

async function createAdminUser() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to database');

    // Check if admin already exists
    const adminExists = await User.findOne({ where: { email: 'admin@admin.com' } });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true
    });

    console.log('Admin user created successfully:');
    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    console.log('\nUse these credentials to login:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 