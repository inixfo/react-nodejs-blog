const { Post, User, Category, Comment } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Build query
    const whereClause = {};
    if (req.query.author) {
      whereClause.authorId = req.query.author;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'createdAt'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    // Pagination result
    const pagination = {};

    if (offset + posts.length < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (offset > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      pagination,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'createdAt'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    console.log('Received post creation request:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);

    // Validate required fields
    if (!req.body.title || !req.body.content || !req.body.categoryId) {
      console.log('Missing required fields:', {
        title: req.body.title,
        content: req.body.content,
        categoryId: req.body.categoryId
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and category'
      });
    }

    // Set the author and status
    req.body.authorId = req.user.id;
    req.body.status = 'published';

    // Handle image upload
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // Create the post
    const post = await Post.create(req.body);

    // Fetch the post with associations
    const newPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log('Post created successfully:', newPost);

    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    await post.update(req.body);

    // Fetch the updated post with associations
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.destroy();

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

// @desc    Like/unlike a post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const liked = await post.hasLikedBy(req.user.id);

    if (liked) {
      // Unlike
      await post.removeLikedBy(req.user.id);
      res.status(200).json({
        success: true,
        data: { liked: false }
      });
    } else {
      // Like
      await post.addLikedBy(req.user.id);
      res.status(200).json({
        success: true,
        data: { liked: true }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search posts
// @route   GET /api/v1/posts/search
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 