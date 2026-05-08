'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        allowNull: false,
        primaryKey: true
      },
      order_snapshot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders_snapshot',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      courier_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      reservation_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      order_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      external_payment_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      idempotency_key: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      payment_method_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payment_methods',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      card_type: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      gross_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      order_total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      coupon_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      net_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
      tip_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      resulting_balance_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_refunded: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency_code: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
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
      settlement_status: {
        type: Sequelize.ENUM('NOT_APPLICABLE', 'PENDING', 'SETTLED', 'OVERDUE'),
        allowNull: false,
        defaultValue: 'NOT_APPLICABLE'
      },
      settlement_due_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      settled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      external_reference: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      payment_gateway: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      request_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      correlation_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      origin_service: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      paid_at: {
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

    await queryInterface.addIndex('payments', ['reservation_id']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['courier_id']);
    await queryInterface.addIndex('payments', ['order_snapshot_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  }
};
