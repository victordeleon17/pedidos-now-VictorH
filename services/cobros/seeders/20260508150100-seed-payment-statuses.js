'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO payment_statuses (id, code, description, is_active, created_at, updated_at)
      VALUES
        ('aaaaaaaa-1111-1111-1111-111111111111', 'PENDING', 'Payment is pending processing', true, NOW(), NOW()),
        ('aaaaaaaa-2222-2222-2222-222222222222', 'PROCESSING', 'Payment is being processed', true, NOW(), NOW()),
        ('aaaaaaaa-3333-3333-3333-333333333333', 'APPROVED', 'Payment was approved', true, NOW(), NOW()),
        ('aaaaaaaa-4444-4444-4444-444444444444', 'DENIED', 'Payment was denied', true, NOW(), NOW()),
        ('aaaaaaaa-5555-5555-5555-555555555555', 'CANCELLED', 'Payment was cancelled', true, NOW(), NOW()),
        ('aaaaaaaa-6666-6666-6666-666666666666', 'PARTIALLY_REFUNDED', 'Payment was partially refunded', true, NOW(), NOW()),
        ('aaaaaaaa-7777-7777-7777-777777777777', 'REFUNDED', 'Payment was fully refunded', true, NOW(), NOW())
      ON CONFLICT (code) DO UPDATE SET
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('payment_statuses', {
      code: [
        'PENDING',
        'PROCESSING',
        'APPROVED',
        'DENIED',
        'CANCELLED',
        'PARTIALLY_REFUNDED',
        'REFUNDED'
      ]
    });
  }
};
