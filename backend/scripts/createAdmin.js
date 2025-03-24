const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user exists, updating password...');
      // Force update the password
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('Admin user password updated successfully:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      });
    }
    
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser(); 