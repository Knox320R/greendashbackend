const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX || 100), // 100 requests per windowMs default
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
// app.use(cors());
app.use(cors({
  // origin: process.env.NODE_ENV === 'production' 
  //   ? ['https://greendash.io', 'https://www.greendash.io']
  //   : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  // credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Mount all routes
app.use(routes);

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (in development) - use safe sync
    if (process.env.NODE_ENV === 'development') {
      try {
        await sequelize.sync({ force: false, alter: false });
        console.log('✅ Database synchronized.');
      } catch (syncError) {
        console.log('⚠️ Database sync failed, continuing with existing schema...');
        console.log('Error details:', syncError.message);
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 GreenDash Backend server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
      console.log(`⏰ Server started at: ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 