const db = require("../db");

async function createMany(items, executor = db) {
  if (!items || !items.length) return [];

  const sql = `
    INSERT INTO order_items_snapshot (
      id, order_id, product_id, external_product_id, product_name,
      quantity, unit_price, item_discount, item_subtotal, is_combo
    ) VALUES ?
  `;

  const values = items.map((item) => [
    item.id,
    item.order_id,
    item.product_id,
    item.external_product_id || null,
    item.product_name,
    item.quantity,
    item.unit_price,
    item.item_discount || 0,
    item.item_subtotal,
    item.is_combo ? 1 : 0,
  ]);

  await executor.query(sql, [values]);
  return findByOrderId(items[0].order_id, executor);
}

async function findByOrderId(orderId, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM order_items_snapshot
     WHERE order_id = ?
     ORDER BY created_at ASC`,
    [orderId]
  );
  return rows;
}

module.exports = {
  createMany,
  findByOrderId,
};