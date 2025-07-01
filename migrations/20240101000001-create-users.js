'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      wallet_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      referral_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      referred_by: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      referral_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      egd_balance: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0
      },
      usdt_balance: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0
      },
      total_invested: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0
      },
      total_earned: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0
      },
      total_withdrawn: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reset_password_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      reset_password_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'UTC'
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'en'
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      two_factor_secret: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['wallet_address']);
    await queryInterface.addIndex('users', ['referral_code']);
    await queryInterface.addIndex('users', ['referred_by']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['is_admin']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
}; 