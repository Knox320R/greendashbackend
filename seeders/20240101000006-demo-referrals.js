'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const referrals = [
      // Level 1 Referrals (Direct referrals from Admin)
      {
        referrer_id: 1, // Admin
        referred_id: 3, // John Doe
        level: 1,
        is_active: true,
        total_earned: 8000.00000000,
        total_invested: 75000.00000000,
        total_staked: 75000.00000000,
        direct_cashback_paid: 6000.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-03'),
        first_investment_at: new Date('2024-01-03'),
        first_staking_at: new Date('2024-01-03'),
        referral_path: '1',
        commission_rate: 0.0500,
        is_qualified: true,
        qualification_date: new Date('2024-01-03'),
        notes: null,
        created_at: new Date('2024-01-03'),
        updated_at: new Date()
      },
      {
        referrer_id: 1, // Admin
        referred_id: 4, // Sarah Wilson
        level: 1,
        is_active: true,
        total_earned: 6000.00000000,
        total_invested: 60000.00000000,
        total_staked: 60000.00000000,
        direct_cashback_paid: 4500.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-04'),
        first_investment_at: new Date('2024-01-04'),
        first_staking_at: new Date('2024-01-04'),
        referral_path: '1',
        commission_rate: 0.0500,
        is_qualified: true,
        qualification_date: new Date('2024-01-04'),
        notes: null,
        created_at: new Date('2024-01-04'),
        updated_at: new Date()
      },

      // Level 2 Referrals (John Doe's referrals)
      {
        referrer_id: 3, // John Doe
        referred_id: 5, // Mike Chen
        level: 2,
        is_active: true,
        total_earned: 3000.00000000,
        total_invested: 45000.00000000,
        total_staked: 45000.00000000,
        direct_cashback_paid: 2250.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-05'),
        first_investment_at: new Date('2024-01-05'),
        first_staking_at: new Date('2024-01-05'),
        referral_path: '1-3',
        commission_rate: 0.0300,
        is_qualified: true,
        qualification_date: new Date('2024-01-05'),
        notes: null,
        created_at: new Date('2024-01-05'),
        updated_at: new Date()
      },
      {
        referrer_id: 3, // John Doe
        referred_id: 17, // Thomas Anderson
        level: 2,
        is_active: true,
        total_earned: 0.00000000,
        total_invested: 0.00000000,
        total_staked: 0.00000000,
        direct_cashback_paid: 0.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-20'),
        first_investment_at: null,
        first_staking_at: null,
        referral_path: '1-3',
        commission_rate: 0.0300,
        is_qualified: false,
        qualification_date: null,
        notes: null,
        created_at: new Date('2024-01-20'),
        updated_at: new Date()
      },

      // Level 2 Referrals (Sarah Wilson's referrals)
      {
        referrer_id: 4, // Sarah Wilson
        referred_id: 6, // Emma Rodriguez
        level: 2,
        is_active: true,
        total_earned: 2000.00000000,
        total_invested: 35000.00000000,
        total_staked: 35000.00000000,
        direct_cashback_paid: 1500.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-06'),
        first_investment_at: new Date('2024-01-06'),
        first_staking_at: new Date('2024-01-06'),
        referral_path: '1-4',
        commission_rate: 0.0300,
        is_qualified: true,
        qualification_date: new Date('2024-01-06'),
        notes: null,
        created_at: new Date('2024-01-06'),
        updated_at: new Date()
      },
      {
        referrer_id: 4, // Sarah Wilson
        referred_id: 18, // Nina Petrov
        level: 2,
        is_active: true,
        total_earned: 0.00000000,
        total_invested: 0.00000000,
        total_staked: 0.00000000,
        direct_cashback_paid: 0.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-21'),
        joined_at: new Date('2024-01-21'),
        first_investment_at: null,
        first_staking_at: null,
        referral_path: '1-4',
        commission_rate: 0.0300,
        is_qualified: false,
        qualification_date: null,
        notes: null,
        created_at: new Date('2024-01-21'),
        updated_at: new Date()
      },

      // Level 3 Referrals (Mike Chen's referrals)
      {
        referrer_id: 5, // Mike Chen
        referred_id: 7, // David Kim
        level: 3,
        is_active: true,
        total_earned: 1500.00000000,
        total_invested: 25000.00000000,
        total_staked: 25000.00000000,
        direct_cashback_paid: 1125.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-07'),
        first_investment_at: new Date('2024-01-07'),
        first_staking_at: new Date('2024-01-07'),
        referral_path: '1-3-5',
        commission_rate: 0.0200,
        is_qualified: true,
        qualification_date: new Date('2024-01-07'),
        notes: null,
        created_at: new Date('2024-01-07'),
        updated_at: new Date()
      },
      {
        referrer_id: 5, // Mike Chen
        referred_id: 19, // Carlos Mendez
        level: 3,
        is_active: true,
        total_earned: 0.00000000,
        total_invested: 0.00000000,
        total_staked: 0.00000000,
        direct_cashback_paid: 0.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-22'),
        joined_at: new Date('2024-01-22'),
        first_investment_at: null,
        first_staking_at: null,
        referral_path: '1-3-5',
        commission_rate: 0.0200,
        is_qualified: false,
        qualification_date: null,
        notes: null,
        created_at: new Date('2024-01-22'),
        updated_at: new Date()
      },

      // Level 3 Referrals (Emma Rodriguez's referrals)
      {
        referrer_id: 6, // Emma Rodriguez
        referred_id: 8, // Lisa Thompson
        level: 3,
        is_active: true,
        total_earned: 1000.00000000,
        total_invested: 20000.00000000,
        total_staked: 20000.00000000,
        direct_cashback_paid: 750.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-08'),
        first_investment_at: new Date('2024-01-08'),
        first_staking_at: new Date('2024-01-08'),
        referral_path: '1-4-6',
        commission_rate: 0.0200,
        is_qualified: true,
        qualification_date: new Date('2024-01-08'),
        notes: null,
        created_at: new Date('2024-01-08'),
        updated_at: new Date()
      },

      // Level 4 Referrals (David Kim's referrals)
      {
        referrer_id: 7, // David Kim
        referred_id: 9, // Alex Martinez
        level: 4,
        is_active: true,
        total_earned: 800.00000000,
        total_invested: 15000.00000000,
        total_staked: 15000.00000000,
        direct_cashback_paid: 600.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-09'),
        first_investment_at: new Date('2024-01-09'),
        first_staking_at: new Date('2024-01-09'),
        referral_path: '1-3-5-7',
        commission_rate: 0.0150,
        is_qualified: true,
        qualification_date: new Date('2024-01-09'),
        notes: null,
        created_at: new Date('2024-01-09'),
        updated_at: new Date()
      },

      // Level 4 Referrals (Lisa Thompson's referrals)
      {
        referrer_id: 8, // Lisa Thompson
        referred_id: 10, // Sophie Brown
        level: 4,
        is_active: true,
        total_earned: 600.00000000,
        total_invested: 12000.00000000,
        total_staked: 12000.00000000,
        direct_cashback_paid: 450.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-10'),
        first_investment_at: new Date('2024-01-10'),
        first_staking_at: new Date('2024-01-10'),
        referral_path: '1-4-6-8',
        commission_rate: 0.0150,
        is_qualified: true,
        qualification_date: new Date('2024-01-10'),
        notes: null,
        created_at: new Date('2024-01-10'),
        updated_at: new Date()
      },

      // Level 5 Referrals (Alex Martinez's referrals)
      {
        referrer_id: 9, // Alex Martinez
        referred_id: 11, // James Lee
        level: 5,
        is_active: true,
        total_earned: 400.00000000,
        total_invested: 8000.00000000,
        total_staked: 8000.00000000,
        direct_cashback_paid: 300.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-11'),
        first_investment_at: new Date('2024-01-11'),
        first_staking_at: new Date('2024-01-11'),
        referral_path: '1-3-5-7-9',
        commission_rate: 0.0100,
        is_qualified: true,
        qualification_date: new Date('2024-01-11'),
        notes: null,
        created_at: new Date('2024-01-11'),
        updated_at: new Date()
      },

      // Level 5 Referrals (Sophie Brown's referrals)
      {
        referrer_id: 10, // Sophie Brown
        referred_id: 12, // Anna Garcia
        level: 5,
        is_active: true,
        total_earned: 300.00000000,
        total_invested: 6000.00000000,
        total_staked: 6000.00000000,
        direct_cashback_paid: 225.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-12'),
        first_investment_at: new Date('2024-01-12'),
        first_staking_at: new Date('2024-01-12'),
        referral_path: '1-4-6-8-10',
        commission_rate: 0.0100,
        is_qualified: true,
        qualification_date: new Date('2024-01-12'),
        notes: null,
        created_at: new Date('2024-01-12'),
        updated_at: new Date()
      },

      // Level 6 Referrals (James Lee's referrals)
      {
        referrer_id: 11, // James Lee
        referred_id: 13, // Robert Smith
        level: 6,
        is_active: true,
        total_earned: 200.00000000,
        total_invested: 4000.00000000,
        total_staked: 4000.00000000,
        direct_cashback_paid: 150.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-13'),
        first_investment_at: new Date('2024-01-13'),
        first_staking_at: new Date('2024-01-13'),
        referral_path: '1-3-5-7-9-11',
        commission_rate: 0.0050,
        is_qualified: true,
        qualification_date: new Date('2024-01-13'),
        notes: null,
        created_at: new Date('2024-01-13'),
        updated_at: new Date()
      },

      // Level 6 Referrals (Anna Garcia's referrals)
      {
        referrer_id: 12, // Anna Garcia
        referred_id: 14, // Maria Silva
        level: 6,
        is_active: true,
        total_earned: 150.00000000,
        total_invested: 3000.00000000,
        total_staked: 3000.00000000,
        direct_cashback_paid: 112.50000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-14'),
        first_investment_at: new Date('2024-01-14'),
        first_staking_at: new Date('2024-01-14'),
        referral_path: '1-4-6-8-10-12',
        commission_rate: 0.0050,
        is_qualified: true,
        qualification_date: new Date('2024-01-14'),
        notes: null,
        created_at: new Date('2024-01-14'),
        updated_at: new Date()
      },

      // Level 7 Referrals (Robert Smith's referrals)
      {
        referrer_id: 13, // Robert Smith
        referred_id: 15, // Michael Johnson
        level: 7,
        is_active: true,
        total_earned: 100.00000000,
        total_invested: 2000.00000000,
        total_staked: 2000.00000000,
        direct_cashback_paid: 75.00000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-15'),
        first_investment_at: new Date('2024-01-15'),
        first_staking_at: new Date('2024-01-15'),
        referral_path: '1-3-5-7-9-11-13',
        commission_rate: 0.0025,
        is_qualified: true,
        qualification_date: new Date('2024-01-15'),
        notes: null,
        created_at: new Date('2024-01-15'),
        updated_at: new Date()
      },

      // Level 7 Referrals (Maria Silva's referrals)
      {
        referrer_id: 14, // Maria Silva
        referred_id: 16, // Jennifer Davis
        level: 7,
        is_active: true,
        total_earned: 75.00000000,
        total_invested: 1500.00000000,
        total_staked: 1500.00000000,
        direct_cashback_paid: 56.25000000,
        network_cashback_paid: 0.00000000,
        last_activity: new Date('2024-01-20'),
        joined_at: new Date('2024-01-16'),
        first_investment_at: new Date('2024-01-16'),
        first_staking_at: new Date('2024-01-16'),
        referral_path: '1-4-6-8-10-12-14',
        commission_rate: 0.0025,
        is_qualified: true,
        qualification_date: new Date('2024-01-16'),
        notes: null,
        created_at: new Date('2024-01-16'),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('referrals', referrals, {});
    
    console.log('✅ Demo referrals created successfully!');
    console.log('📊 Created 18 referral records');
    console.log('🔗 Complete 7-level MLM structure');
    console.log('💰 Realistic commission percentages');
    console.log('📈 Various earning levels and statuses');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('referrals', null, {});
  }
}; 