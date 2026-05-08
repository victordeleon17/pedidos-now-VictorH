'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        allowNull: false,
        primaryKey: true
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      result: {
        type: Sequelize.ENUM('SUCCESS', 'FAILED'),
        allowNull: false
      },
      external_reference: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      response_code: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      response_message: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      request_payload: {
        type: Sequelize.JSON,
        allowNull: true
      },
      response_payload: {
        type: Sequelize.JSON,
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('payment_attempts', ['payment_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payment_attempts');
  }
};
