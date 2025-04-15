const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get comments for a post
// @route   GET /api/v1/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: {
        postId: req.params.postId,
        parentCommentId: null,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      ...req.body,
      postId: req.params.postId,
      authorId: req.user.id
    });
    
    // Get author information
    const author = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'avatar']
    });

    res.status(201).json({
      success: true,
      data: { ...comment.toJSON(), author }
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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user is comment owner or admin
    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    await comment.update(req.body);

    // Get updated comment with author info
    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedComment
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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user owns comment or is admin
    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.destroy();

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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Get current likes array
    const likes = comment.likes || [];
    const isLiked = likes.includes(req.user.id);

    // Update likes array
    const updatedLikes = isLiked
      ? likes.filter(id => id !== req.user.id)
      : [...likes, req.user.id];

    await comment.update({ likes: updatedLikes });

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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Get current reports array
    const reports = comment.reports || [];
    const hasReported = reports.some(report => report.userId === req.user.id);

    if (hasReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this comment'
      });
    }

    // Add new report
    const newReport = {
      userId: req.user.id,
      reason: req.body.reason,
      createdAt: new Date()
    };

    await comment.update({
      reports: [...reports, newReport],
      status: reports.length + 1 >= 3 ? 'reported' : comment.status
    });

    res.status(200).json({
      success: true,
      message: 'Comment reported successfully'
    });
  } catch (error) {
    res.status(400).json({
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
    const comments = await Comment.findAll({
      where: {
        status: 'reported'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching reported comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reported comments'
    });
  }
};

// @desc    Handle reported comment (admin only)
// @route   PUT /api/v1/comments/:id/handle-report
// @access  Private/Admin
exports.handleReportedComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Update comment status based on action
    await comment.update({
      status: req.body.action === 'approve' ? 'active' : 'removed',
      reports: [] // Clear reports after handling
    });

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error handling reported comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling reported comment'
    });
  }
}; 