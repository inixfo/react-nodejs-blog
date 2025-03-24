const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Create report
// @route   POST /api/v1/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { reportedContent, contentType, reason, description } = req.body;

    console.log('Creating report with data:', {
      reportedContent,
      contentType,
      reason,
      description
    });

    // Validate required fields
    if (!reportedContent || !contentType || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate content type
    if (!['Post', 'Comment'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be either Post or Comment'
      });
    }

    // Validate content exists
    let content;
    if (contentType === 'Post') {
      content = await Post.findById(reportedContent);
      console.log('Found post:', content ? 'Yes' : 'No');
    } else if (contentType === 'Comment') {
      content = await Comment.findById(reportedContent);
      console.log('Found comment:', content ? 'Yes' : 'No');
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `${contentType} not found with ID ${reportedContent}`
      });
    }

    // Check if user has already reported this content
    const existingReport = await Report.findOne({
      reporter: req.user.id,
      reportedContent,
      contentType
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedContent,
      contentType,
      reason,
      description
    });

    // Populate reporter information
    await report.populate('reporter', 'name');

    console.log('Report created successfully:', report._id);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// @desc    Get all reports (admin only)
// @route   GET /api/v1/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('reportedContent')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// @desc    Get single report (admin only)
// @route   GET /api/v1/reports/:id
// @access  Private/Admin
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('reportedContent');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update report status (admin only)
// @route   PUT /api/v1/reports/:id
// @access  Private/Admin
exports.updateReportStatus = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = req.body.status;
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
};

// @desc    Delete report (admin only)
// @route   DELETE /api/v1/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.remove();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report'
    });
  }
};

// @desc    Get reports by status (admin only)
// @route   GET /api/v1/reports/status/:status
// @access  Private/Admin
exports.getReportsByStatus = async (req, res) => {
  try {
    const reports = await Report.find({ status: req.params.status })
      .populate('reporter', 'name email')
      .populate('reportedContent')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 