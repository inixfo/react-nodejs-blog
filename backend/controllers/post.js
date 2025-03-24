const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query
    const query = {};
    if (req.query.author) {
      query.author = req.query.author;
    }

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('author', 'name')
      .populate('category', 'name')
      .populate({
        path: 'comments',
        select: 'content author createdAt',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
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
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate({
        path: 'comments',
        select: 'content author createdAt',
        populate: {
          path: 'author',
          select: 'name'
        }
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
    if (!req.body.title || !req.body.content || !req.body.category) {
      console.log('Missing required fields:', {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and category'
      });
    }

    // Set the author and status
    req.body.author = req.user.id;
    req.body.status = 'published';

    // Handle image upload
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // Create the post
    const post = await Post.create(req.body);

    // Populate the category and author fields
    await post.populate([
      { path: 'category', select: 'name' },
      { path: 'author', select: 'name' }
    ]);

    console.log('Post created successfully:', post);

    res.status(201).json({
      success: true,
      data: post
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
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.remove();

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

// @desc    Like/Unlike post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post has already been liked by user
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

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

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      status: 'published'
    })
      .populate('author', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 