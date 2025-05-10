const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register route
router.post('/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Validation failed: Email or password missing');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate 6-digit PIN code
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    const user = new User({
      email,
      password: hashedPassword,
      emailVerificationCode: pin,
      emailVerificationCodeExpires: pinExpires,
      isVerified: false
    });

    // Save user first
    await user.save();
    console.log('User created successfully:', email);

    // Then send verification code email
    try {
      await emailService.sendVerificationCode(email, pin);
      console.log('Verification code sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification code:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for the verification code.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Xác thực mã PIN
router.post('/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
  if (
    !user.emailVerificationCode ||
    user.emailVerificationCode !== code ||
    !user.emailVerificationCodeExpires ||
    user.emailVerificationCodeExpires < new Date()
  ) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

// Verify email route
router.get('/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    console.log('Verifying email with token:', token);

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate JWT token for automatic login
    const loginToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Email verified successfully for user:', user.email);
    res.json({
      message: 'Email verified successfully',
      token: loginToken,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// Login route
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get profile route
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName || '',
      address: user.address || '',
      isVerified: user.isVerified,
      isEmailVerified: user.isVerified,
      isProfileCompleted: Boolean(user.fullName && user.address),
      hasProfile: Boolean(user.fullName && user.address),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update profile route
router.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    console.log('Cập nhật profile:', { fullName, phone, address });

    // Validate phone number format (optional)
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        phone,
        address,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile sau cập nhật:', user);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Change password route
router.put('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

module.exports = router; 