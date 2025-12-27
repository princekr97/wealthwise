/**
 * Auth Routes
 *
 * Routes for user registration, login, and profile actions.
 */

import express from 'express';
import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

export default router;