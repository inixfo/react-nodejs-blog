const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/v1/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
      status: 'active'
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create comment
// @route   POST /api/v1/posts/:postId/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    req.body.post = req.params.postId;
    req.body.author = req.user.id;

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create(req.body);
    
    // Populate author information
    await comment.populate('author', 'name');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment'
    });
  }
};

// @desc    Update a comment
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user is comment owner or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user owns comment or is admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.remove();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};

// @desc    Like/Unlike a comment
// @route   PUT /api/v1/comments/:id/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if comment has already been liked by user
    const isLiked = comment.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like
      comment.likes.push(req.user.id);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Report a comment
// @route   POST /api/v1/comments/:id/report
// @access  Private
exports.reportComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has already reported this comment
    const hasReported = comment.reports.some(
      report => report.user.toString() === req.user.id
    );

    if (hasReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this comment'
      });
    }

    // Add report
    comment.reports.push({
      user: req.user.id,
      reason: req.body.reason,
      description: req.body.description
    });

    // Update status to reported if it's the first report
    if (comment.reports.length === 1) {
      comment.status = 'reported';
    }

    await comment.save();

    // Populate the report data
    await comment.populate('reports.user', 'name');

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reported comments (admin only)
// @route   GET /api/v1/comments/reported
// @access  Private/Admin
exports.getReportedComments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access reported comments'
      });
    }

    const comments = await Comment.find({ status: 'reported' })
      .populate('author', 'name avatar')
      .populate('reports.user', 'name')
      .sort({ 'reports.createdAt': -1 });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Handle reported comment (admin only)
// @route   PUT /api/v1/comments/:id/handle-report
// @access  Private/Admin
exports.handleReportedComment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to handle reported comments'
      });
    }

    const { action } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (action === 'delete') {
      // Remove comment from post's comments array
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id }
      });
      await comment.remove();
    } else if (action === 'ignore') {
      comment.status = 'active';
      comment.reports = [];
      await comment.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 