const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('referral_code')
    .optional()
    .isLength({ min: 8, max: 10 })
    .withMessage('Referral code must be 8-10 characters'),
  // body('wallet_address')
  //   .optional()
  //   .isEthereumAddress()
  //   .withMessage('Please enter a valid wallet address')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const walletValidation = [
  body('wallet_address')
    .isEthereumAddress()
    .withMessage('Please enter a valid wallet address')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], authController.resendVerification);
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], authController.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  ...passwordValidation
], authController.resetPassword);

// Protected routes
router.post('/connect-wallet', authenticateToken, walletValidation, authController.connectWallet);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 