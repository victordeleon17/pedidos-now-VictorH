const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO wallet_settlements
      (id, courier_id, payment_id, courier_transaction_id, order_id, settlement_amount,
       currency_code, status, source_method_ref, external_reference,
       response_code, response_message, request_id, correlation_id, origin_service, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.courier_id,
      data.payment_id,
      data.courier_transaction_id,
      data.order_id || null,
      data.settlement_amount,
      data.currency_code || "GTQ",
      data.status || "PENDING",
      data.source_method_ref || null,
      data.external_reference || null,
      data.response_code || null,
      data.response_message || null,
      data.request_id || null,
      data.correlation_id || null,
      data.origin_service || null,
      data.paid_at || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM wallet_settlements WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
};