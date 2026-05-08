'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO payment_methods (id, code, name, description, is_active, created_at, updated_at)
      VALUES
        ('11111111-1111-1111-1111-111111111111', 'CASH', 'cash', 'Cash payment to courier', true, NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'CARD_CREDIT', 'card_credit', 'Credit card payment', true, NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'CARD_DEBIT', 'card_debit', 'Debit card payment', true, NOW(), NOW()),
        ('44444444-4444-4444-4444-444444444444', 'COUPON', 'coupon', 'Coupon payment or fully discounted order', true, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        is_active = VALUES(is_active),
        updated_at = NOW();
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('payment_methods', {
      code: ['CASH', 'CARD_CREDIT', 'CARD_DEBIT', 'COUPON']
    });
  }
};
