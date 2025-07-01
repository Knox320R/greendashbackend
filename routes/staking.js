const express = require('express');
const { body, query } = require('express-validator');
const stakingController = require('../controllers/stakingController');
const { authenticateToken, requireVerification } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createStakingValidation = [
  body('package_id')
    .isInt({ min: 1 })
    .withMessage('Valid package ID is required'),
  body('payment_amount')
    .isFloat({ min: 1 })
    .withMessage('Payment amount must be at least 1 USDT'),
  // body('payment_method')
  //   .optional()
  //   .isIn(['usdt_bep20', 'egd_tokens'])
  //   .withMessage('Invalid payment method')
];

const calculateRewardsValidation = [
  query('package_id')
    .isInt({ min: 1 })
    .withMessage('Valid package ID is required'),
  query('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 USDT')
];

// Public routes (no authentication required)
router.get('/packages', stakingController.getStakingPackages);
router.get('/packages/:id', stakingController.getStakingPackage);
router.get('/calculate-rewards', calculateRewardsValidation, stakingController.calculateStakingRewards);

// Protected routes
router.use(authenticateToken);
router.use(requireVerification);

// Staking operations
router.post('/create', stakingController.createStaking);
router.get('/details/:id', stakingController.getStakingDetails);
router.post('/claim-rewards/:id', stakingController.claimRewards);
router.post('/unlock/:id', stakingController.unlockStaking);

module.exports = router; 