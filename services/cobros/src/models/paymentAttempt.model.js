const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO payment_attempts (
      id, payment_id, result, external_reference, response_code, response_message,
      request_payload, response_payload, request_id, correlation_id, origin_service
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.payment_id,
      data.result,
      data.external_reference || null,
      data.response_code || null,
      data.response_message || null,
      data.request_payload ? JSON.stringify(data.request_payload) : null,
      data.response_payload ? JSON.stringify(data.response_payload) : null,
      data.request_id || null,
      data.correlation_id || null,
      data.origin_service || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM payment_attempts WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function listByPaymentId(paymentId, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM payment_attempts
     WHERE payment_id = ?
     ORDER BY created_at DESC`,
    [paymentId]
  );
  return rows;
}

module.exports = {
  create,
  findById,
  listByPaymentId,
};