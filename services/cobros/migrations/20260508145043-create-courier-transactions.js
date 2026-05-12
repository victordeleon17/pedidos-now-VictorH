'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courier_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      courier_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      order_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      order_snapshot_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders_snapshot',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('CREDIT', 'DEBIT'),
        allowNull: false
      },
      transaction_category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payment_method_code: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      order_total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      courier_earned_fee: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      previous_balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      new_balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      resulting_signed_balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      settlement_status: {
        type: Sequelize.ENUM('NOT_APPLICABLE', 'PENDING', 'SETTLED', 'OVERDUE'),
        allowNull: false,
        defaultValue: 'NOT_APPLICABLE'
      },
      due_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      settled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      can_pay_pending: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      external_bank_reference: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('courier_transactions', ['courier_id']);
    await queryInterface.addIndex('courier_transactions', ['payment_id']);
    await queryInterface.addIndex('courier_transactions', ['order_id']);
    await queryInterface.addIndex('courier_transactions', ['settlement_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courier_transactions');
  }
};
