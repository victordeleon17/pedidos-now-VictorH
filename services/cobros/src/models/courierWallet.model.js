const db = require("../db");

async function findByCourierId(courierId, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM courier_wallets
     WHERE courier_id = ?
     LIMIT 1`,
    [courierId]
  );
  return rows[0] || null;
}

async function create(data, executor = db) {
  await executor.query(
    `INSERT INTO courier_wallets
      (id, courier_id, current_balance, pending_debt_balance, available_balance,
       total_earned, account_status, grace_until, critical_overdue_at,
       linked_bank_account_ref, linked_debit_card_ref, blocked_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.courier_id,
      data.current_balance || 0,
      data.pending_debt_balance || 0,
      data.available_balance || 0,
      data.total_earned || 0,
      data.account_status || "ACTIVE",
      data.grace_until || null,
      data.critical_overdue_at || null,
      data.linked_bank_account_ref || null,
      data.linked_debit_card_ref || null,
      data.blocked_reason || null,
    ]
  );

  return findByCourierId(data.courier_id, executor);
}

async function updateFinancials(data, executor = db) {
  await executor.query(
    `UPDATE courier_wallets
     SET current_balance = ?,
         pending_debt_balance = ?,
         available_balance = ?,
         total_earned = ?,
         account_status = ?,
         grace_until = ?,
         critical_overdue_at = ?,
         blocked_reason = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE courier_id = ?`,
    [
      data.current_balance,
      data.pending_debt_balance,
      data.available_balance,
      data.total_earned,
      data.account_status || "ACTIVE",
      data.grace_until || null,
      data.critical_overdue_at || null,
      data.blocked_reason || null,
      data.courier_id,
    ]
  );

  return findByCourierId(data.courier_id, executor);
}

module.exports = {
  findByCourierId,
  create,
  updateFinancials,
};