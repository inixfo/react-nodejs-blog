const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser
} = require('../controllers/user');

// Public routes
router.get('/:id', getUser);

// Protected routes (user can update their own profile)
router.put('/:id', protect, updateUser);

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 