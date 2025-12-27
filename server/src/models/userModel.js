/**
 * User Model
 *
 * Represents users of the WealthWise application.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'WealthWise User'
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true // Allow nulls while maintaining uniqueness for non-nulls
    },
    password: {
      type: String,
      minlength: 6,
      default: null
    },
    avatar: {
      type: String,
      default: ''
    },
    currency: {
      type: String,
      default: 'INR'
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Hash password before saving if it has been modified.
 */
userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare a plain text password with the hashed password.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;