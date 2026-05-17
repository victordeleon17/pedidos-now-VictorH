const db = require("../db");

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO courier_transactions
      (id, courier_id, payment_id, order_id, order_snapshot_id, type, transaction_category,
       payment_method_code, amount, order_total_amount, courier_earned_fee,
       previous_balance, new_balance, resulting_signed_balance,
       settlement_status, due_at, settled_at, can_pay_pending,
       external_bank_reference, description, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.courier_id,
      data.payment_id,
      data.order_id || null,
      data.order_snapshot_id || null,
      data.type,
      data.transaction_category,
      data.payment_method_code || null,
      data.amount,
      data.order_total_amount || 0,
      data.courier_earned_fee || 0,
      data.previous_balance,
      data.new_balance,
      data.resulting_signed_balance || 0,
      data.settlement_status || "NOT_APPLICABLE",
      data.due_at || null,
      data.settled_at || null,
      data.can_pay_pending ? 1 : 0,
      data.external_bank_reference || null,
      data.description || null,
      data.notes || null,
    ]
  );

  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    "SELECT * FROM courier_transactions WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function findPendingCashDebt({ courierId, transactionId, orderId }, executor = db) {
  const where = [
    "courier_id = ?",
    "transaction_category = 'CASH_DEBT'",
    "settlement_status IN ('PENDING', 'OVERDUE')"
  ];
  const params = [courierId];

  if (transactionId) {
    where.push("id = ?");
    params.push(transactionId);
  }

  if (orderId) {
    where.push("order_id = ?");
    params.push(orderId);
  }

  const [rows] = await executor.query(
    `SELECT *
     FROM courier_transactions
     WHERE ${where.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 1`,
    params
  );

  return rows[0] || null;
}

async function updateSettlement(data, executor = db) {
  await executor.query(
    `UPDATE courier_transactions
     SET settlement_status = ?,
         settled_at = ?,
         can_pay_pending = ?,
         external_bank_reference = ?,
         notes = ? 
     WHERE id = ?`,
    [
      data.settlement_status,
      data.settled_at || null,
      data.can_pay_pending ? 1 : 0,
      data.external_bank_reference || null,
      data.notes || null,
      data.id,
    ]
  );

  return findById(data.id, executor);
}

async function listByCourier({ courierId, startDate, endDate }, executor = db) {
  const where = ["courier_id = ?"];
  const params = [courierId];

  if (startDate) {
    where.push("DATE(created_at) >= ?");
    params.push(startDate);
  }

  if (endDate) {
    where.push("DATE(created_at) <= ?");
    params.push(endDate);
  }

  const [rows] = await executor.query(
    `SELECT
      id AS transactionId,
      order_id AS orderId,
      created_at AS date,
      order_total_amount AS totalOrderAmount,
      courier_earned_fee AS earnedFee,
      payment_method_code AS paymentMethod,
      resulting_signed_balance AS resultingBalance,
      CASE
        WHEN settlement_status IN ('SETTLED', 'NOT_APPLICABLE') THEN TRUE
        ELSE FALSE
      END AS isDebtSettled,
      transaction_category,
      settlement_status,
      description
     FROM courier_transactions
     WHERE ${where.join(" AND ")}
     ORDER BY created_at DESC`,
    params
  );

  return rows;
}

module.exports = {
  create,
  findById,
  findPendingCashDebt,
  updateSettlement,
  listByCourier,
};