'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const packages = [
      {
        name: 'Green Starter',
        description: 'Perfect for beginners. Start your staking journey with this affordable package.',
        min_stake_amount: 100.00000000,
        max_stake_amount: 999.00000000,
        daily_yield_percentage: 0.0500,
        lock_period_days: 365,
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Eco Growth',
        description: 'Balanced returns for moderate investors. Great value for money.',
        min_stake_amount: 1000.00000000,
        max_stake_amount: 4999.00000000,
        daily_yield_percentage: 0.0750,
        lock_period_days: 365,
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sustainable Elite',
        description: 'Premium package for serious investors. Higher returns with longer commitment.',
        min_stake_amount: 5000.00000000,
        max_stake_amount: 19999.00000000,
        daily_yield_percentage: 0.1000,
        lock_period_days: 365,
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Green Elite',
        description: 'Ultimate staking package for high-net-worth investors.',
        min_stake_amount: 20000.00000000,
        max_stake_amount: 100000.00000000,
        daily_yield_percentage: 0.1250,
        lock_period_days: 365,
        is_active: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'VIP Diamond',
        description: 'Exclusive VIP package with maximum returns and premium benefits.',
        min_stake_amount: 100000.00000000,
        max_stake_amount: 1000000.00000000,
        daily_yield_percentage: 0.1500,
        lock_period_days: 365,
        is_active: true,
        sort_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('staking_packages', packages, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('staking_packages', null, {});
  }
}; 