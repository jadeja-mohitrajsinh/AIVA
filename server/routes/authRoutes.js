/*=================================================================
* Project: AIVA-WEB
* File: authRoutes.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Authentication routes handling user registration, login, password reset,
* and profile management endpoints.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import {
  register,
  verifyOTP,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { emailService } from '../utils/emailService.js';

const router = express.Router();

// Test route for email service
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        status: false, 
        message: 'Email is required' 
      });
    }

    // Test verification email
    await emailService.sendVerificationEmail(email, '123456');
    
    res.json({ 
      status: true, 
      message: 'Test email sent successfully. Check console for mock email output.' 
    });
  } catch (error) {

    //
    // console.error('Test email error:', error);

    res.status(500).json({ 
      status: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

// Auth routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password-request', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

export default router; 