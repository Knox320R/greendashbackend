'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const admin_settings = [
      // admin_settings
      {
        id: 1,
        title: 'token_price',
        description: 'GreenDash',
        value: '0.01',
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
      {
        id: 2,
        title: 'platform_wallet_address',
        description: 'GreenDash',
        value: 'true',
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
      {
        id: 3,
        title: 'auto_unlock',
        description: 'GreenDash',
        value: 'true',
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
    ];

    await queryInterface.bulkInsert('admin_settings', admin_settings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('admin_settings', null, {});
  }
}; 