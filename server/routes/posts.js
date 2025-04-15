const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  getPosts,
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Set up storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts');
  },
  filename: (req, file, cb) => {
    cb(null, `post-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

const router = express.Router();

// Get all posts
router.get('/', getPosts);

// Get feed (posts from users the current user follows)
router.get('/feed', protect, getFeed);

// Get single post
router.get('/:id', getPost);

// Create new post
router.post('/', protect, upload.single('image'), createPost);

// Update post
router.put('/:id', protect, updatePost);

// Delete post
router.delete('/:id', protect, deletePost);

// Like a post
router.put('/like/:id', protect, likePost);

// Unlike a post
router.put('/unlike/:id', protect, unlikePost);

// Add comment to a post
router.post('/comment/:id', protect, addComment);

// Delete comment from a post
router.delete('/comment/:id/:comment_id', protect, deleteComment);

module.exports = router;