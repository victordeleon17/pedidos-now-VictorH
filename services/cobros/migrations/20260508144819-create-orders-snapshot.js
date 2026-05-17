'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders_snapshot', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      courier_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      delivery_address_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      reservation_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      order_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      product_discounts: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      coupon_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      service_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      weight_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      weather_traffic_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      insurance_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      priority_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      courier_earned_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      approved_extra_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tip_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency_code: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
      },
      final_payment_method_code: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      status_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payment_statuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('orders_snapshot', ['reservation_id']);
    await queryInterface.addIndex('orders_snapshot', ['order_id']);
    await queryInterface.addIndex('orders_snapshot', ['courier_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders_snapshot');
  }
};
