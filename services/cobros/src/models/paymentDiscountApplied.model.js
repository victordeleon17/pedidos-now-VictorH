const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO payment_discounts_applied
      (id, payment_id, type, code, description, amount, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.payment_id,
      data.type || "COUPON",
      data.code || null,
      data.description || null,
      data.amount || 0,
      data.source || null,
    ]
  );

  return findByPaymentId(data.payment_id, executor);
}

async function findByPaymentId(paymentId, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM payment_discounts_applied
     WHERE payment_id = ?
     ORDER BY created_at ASC`,
    [paymentId]
  );
  return rows;
}

module.exports = {
  create,
  findByPaymentId,
};