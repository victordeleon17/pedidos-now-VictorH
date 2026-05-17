'use strict';

const migrations = [
  {
    table: 'payment_statuses',
    migration: require('./20260508144810-create-payment-statuses')
  },
  {
    table: 'orders_snapshot',
    migration: require('./20260508144819-create-orders-snapshot')
  },
  {
    table: 'order_items_snapshot',
    migration: require('./20260508144844-create-order-items-snapshot')
  },
  {
    table: 'payments',
    migration: require('./20260508145031-create-payments')
  },
  {
    table: 'payment_attempts',
    migration: require('./20260508145035-create-payment-attempts')
  },
  {
    table: 'courier_wallets',
    migration: require('./20260508145039-create-courier-wallets')
  },
  {
    table: 'courier_transactions',
    migration: require('./20260508145043-create-courier-transactions')
  }
];

function normalizeTableName(table) {
  if (typeof table === 'string') return table.toLowerCase();
  return String(table.tableName || table.name || '').toLowerCase();
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingTables = new Set(
      (await queryInterface.showAllTables()).map(normalizeTableName)
    );

    for (const { table, migration } of migrations) {
      if (!existingTables.has(table.toLowerCase())) {
        await migration.up(queryInterface, Sequelize);
        existingTables.add(table.toLowerCase());
      }
    }
  },

  async down() {
    // Intentionally left blank to avoid dropping repaired data by accident.
  }
};
