'use strict';

async function addColumnIfMissing(queryInterface, table, column, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) {
    await queryInterface.addColumn(table, column, definition);
  }
}

async function removeColumnIfExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  if (description[column]) {
    await queryInterface.removeColumn(table, column);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const moneyColumn = {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    };

    for (const column of ['weight_fee', 'weather_traffic_fee', 'insurance_fee', 'priority_fee']) {
      await addColumnIfMissing(queryInterface, 'orders_snapshot', column, moneyColumn);
      await addColumnIfMissing(queryInterface, 'payments', column, moneyColumn);
    }

    await addColumnIfMissing(queryInterface, 'payments', 'card_type', {
      type: Sequelize.STRING(30),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, 'payments', 'card_type');

    for (const column of ['priority_fee', 'insurance_fee', 'weather_traffic_fee', 'weight_fee']) {
      await removeColumnIfExists(queryInterface, 'payments', column);
      await removeColumnIfExists(queryInterface, 'orders_snapshot', column);
    }
  }
};
