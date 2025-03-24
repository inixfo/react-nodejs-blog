const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  reportComment,
  getReportedComments,
  handleReportedComment
} = require('../controllers/comment');

// Public routes
router.get('/', getComments);

// Protected routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);
router.post('/:id/report', protect, reportComment);

// Admin routes
router.get('/reported', protect, getReportedComments);
router.put('/:id/handle-report', protect, handleReportedComment);

module.exports = router; 