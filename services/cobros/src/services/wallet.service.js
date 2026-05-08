const {
  sequelize,
  CourierWallet,
  CourierTransaction,
  Payment
} = require("../../models");
const { money } = require("../helpers/money");

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

  const wallet = await CourierWallet.findOne({
    where: { courier_id: courierId }
  });

  if (!wallet) {
    throw new Error("Wallet not found for courier");
  }

  const where = { courier_id: courierId };

  if (startDate || endDate) {
    const { Op } = require("sequelize");
    where.created_at = {};

    if (startDate) where.created_at[Op.gte] = new Date(`${startDate}T00:00:00`);
    if (endDate) where.created_at[Op.lte] = new Date(`${endDate}T23:59:59`);
  }

  const transactions = await CourierTransaction.findAll({
    where,
    order: [["created_at", "DESC"]]
  });

  return {
    balances: {
      positiveBalance: money(wallet.available_balance),
      appDebt: money(wallet.pending_debt_balance),
      totalEarned: money(wallet.total_earned)
    },
    morosityState: resolveMorosityState(wallet),
    transactions: transactions.map((tx) => ({
      transactionId: tx.id,
      orderId: tx.order_id,
      date: tx.created_at,
      totalOrderAmount: money(tx.order_total_amount),
      earnedFee: money(tx.courier_earned_fee),
      paymentMethod: tx.payment_method_code,
      resultingBalance: money(tx.resulting_signed_balance),
      isDebtSettled:
        tx.settlement_status === "SETTLED" ||
        tx.settlement_status === "NOT_APPLICABLE",
      transaction_category: tx.transaction_category,
      settlement_status: tx.settlement_status,
      description: tx.description
    }))
  };
}

async function payPending({ courierId, transactionId, orderId }) {
  if (!courierId) {
    throw new Error("courierId is required");
  }

  if (!transactionId && !orderId) {
    throw new Error("transactionId or orderId is required");
  }

  return sequelize.transaction(async (transaction) => {
    const where = {
      courier_id: courierId,
      transaction_category: "CASH_DEBT",
      settlement_status: "PENDING"
    };

    if (transactionId) where.id = transactionId;
    if (orderId) where.order_id = orderId;

    const debtTx = await CourierTransaction.findOne({
      where,
      order: [["created_at", "DESC"]],
      transaction
    });

    if (!debtTx) {
      throw new Error("Pending cash debt transaction not found");
    }

    const wallet = await CourierWallet.findOne({
      where: { courier_id: courierId },
      transaction
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await debtTx.update(
      {
        settlement_status: "SETTLED",
        settled_at: new Date(),
        can_pay_pending: false,
        external_bank_reference: `mock-bank-${Date.now()}`
      },
      { transaction }
    );

    await Payment.update(
      {
        settlement_status: "SETTLED",
        settled_at: new Date()
      },
      {
        where: { id: debtTx.payment_id },
        transaction
      }
    );

    const newDebt = money(
      Number(wallet.pending_debt_balance) - Number(debtTx.order_total_amount)
    );
    const newAvailable = money(
      Number(wallet.available_balance) + Number(debtTx.courier_earned_fee)
    );
    const newEarned = money(
      Number(wallet.total_earned) + Number(debtTx.courier_earned_fee)
    );
    const newCurrent = money(newAvailable - newDebt);

    await wallet.update(
      {
        pending_debt_balance: newDebt,
        available_balance: newAvailable,
        total_earned: newEarned,
        current_balance: newCurrent,
        account_status: "ACTIVE",
        blocked_reason: null
      },
      { transaction }
    );

    await CourierTransaction.create(
      {
        courier_id: courierId,
        payment_id: debtTx.payment_id,
        order_id: debtTx.order_id,
        order_snapshot_id: debtTx.order_snapshot_id,
        type: "CREDIT",
        transaction_category: "CASH_SETTLEMENT",
        payment_method_code: "CASH",
        amount: money(debtTx.courier_earned_fee),
        order_total_amount: money(debtTx.order_total_amount),
        courier_earned_fee: money(debtTx.courier_earned_fee),
        previous_balance: money(wallet.current_balance),
        new_balance: newCurrent,
        resulting_signed_balance: money(debtTx.courier_earned_fee),
        settlement_status: "SETTLED",
        settled_at: new Date(),
        can_pay_pending: false,
        external_bank_reference: `mock-bank-${Date.now()}`,
        description: "Cash debt settled and courier fee credited"
      },
      { transaction }
    );

    return {
      message: "Pago procesado exitosamente. Tu deuda con la app ha sido saldada."
    };
  });
}

module.exports = {
  getWalletSummary,
  payPending
};