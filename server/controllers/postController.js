const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    let newPost = {
      text,
      user: req.user.id,
    };

    // Add image if uploaded
    if (req.file) {
      newPost.image = req.file.filename;
    }

    const post = await Post.create(newPost);

    // Populate user data
    const populatedPost = await Post.findById(post._id).populate('user', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts from users being followed
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = async (req, res, next) => {
  try {
    // Get current user
    const user = await User.findById(req.user.id);
    
    // Get all posts from users being followed and the user's own posts
    const posts = await Post.find({
      $or: [
        { user: { $in: user.following } },
        { user: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    // Update post
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true, runValidators: true }
    )
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    // Delete image file if exists
    if (post.image) {
      const imagePath = path.join(__dirname, '../../uploads/posts', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Use deleteOne instead of remove (which is deprecated)
    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a post
// @route   PUT /api/posts/like/:id
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if the post has already been liked by the user
    if (post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Post already liked'
      });
    }

    post.likes.unshift(req.user.id);
    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/unlike/:id
// @access  Private
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if the post has not been liked by the user
    if (!post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Post has not yet been liked'
      });
    }

    // Remove the like
    post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/comment/:id
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const user = await User.findById(req.user.id).select('name profileImage');

    const newComment = {
      text: req.body.text,
      name: user.name,
      profileImage: user.profileImage,
      user: req.user.id
    };

    post.comments.unshift(newComment);
    await post.save();

    res.status(200).json({
      success: true,
      data: post.comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/comment/:id/:comment_id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment does not exist'
      });
    }

    // Check user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete comment'
      });
    }

    // Remove comment
    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    res.status(200).json({
      success: true,
      data: post.comments
    });
  } catch (error) {
    next(error);
  }
};