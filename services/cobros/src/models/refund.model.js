const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO refunds
      (id, payment_id, order_id, external_payment_id, refund_amount, currency_code,
       status, external_reference, reason, request_id, correlation_id, origin_service)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.payment_id,
      data.order_id || null,
      data.external_payment_id || null,
      data.refund_amount,
      data.currency_code || "GTQ",
      data.status || "PENDING",
      data.external_reference || null,
      data.reason || null,
      data.request_id || null,
      data.correlation_id || null,
      data.origin_service || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM refunds WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
};