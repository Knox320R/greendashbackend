/**
 * Data Type Validation Utilities
 * Ensures proper handling of data types across all controllers
 */

// Decimal validation and formatting
const validateDecimal = (value, fieldName, min = 0, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must not exceed ${max}`);
  }
  return Number(num.toFixed(8)); // Ensure 8 decimal places for crypto amounts
};

// Integer validation
const validateInteger = (value, fieldName, min = null, max = null) => {
  const num = parseInt(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid integer`);
  }
  if (min !== null && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must not exceed ${max}`);
  }
  return num;
};

// Date validation
const validateDate = (value, fieldName) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }
  return date;
};

// Enum validation
const validateEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
};

// String validation
const validateString = (value, fieldName, minLength = 1, maxLength = null) => {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  if (maxLength !== null && value.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
  return value.trim();
};

// Email validation
const validateEmail = (value, fieldName) => {
  const email = validateString(value, fieldName);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`${fieldName} must be a valid email address`);
  }
  return email.toLowerCase();
};

// Wallet address validation (basic)
const validateWalletAddress = (value, fieldName) => {
  const address = validateString(value, fieldName);
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error(`${fieldName} must be a valid wallet address`);
  }
  return address;
};

// Pagination validation
const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = validateInteger(page, 'page', 1);
  const limitNum = validateInteger(limit, 'limit', 1, maxLimit);
  return { page: pageNum, limit: limitNum, offset: (pageNum - 1) * limitNum };
};

// Decimal arithmetic helpers
const addDecimals = (a, b) => {
  return Number((parseFloat(a || 0) + parseFloat(b || 0)).toFixed(8));
};

const subtractDecimals = (a, b) => {
  return Number((parseFloat(a || 0) - parseFloat(b || 0)).toFixed(8));
};

const multiplyDecimals = (a, b) => {
  return Number((parseFloat(a || 0) * parseFloat(b || 0)).toFixed(8));
};

const divideDecimals = (a, b) => {
  if (parseFloat(b) === 0) {
    throw new Error('Division by zero');
  }
  return Number((parseFloat(a || 0) / parseFloat(b)).toFixed(8));
};

// Sum array of decimals
const sumDecimals = (array, field = null) => {
  return array.reduce((sum, item) => {
    const value = field ? parseFloat(item[field] || 0) : parseFloat(item || 0);
    return Number((sum + value).toFixed(8));
  }, 0);
};

// Format decimal for display
const formatDecimal = (value, decimals = 8) => {
  return Number(parseFloat(value || 0).toFixed(decimals));
};

// Validate transaction types
const TRANSACTION_TYPES = [
  'staking_payment',
  'staking_reward',
  'referral_bonus',
  'network_bonus',
  'universal_bonus',
  'performance_bonus',
  'viral_bonus',
  'token_purchase',
  'token_sale',
  'withdrawal_request',
  'withdrawal_approved',
  'withdrawal_rejected',
  'token_conversion',
  'fee_collection',
  'refund'
];

// Validate staking status
const STAKING_STATUSES = ['active', 'completed', 'cancelled', 'paused'];

// Validate payment methods
const PAYMENT_METHODS = ['usdt_bep20', 'egd_tokens'];

// Validate withdrawal status
const WITHDRAWAL_STATUSES = ['pending', 'approved', 'rejected', 'processing', 'completed'];

// Validate transaction status
const TRANSACTION_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'processing'];

module.exports = {
  validateDecimal,
  validateInteger,
  validateDate,
  validateEnum,
  validateString,
  validateEmail,
  validateWalletAddress,
  validatePagination,
  addDecimals,
  subtractDecimals,
  multiplyDecimals,
  divideDecimals,
  sumDecimals,
  formatDecimal,
  TRANSACTION_TYPES,
  STAKING_STATUSES,
  PAYMENT_METHODS,
  WITHDRAWAL_STATUSES,
  TRANSACTION_STATUSES
}; 