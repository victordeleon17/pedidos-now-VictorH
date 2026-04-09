const db = require("../db");
const { newId } = require("../helpers/ids");
const { money } = require("../helpers/money");
const {
  PaymentMethodModel,
  PaymentStatusModel,
  CouponModel,
  OrderSnapshotModel,
  OrderItemSnapshotModel,
  PaymentModel,
  PaymentAttemptModel,
  PaymentDiscountAppliedModel,
  CourierWalletModel,
  CourierTransactionModel,
} = require("../models");

function calculateTotals(payload) {
  const { items, product_discounts = 0, coupon_discount = 0, service_fee = 0, tip_amount = 0 } = payload;

  const subtotal = money(
    items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0)
  );

  const items_discount_total = money(
    items.reduce((sum, item) => sum + Number(item.item_discount || 0), 0)
  );

  const total_discounts = money(
    Number(product_discounts || 0) +
    Number(coupon_discount || 0) +
    items_discount_total
  );

  const total_amount = money(
    subtotal - total_discounts + Number(service_fee || 0) + Number(tip_amount || 0)
  );

  return {
    subtotal,
    items_discount_total,
    product_discounts: money(product_discounts),
    coupon_discount: money(coupon_discount),
    total_discounts,
    service_fee: money(service_fee),
    tip_amount: money(tip_amount),
    total_amount,
  };
}

async function ensureWallet(conn, courierId) {
  let wallet = await CourierWalletModel.findByCourierId(courierId, conn);

  if (!wallet) {
    wallet = await CourierWalletModel.create({
      id: newId(),
      courier_id: courierId,
      current_balance: 0,
      pending_debt_balance: 0,
      available_balance: 0,
      total_earned: 0,
      account_status: "ACTIVE",
    }, conn);
  }

  return wallet;
}

async function updateWalletFinancials(conn, courierId, { availableDelta = 0, debtDelta = 0, earnedDelta = 0 }) {
  const wallet = await CourierWalletModel.findByCourierId(courierId, conn);

  if (!wallet) throw new Error("Courier wallet not found");

  const available = money(Number(wallet.available_balance) + Number(availableDelta));
  const debt = money(Number(wallet.pending_debt_balance) + Number(debtDelta));
  const earned = money(Number(wallet.total_earned) + Number(earnedDelta));
  const current = money(available - debt);

  const updated = await CourierWalletModel.updateFinancials({
    courier_id: courierId,
    current_balance: current,
    pending_debt_balance: debt,
    available_balance: available,
    total_earned: earned,
    account_status: wallet.account_status || "ACTIVE",
    grace_until: wallet.grace_until || null,
    critical_overdue_at: wallet.critical_overdue_at || null,
    blocked_reason: wallet.blocked_reason || null,
  }, conn);

  return {
    previous_balance: Number(wallet.current_balance),
    new_balance: Number(updated.current_balance),
  };
}

async function calculatePreview(payload) {
  return calculateTotals(payload);
}

async function createPayment(payload) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const existingPayment = await PaymentModel.findByIdempotencyKey(payload.idempotency_key, conn);
    if (existingPayment) {
      await conn.commit();
      return {
        payment_id: existingPayment.id,
        order_snapshot_id: existingPayment.order_snapshot_id,
        reservation_id: existingPayment.reservation_id,
        status: "APPROVED",
        settlement_status: existingPayment.settlement_status,
      };
    }

    const totals = calculateTotals(payload);

    const approvedStatus = await PaymentStatusModel.findByCode("APPROVED", conn);
    if (!approvedStatus) throw new Error("APPROVED payment status not found");

    const paymentMethod = await PaymentMethodModel.findByCode(payload.payment_method_code, conn);
    if (!paymentMethod) throw new Error("Payment method not found");

    let couponId = null;
    if (payload.coupon_code) {
      const coupon = await CouponModel.findActiveByCode(payload.coupon_code, conn);
      if (!coupon) throw new Error("Invalid coupon_code");
      couponId = coupon.id;
    }

    if (payload.courier_id) {
      await ensureWallet(conn, payload.courier_id);
    }

    const orderSnapshotId = newId();
    const paymentId = newId();

    const courierEarnedFee = money(payload.courier_earned_fee || 0);
    const approvedExtraFee = money(payload.approved_extra_fee || 0);
    const orderTotalAmount = money(totals.total_amount);

    await OrderSnapshotModel.create({
      id: orderSnapshotId,
      customer_id: payload.customer_id,
      courier_id: payload.courier_id || null,
      business_id: payload.business_id,
      delivery_address_id: payload.delivery_address_id,
      reservation_id: payload.reservation_id,
      subtotal: totals.subtotal,
      product_discounts: totals.product_discounts,
      coupon_discount: totals.coupon_discount,
      service_fee: totals.service_fee,
      courier_earned_fee: courierEarnedFee,
      approved_extra_fee: approvedExtraFee,
      tip_amount: totals.tip_amount,
      total_amount: orderTotalAmount,
      currency_code: payload.currency_code || "GTQ",
      final_payment_method_code: payload.payment_method_code,
      status_id: approvedStatus.id,
      notes: "Financial snapshot created by Cobros",
    }, conn);

    const itemRows = payload.items.map((item) => ({
      id: newId(),
      order_id: orderSnapshotId,
      product_id: item.product_id,
      external_product_id: item.external_product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      item_discount: item.item_discount || 0,
      item_subtotal: money(Number(item.unit_price) * Number(item.quantity) - Number(item.item_discount || 0)),
      is_combo: item.is_combo ? 1 : 0,
    }));

    await OrderItemSnapshotModel.createMany(itemRows, conn);

    let settlementStatus = "NOT_APPLICABLE";
    let settlementDueAt = null;
    let resultingBalanceAmount = courierEarnedFee;

    if (paymentMethod.code === "CASH") {
      settlementStatus = "PENDING";
      settlementDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      resultingBalanceAmount = -orderTotalAmount;
    }

    await PaymentModel.create({
      id: paymentId,
      order_snapshot_id: orderSnapshotId,
      courier_id: payload.courier_id || null,
      reservation_id: payload.reservation_id,
      order_id: payload.order_id || null,
      external_payment_id: payload.external_payment_id || null,
      idempotency_key: payload.idempotency_key,
      payment_method_id: paymentMethod.id,
      coupon_id: couponId,
      gross_amount: totals.subtotal,
      order_total_amount: orderTotalAmount,
      coupon_discount: totals.coupon_discount,
      net_amount: money(orderTotalAmount - totals.tip_amount),
      service_fee: totals.service_fee,
      courier_earned_fee: courierEarnedFee,
      tip_amount: totals.tip_amount,
      resulting_balance_amount: resultingBalanceAmount,
      total_refunded: 0,
      currency_code: payload.currency_code || "GTQ",
      status_id: approvedStatus.id,
      settlement_status: settlementStatus,
      settlement_due_at: settlementDueAt,
      payment_gateway: "mock_gateway",
      origin_service: "cobros",
      paid_at: new Date(),
    }, conn);

    await PaymentAttemptModel.create({
      id: newId(),
      payment_id: paymentId,
      result: "SUCCESS",
      external_reference: `mock-ref-${Date.now()}`,
      response_code: "00",
      response_message: "Mock approved payment",
      origin_service: "cobros",
    }, conn);

    if (couponId && totals.coupon_discount > 0) {
      await PaymentDiscountAppliedModel.create({
        id: newId(),
        payment_id: paymentId,
        type: "COUPON",
        code: payload.coupon_code,
        description: "Applied coupon discount",
        amount: totals.coupon_discount,
        source: "DISCOUNTS_SERVICE",
      }, conn);
    }

    if (payload.courier_id) {
      if (paymentMethod.code === "CASH") {
        const walletMovement = await updateWalletFinancials(conn, payload.courier_id, {
          debtDelta: orderTotalAmount,
          availableDelta: 0,
          earnedDelta: 0,
        });

        await CourierTransactionModel.create({
          id: newId(),
          courier_id: payload.courier_id,
          payment_id: paymentId,
          order_id: payload.order_id || payload.reservation_id,
          order_snapshot_id: orderSnapshotId,
          type: "DEBIT",
          transaction_category: "CASH_DEBT",
          payment_method_code: paymentMethod.code,
          amount: orderTotalAmount,
          order_total_amount: orderTotalAmount,
          courier_earned_fee: courierEarnedFee,
          previous_balance: walletMovement.previous_balance,
          new_balance: walletMovement.new_balance,
          resulting_signed_balance: -orderTotalAmount,
          settlement_status: "PENDING",
          due_at: settlementDueAt,
          can_pay_pending: true,
          description: "Cash order debt pending settlement",
        }, conn);
      } else {
        const walletMovement = await updateWalletFinancials(conn, payload.courier_id, {
          availableDelta: courierEarnedFee,
          debtDelta: 0,
          earnedDelta: courierEarnedFee,
        });

        await CourierTransactionModel.create({
          id: newId(),
          courier_id: payload.courier_id,
          payment_id: paymentId,
          order_id: payload.order_id || payload.reservation_id,
          order_snapshot_id: orderSnapshotId,
          type: "CREDIT",
          transaction_category: "CARD_EARNING",
          payment_method_code: paymentMethod.code,
          amount: courierEarnedFee,
          order_total_amount: orderTotalAmount,
          courier_earned_fee: courierEarnedFee,
          previous_balance: walletMovement.previous_balance,
          new_balance: walletMovement.new_balance,
          resulting_signed_balance: courierEarnedFee,
          settlement_status: "NOT_APPLICABLE",
          can_pay_pending: false,
          description: "Card order earning credited to wallet",
        }, conn);
      }
    }

    await conn.commit();

    return {
      payment_id: paymentId,
      order_snapshot_id: orderSnapshotId,
      reservation_id: payload.reservation_id,
      status: "APPROVED",
      settlement_status: settlementStatus,
      totals,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getPaymentById(paymentId) {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) return null;

  const attempts = await PaymentAttemptModel.listByPaymentId(paymentId);

  return {
    ...payment,
    attempts,
  };
}

async function listPayments(filters) {
  return PaymentModel.list(filters);
}

module.exports = {
  calculatePreview,
  createPayment,
  getPaymentById,
  listPayments,
};