const express = require('express');
const referralController = require('../controllers/referralController');
const { authenticateToken, requireVerification } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and email verification
router.use(authenticateToken);
router.use(requireVerification);

// Referral management
router.get('/my-referral-link', referralController.getReferralLink);
router.get('/my-referrals/:level/:page/:limit', referralController.getReferralNetwork);
router.get('/referral-rewards', referralController.getReferralEarnings);
router.get('/referral-tree', referralController.getReferralStats);

module.exports = router; 