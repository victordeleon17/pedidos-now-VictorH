const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO wallet_adjustments
      (id, courier_id, payment_id, order_id, adjustment_type, amount, currency_code,
       reason, authorized_by_service, request_id, correlation_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.courier_id,
      data.payment_id || null,
      data.order_id || null,
      data.adjustment_type,
      data.amount,
      data.currency_code || "GTQ",
      data.reason || null,
      data.authorized_by_service || null,
      data.request_id || null,
      data.correlation_id || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM wallet_adjustments WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
};