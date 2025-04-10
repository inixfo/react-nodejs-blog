const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  searchPosts
} = require('../controllers/post');
const { protect, authorize } = require('../middleware/auth');

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

// Search route should be before the /:id routes to avoid conflict
router.get('/search', searchPosts);

router
  .route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

router
  .route('/:id')
  .get(getPost)
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

router
  .route('/:id/like')
  .put(protect, toggleLike);

module.exports = router; 