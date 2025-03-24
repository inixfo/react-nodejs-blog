const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  deleteReport,
  getReportsByStatus
} = require('../controllers/report');

// Public routes
router.post('/', protect, createReport);

// Admin routes
router.get('/', protect, authorize('admin'), getReports);
router.get('/status/:status', protect, authorize('admin'), getReportsByStatus);
router.get('/:id', protect, authorize('admin'), getReport);
router.put('/:id', protect, authorize('admin'), updateReportStatus);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router; 