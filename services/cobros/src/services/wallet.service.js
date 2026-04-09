const db = require("../db");
const { newId } = require("../helpers/ids");
const { money } = require("../helpers/money");
const {
  CourierWalletModel,
  CourierTransactionModel,
  WalletSettlementModel,
  PaymentModel,
} = require("../models");

async function refreshMorosity(courierId) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const txs = await CourierTransactionModel.listByCourier({ courierId }, conn);

    let hasCritical = false;
    let graceUntil = null;
    let criticalAt = null;

    for (const tx of txs) {
      if (!tx.date || tx.isDebtSettled) continue;

      const dueDate = tx.date ? new Date(tx.date) : null;
      if (!dueDate || tx.paymentMethod !== "CASH") continue;

      const days = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (days >= 30) {
        hasCritical = true;
        criticalAt = dueDate;
      } else if (days >= 1) {
        graceUntil = dueDate;
      }
    }

    const wallet = await CourierWalletModel.findByCourierId(courierId, conn);
    if (!wallet) {
      await conn.commit();
      return;
    }

    await CourierWalletModel.updateFinancials({
      courier_id: courierId,
      current_balance: wallet.current_balance,
      pending_debt_balance: wallet.pending_debt_balance,
      available_balance: wallet.available_balance,
      total_earned: wallet.total_earned,
      account_status: hasCritical ? "BLOCKED" : "ACTIVE",
      grace_until: graceUntil,
      critical_overdue_at: criticalAt,
      blocked_reason: hasCritical ? "Critical overdue debt >= 30 days" : null,
    }, conn);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function getMorosityState(wallet) {
  if (wallet.account_status === "BLOCKED") return "BLOCKED_CRITICAL_DEBT";
  if (Number(wallet.pending_debt_balance) > 0) return "GRACE_PERIOD_WARNING";
  return "NONE";
}

async function getWalletSummary({ courierId, startDate, endDate }) {
  await refreshMorosity(courierId);

  const wallet = await CourierWalletModel.findByCourierId(courierId);
  if (!wallet) throw new Error("Wallet not found for courier");

  const transactions = await CourierTransactionModel.listByCourier({
    courierId,
    startDate,
    endDate,
  });

  return {
    balances: {
      positiveBalance: money(wallet.available_balance),
      appDebt: money(wallet.pending_debt_balance),
      totalEarned: money(wallet.total_earned),
    },
    morosityState: getMorosityState(wallet),
    transactions,
  };
}

async function payPending({ courierId, transactionId, orderId }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const debtTx = await CourierTransactionModel.findPendingCashDebt({
      courierId,
      transactionId,
      orderId,
    }, conn);

    if (!debtTx) {
      throw new Error("Pending cash debt transaction not found");
    }

    const wallet = await CourierWalletModel.findByCourierId(courierId, conn);
    if (!wallet) throw new Error("Wallet not found");

    const settlementId = newId();
    const bankRef = `bank-settlement-${Date.now()}`;

    await WalletSettlementModel.create({
      id: settlementId,
      courier_id: courierId,
      payment_id: debtTx.payment_id,
      courier_transaction_id: debtTx.id,
      order_id: debtTx.order_id,
      settlement_amount: debtTx.order_total_amount,
      currency_code: "GTQ",
      status: "APPROVED",
      source_method_ref: wallet.linked_debit_card_ref || wallet.linked_bank_account_ref || "mock-linked-method",
      external_reference: bankRef,
      response_code: "00",
      response_message: "Settlement approved (mock)",
      origin_service: "cobros",
      paid_at: new Date(),
    }, conn);

    await CourierTransactionModel.updateSettlement({
      id: debtTx.id,
      settlement_status: "SETTLED",
      settled_at: new Date(),
      can_pay_pending: false,
      external_bank_reference: bankRef,
      notes: "Settled via wallet_settlements",
    }, conn);

    await PaymentModel.updateSettlement({
      id: debtTx.payment_id,
      settlement_status: "SETTLED",
      settled_at: new Date(),
    }, conn);

    const newDebt = money(Number(wallet.pending_debt_balance) - Number(debtTx.order_total_amount));
    const newAvailable = money(Number(wallet.available_balance) + Number(debtTx.earnedFee || debtTx.courier_earned_fee || 0));
    const newTotalEarned = money(Number(wallet.total_earned) + Number(debtTx.earnedFee || debtTx.courier_earned_fee || 0));
    const newCurrent = money(newAvailable - newDebt);

    await CourierWalletModel.updateFinancials({
      courier_id: courierId,
      current_balance: newCurrent,
      pending_debt_balance: newDebt,
      available_balance: newAvailable,
      total_earned: newTotalEarned,
      account_status: "ACTIVE",
      grace_until: null,
      critical_overdue_at: null,
      blocked_reason: null,
    }, conn);

    await CourierTransactionModel.create({
      id: newId(),
      courier_id: courierId,
      payment_id: debtTx.payment_id,
      order_id: debtTx.orderId || debtTx.order_id,
      order_snapshot_id: null,
      type: "CREDIT",
      transaction_category: "CASH_SETTLEMENT",
      payment_method_code: "CASH",
      amount: Number(debtTx.earnedFee || debtTx.courier_earned_fee || 0),
      order_total_amount: Number(debtTx.totalOrderAmount || debtTx.order_total_amount || 0),
      courier_earned_fee: Number(debtTx.earnedFee || debtTx.courier_earned_fee || 0),
      previous_balance: Number(wallet.current_balance),
      new_balance: newCurrent,
      resulting_signed_balance: Number(debtTx.earnedFee || debtTx.courier_earned_fee || 0),
      settlement_status: "SETTLED",
      settled_at: new Date(),
      can_pay_pending: false,
      external_bank_reference: bankRef,
      description: "Cash debt settled and courier fee credited",
      notes: "Generated after pay-pending",
    }, conn);

    await conn.commit();

    return {
      message: "Pago procesado exitosamente. Tu deuda con la app ha sido saldada.",
      settlementId,
      bankReference: bankRef,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  getWalletSummary,
  payPending,
};