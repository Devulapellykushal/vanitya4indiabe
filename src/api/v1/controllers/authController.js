const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, RLState } = require('../models');
const config = require('../config');
const { asyncHandler } = require('../middleware/errorHandler');
const { registerSchema, loginSchema, resetPasswordSchema } = require('../utils/validation');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { email, name, password, currentLanguage, targetLanguage } = value;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    email,
    name,
    password,
    currentLanguage: currentLanguage || config.get('DEFAULT_SOURCE_LANG'),
    targetLanguage: targetLanguage || config.get('DEFAULT_TARGET_LANG')
  });

  // Initialize RL state for user
  await RLState.initializeForUser(user.id);

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      isAdmin: user.isAdmin
    },
    config.get('JWT_SECRET'),
    { expiresIn: config.get('JWT_EXPIRES_IN') }
  );

  res.status(201).json({
    message: 'User registered successfully',
    user: user.toJSON(),
    token
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { email, password } = value;

  // Find user by email
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  // Update last activity
  await user.updateActivity();

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      isAdmin: user.isAdmin
    },
    config.get('JWT_SECRET'),
    { expiresIn: config.get('JWT_EXPIRES_IN') }
  );

  res.json({
    message: 'Login successful',
    user: user.toJSON(),
    token
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { email } = value;

  // Find user by email
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) {
    // Don't reveal if email exists for security
    return res.json({
      message: 'If the email exists in our system, a reset link has been sent.'
    });
  }

  // In a real application, you would:
  // 1. Generate a secure reset token
  // 2. Save it to the database with expiration
  // 3. Send email with reset link
  // 4. Implement reset confirmation endpoint

  // For now, just return success message
  console.log(`Password reset requested for: ${email}`);
  
  res.json({
    message: 'If the email exists in our system, a reset link has been sent.'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId, {
    include: [{
      association: 'rlState',
      attributes: ['algorithm', 'totalPulls', 'explorationRate']
    }]
  });

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.json({
    user: user.toJSON()
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'currentLanguage', 'targetLanguage', 'prefs'];
  const updates = {};

  // Filter allowed updates
  for (const [key, value] of Object.entries(req.body)) {
    if (allowedUpdates.includes(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'No valid update fields provided'
    });
  }

  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  await user.update(updates);

  res.json({
    message: 'Profile updated successfully',
    user: user.toJSON()
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({
      error: 'User not found or inactive'
    });
  }

  // Generate new JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      isAdmin: user.isAdmin
    },
    config.get('JWT_SECRET'),
    { expiresIn: config.get('JWT_EXPIRES_IN') }
  );

  res.json({
    message: 'Token refreshed successfully',
    token
  });
});

module.exports = {
  register,
  login,
  resetPassword,
  getProfile,
  updateProfile,
  refreshToken
};