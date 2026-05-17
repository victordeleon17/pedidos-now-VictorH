const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO wallet_withdrawals
      (id, courier_id, wallet_id, withdrawal_amount, currency_code,
       destination_account_ref, status, external_reference, response_code, response_message,
       requested_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.courier_id,
      data.wallet_id,
      data.withdrawal_amount,
      data.currency_code || "GTQ",
      data.destination_account_ref || null,
      data.status || "PENDING",
      data.external_reference || null,
      data.response_code || null,
      data.response_message || null,
      data.requested_at || new Date(),
      data.completed_at || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM wallet_withdrawals WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
};