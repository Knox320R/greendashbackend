const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const stakingRoutes = require('./staking');
const adminRoutes = require('./admin');
const paymentRoutes = require('./payments');
const referralRoutes = require('./referrals');

const router = express.Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/staking`, stakingRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);
router.use(`${API_PREFIX}/payments`, paymentRoutes);
router.use(`${API_PREFIX}/referrals`, referralRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GreenDash API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    availableRoutes: [
      `${API_PREFIX}/auth`,
      `${API_PREFIX}/users`,
      `${API_PREFIX}/staking`,
      `${API_PREFIX}/admin`,
      `${API_PREFIX}/payments`,
      `${API_PREFIX}/referrals`
    ]
  });
});

module.exports = router; 