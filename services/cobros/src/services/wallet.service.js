const db = require("../db");

function resolveMorosityState(wallet) {
  if (!wallet) return "NONE";
  if (wallet.account_status === "BLOCKED") return "BLOCKED_CRITICAL_DEBT";
  if (Number(wallet.pending_debt_balance || 0) > 0) return "GRACE_PERIOD_WARNING";
  return "NONE";
}

async function getWalletSummary({ courierId, startDate, endDate }) {
  if (!courierId) {
    throw new Error("courierId is required");
  }

  const [walletRows] = await db.query(
    `SELECT *
     FROM courier_wallets
     WHERE courier_id = ?
     LIMIT 1`,
    [courierId]
  );

  if (!walletRows.length) {
    throw new Error("Wallet not found for courier");
  }

  const wallet = walletRows[0];

  const conditions = ["courier_id = ?"];
  const params = [courierId];

  if (startDate) {
    conditions.push("DATE(created_at) >= ?");
    params.push(startDate);
  }

  if (endDate) {
    conditions.push("DATE(created_at) <= ?");
    params.push(endDate);
  }

  const [transactions] = await db.query(
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
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC`,
    params
  );

  return {
    balances: {
      positiveBalance: Number(wallet.available_balance || 0),
      appDebt: Number(wallet.pending_debt_balance || 0),
      totalEarned: Number(wallet.total_earned || 0),
    },
    morosityState: resolveMorosityState(wallet),
    transactions,
  };
}

async function payPending({ courierId, transactionId, orderId }) {
  if (!courierId) {
    throw new Error("courierId is required");
  }

  if (!transactionId && !orderId) {
    throw new Error("transactionId or orderId is required");
  }

  return {
    message: "Pay pending endpoint reached correctly",
    courierId,
    transactionId: transactionId || null,
    orderId: orderId || null
  };
}

module.exports = {
  getWalletSummary,
  payPending,
};