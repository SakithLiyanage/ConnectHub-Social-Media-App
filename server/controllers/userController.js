const User = require('../models/User');
const path = require('path');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    
    let updateData = {
      name,
      bio
    };

    // Handle profile image upload if exists
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    // Check if the user exists
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if the user is trying to follow themselves
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are already following this user'
      });
    }

    // Add to following list of current user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });

    // Add to followers list of target user
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    // Check if the user exists
    const userToUnfollow = await User.findById(req.params.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if the user is trying to unfollow themselves
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot unfollow yourself'
      });
    }

    // Check if not following
    if (!userToUnfollow.followers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are not following this user'
      });
    }

    // Remove from following list of current user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });

    // Remove from followers list of target user
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};