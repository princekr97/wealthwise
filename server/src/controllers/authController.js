/**
 * Authentication Controller
 *
 * Handles user registration, login, and profile management.
 */

import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/userModel.js';
import { linkShadowMembersToUser } from '../services/shadowUserService.js';

/**
 * Generate a JWT token for a given user ID.
 * @param {string} userId
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).allow('', null)
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required()
});

/**
 * POST /api/auth/register
 * Register a new user.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { name, email, password, phoneNumber } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error('User with this email already exists');
    }

    // Check if phone number is already registered by someone else
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        res.status(409);
        throw new Error('Phone number is already associated with another account');
      }
    }

    const user = await User.create({ name, email, password, phoneNumber });

    //  **NEW: Auto-link shadow members**
    // Find and link any groups where this user was added before registration
    const linkingResult = await linkShadowMembersToUser(user);

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currency: user.currency,
        avatar: user.avatar
      },
      // Include linking info to show user which groups they were added to
      shadowUserLinking: {
        groupsLinked: linkingResult.linkedGroupsCount,
        groupNames: linkingResult.groupNames,
        message: linkingResult.message
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
export const loginUser = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { identifier, password } = value;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currency: user.currency,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile
 * Get logged in user's profile.
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Update logged in user's profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      currency: req.body.currency,
      avatar: req.body.avatar
    };

    // Allow email/phone to be added only if they don't exist
    const user = await User.findById(req.user.id);
    if (!user.email && req.body.email) {
      // Check if email already exists
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) {
        res.status(409);
        throw new Error('Email already in use');
      }
      updates.email = req.body.email;
    }
    if (!user.phoneNumber && req.body.phoneNumber) {
      // Check if phone already exists
      const existingPhone = await User.findOne({ phoneNumber: req.body.phoneNumber });
      if (existingPhone) {
        res.status(409);
        throw new Error('Phone number already in use');
      }
      updates.phoneNumber = req.body.phoneNumber;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Schema for phone number validation
const phoneSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be exactly 10 digits'
  })
});

// Schema for OTP verification
const otpSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otp: Joi.string().length(6).required()
});

/**
 * POST /api/auth/send-otp
 * Send a 6-digit OTP to the provided phone number.
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { error, value } = phoneSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { phoneNumber } = value;

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Find user by phone number or create a new one (Social-style auto-register)
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Auto-create user for brand new phone numbers
      user = await User.create({
        phoneNumber,
        name: `User ${phoneNumber.slice(-4)}` // Default name with last 4 digits
      });
    }

    // Update user with OTP
    user.otp = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // MOCK: In a real app, send SMS here via Twilio/Msg91
    console.log(`[AUTH] OTP for ${phoneNumber}: ${otpCode}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      debugOtp: otpCode // Exposed for dev popup
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify the OTP and login the user.
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { error, value } = otpSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { phoneNumber, otp } = value;

    const user = await User.findOne({
      phoneNumber,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(401);
      throw new Error('Invalid or expired OTP');
    }

    // Clear OTP after successful verify
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currency: user.currency,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Request a password reset.
 */
/**
 * POST /api/auth/forgot-password
 * Request a password reset.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });

    if (!user) {
      res.status(404);
      throw new Error('No account found with this email or phone number.');
    }

    // Generate mock token (simple string for now, hash it in prod)
    const resetToken = Math.random().toString(36).substring(2, 15);

    // Store token in DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Log for dev
    console.log(`[AUTH] Reset Link for ${identifier}: ${resetLink}`);

    // In production, you would send this via email and NOT return it in the response
    // But for this dev/demo environment, we return it to help the user test flow.
    res.json({
      success: true,
      message: 'Password reset link sent (Check console or use debug link)',
      debugLink: resetLink
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using the token.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // In a real app, we would hash the token and compare with DB
    // For this MVP/Dev environment, since we just generated a random string and didn't store it 
    // strictly associated with the user in my previous edit, we need a way to find the user.
    // To make this work seamlessly with the current "Mock" flow where we don't send emails:
    // We will look for a user who has this specific reset token active.

    // Note: I need to update the User model to actually store this token for this to work securely.
    // See next step for User model update.

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/auth/delete-account
 * Permanently delete the user account.
 */
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};