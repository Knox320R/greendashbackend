# GreenDash Backend

A Node.js backend for the GreenDash Sustainable Mobility Platform with staking, referral, and payment features.

## Features

- 🔐 JWT Authentication
- 💰 Staking Management
- 👥 Referral System
- 💳 Payment Processing
- 📧 Email Notifications
- 🔒 Security Features (Rate Limiting, Helmet, CORS)
- 🗄️ MySQL Database with Sequelize ORM
- 📊 Admin Dashboard API

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials and other configurations.

4. **Database Setup**
   ```bash
   npm run setup-db
   ```
   
   This will:
   - Create the database if it doesn't exist
   - Run all migrations
   - Seed the database with initial data

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=greendash_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_email@example.com

# USDT BEP-20 Configuration
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BINANCE_WALLET_ADDRESS=your_binance_wallet_address

# Token Configuration
EGD_TOKEN_PRICE=0.01
TOTAL_SUPPLY=1000000000

# Staking Configuration
MIN_STAKE_AMOUNT=100
MAX_STAKE_AMOUNT=100000
STAKE_LOCK_PERIOD=365

# Fee Configuration
PLATFORM_FEE_PERCENTAGE=10
REFERRAL_FEE_PERCENTAGE=5

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run setup-db` - Complete database setup (create, migrate, seed)
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders
- `npm run db:reset` - Reset database (undo all, migrate, seed)
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Staking
- `GET /api/staking/packages` - Get staking packages
- `POST /api/staking/stake` - Create new stake
- `GET /api/staking/my-stakes` - Get user stakes
- `POST /api/staking/withdraw` - Withdraw from stake

### Referrals
- `GET /api/referrals/my-referrals` - Get user referrals
- `GET /api/referrals/earnings` - Get referral earnings

### Payments
- `POST /api/payments/deposit` - Process deposit
- `POST /api/payments/withdraw` - Process withdrawal
- `GET /api/payments/history` - Get payment history

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stakes` - Get all stakes
- `GET /api/admin/transactions` - Get all transactions
- `POST /api/admin/update-user` - Update user status

## Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `staking_packages` - Available staking packages
- `stakings` - User staking records
- `transactions` - Financial transactions
- `withdrawals` - Withdrawal requests
- `referrals` - Referral relationships

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with express-validator
- SQL injection protection via Sequelize

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── migrations/      # Database migrations
├── models/          # Sequelize models
├── routes/          # API routes
├── seeders/         # Database seeders
├── utils/           # Utility functions
└── server.js        # Main server file
```

### Adding New Features

1. Create model in `models/`
2. Create migration in `migrations/`
3. Create controller in `controllers/`
4. Add routes in `routes/`
5. Update seeders if needed

## Testing

```bash
npm test
```

## Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set up SSL certificates
4. Use PM2 or similar process manager
5. Configure reverse proxy (nginx)

## License

MIT License 