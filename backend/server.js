const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');
const { protect } = require('./middleware/auth');
const { sequelize, connectDB } = require('./config/db');
const models = require('./models');

// Load env vars
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST ? 'Present' : 'Missing');
console.log('DB_USER:', process.env.DB_USER ? 'Present' : 'Missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Present (hidden)' : 'Missing');
console.log('DB_NAME:', process.env.DB_NAME ? 'Present' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT || 5000);

// Connect to database
connectDB().then(() => {
  console.log('Database connection established');
  
  // In development mode, sync all models with the database
  if (process.env.NODE_ENV === 'development') {
    sequelize.sync({ alter: true }).then(() => {
      console.log('Database synchronized');
    }).catch(err => {
      console.error('Error synchronizing database:', err);
    });
  }
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/users', userRoutes);

// Mount comment routes for both general and post-specific operations
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/posts/:postId/comments', commentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 