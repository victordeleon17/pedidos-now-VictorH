const {
  sequelize,
  PaymentMethod,
  PaymentStatus,
  OrderSnapshot,
  OrderItemSnapshot,
  Payment,
  PaymentAttempt,
  CourierWallet,
  CourierTransaction
} = require("../../models");
const { money } = require("../helpers/money");

function calculateTotals(payload) {
  const items = payload.items || [];

  const subtotal = money(
    items.reduce((sum, item) => {
      return sum + Number(item.unit_price) * Number(item.quantity);
    }, 0)
  );

  const items_discount_total = money(
    items.reduce((sum, item) => {
      return sum + Number(item.item_discount || 0);
    }, 0)
  );

  const product_discounts = money(payload.product_discounts || 0);
  const coupon_discount = money(payload.coupon_discount || 0);
  const service_fee = money(payload.service_fee || 0);
  const tip_amount = money(payload.tip_amount || 0);

  const total_discounts = money(
    items_discount_total + product_discounts + coupon_discount
  );

  const total_amount = money(
    subtotal - total_discounts + service_fee + tip_amount
  );

  return {
    subtotal,
    items_discount_total,
    product_discounts,
    coupon_discount,
    total_discounts,
    service_fee,
    tip_amount,
    total_amount
  };
}

async function calculatePreview(payload) {
  return calculateTotals(payload);
}

async function ensureWallet(courierId, transaction) {
  let wallet = await CourierWallet.findOne({
    where: { courier_id: courierId },
    transaction
  });

  if (!wallet) {
    wallet = await CourierWallet.create(
      {
        courier_id: courierId,
        current_balance: 0,
        pending_debt_balance: 0,
        available_balance: 0,
        total_earned: 0,
        account_status: "ACTIVE"
      },
      { transaction }
    );
  }

  return wallet;
}

async function createPayment(payload) {
  return sequelize.transaction(async (transaction) => {
    const existing = await Payment.findOne({
      where: { idempotency_key: payload.idempotency_key },
      transaction
    });

    if (existing) {
      return {
        payment_id: existing.id,
        order_snapshot_id: existing.order_snapshot_id,
        reservation_id: existing.reservation_id,
        status: "APPROVED",
        settlement_status: existing.settlement_status
      };
    }

    const paymentMethod = await PaymentMethod.findOne({
      where: { code: payload.payment_method_code },
      transaction
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    const approvedStatus = await PaymentStatus.findOne({
      where: { code: "APPROVED" },
      transaction
    });

    if (!approvedStatus) {
      throw new Error("APPROVED payment status not found");
    }

    const totals = calculateTotals(payload);
    const courierEarnedFee = money(payload.courier_earned_fee || 0);
    const approvedExtraFee = money(payload.approved_extra_fee || 0);

    const orderSnapshot = await OrderSnapshot.create(
      {
        customer_id: payload.customer_id,
        courier_id: payload.courier_id || null,
        business_id: payload.business_id,
        delivery_address_id: payload.delivery_address_id,
        reservation_id: payload.reservation_id || null,
        order_id: payload.order_id || null,
        subtotal: totals.subtotal,
        product_discounts: totals.product_discounts,
        coupon_discount: totals.coupon_discount,
        service_fee: totals.service_fee,
        courier_earned_fee: courierEarnedFee,
        approved_extra_fee: approvedExtraFee,
        tip_amount: totals.tip_amount,
        total_amount: totals.total_amount,
        currency_code: payload.currency_code || "GTQ",
        final_payment_method_code: payload.payment_method_code,
        status_id: approvedStatus.id,
        notes: "Financial snapshot created by Cobros"
      },
      { transaction }
    );

    for (const item of payload.items || []) {
      await OrderItemSnapshot.create(
        {
          order_id: orderSnapshot.id,
          product_id: item.product_id,
          external_product_id: item.external_product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: money(item.unit_price),
          item_discount: money(item.item_discount || 0),
          item_subtotal: money(
            Number(item.unit_price) * Number(item.quantity) -
              Number(item.item_discount || 0)
          ),
          is_combo: Boolean(item.is_combo)
        },
        { transaction }
      );
    }

    let settlementStatus = "NOT_APPLICABLE";
    let settlementDueAt = null;
    let resultingBalanceAmount = courierEarnedFee;

    if (paymentMethod.code === "CASH") {
      settlementStatus = "PENDING";
      settlementDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      resultingBalanceAmount = money(-totals.total_amount);
    }

    const payment = await Payment.create(
      {
        order_snapshot_id: orderSnapshot.id,
        courier_id: payload.courier_id || null,
        reservation_id: payload.reservation_id || null,
        order_id: payload.order_id || null,
        external_payment_id: payload.external_payment_id || null,
        idempotency_key: payload.idempotency_key,
        payment_method_id: paymentMethod.id,
        gross_amount: totals.subtotal,
        order_total_amount: totals.total_amount,
        coupon_discount: totals.coupon_discount,
        net_amount: money(totals.total_amount - totals.tip_amount),
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
        paid_at: new Date()
      },
      { transaction }
    );

    await PaymentAttempt.create(
      {
        payment_id: payment.id,
        result: "SUCCESS",
        external_reference: `mock-ref-${Date.now()}`,
        response_code: "00",
        response_message: "Mock approved payment",
        origin_service: "cobros"
      },
      { transaction }
    );

    if (payload.courier_id) {
      const wallet = await ensureWallet(payload.courier_id, transaction);

      if (paymentMethod.code === "CASH") {
        const newDebt = money(
          Number(wallet.pending_debt_balance) + totals.total_amount
        );
        const newCurrent = money(
          Number(wallet.available_balance) - newDebt
        );

        await wallet.update(
          {
            pending_debt_balance: newDebt,
            current_balance: newCurrent
          },
          { transaction }
        );

        await CourierTransaction.create(
          {
            courier_id: payload.courier_id,
            payment_id: payment.id,
            order_id: payload.order_id || payload.reservation_id || null,
            order_snapshot_id: orderSnapshot.id,
            type: "DEBIT",
            transaction_category: "CASH_DEBT",
            payment_method_code: paymentMethod.code,
            amount: totals.total_amount,
            order_total_amount: totals.total_amount,
            courier_earned_fee: courierEarnedFee,
            previous_balance: wallet.current_balance,
            new_balance: newCurrent,
            resulting_signed_balance: money(-totals.total_amount),
            settlement_status: "PENDING",
            due_at: settlementDueAt,
            can_pay_pending: true,
            description: "Cash order debt pending settlement"
          },
          { transaction }
        );
      } else {
        const newAvailable = money(
          Number(wallet.available_balance) + courierEarnedFee
        );
        const newEarned = money(
          Number(wallet.total_earned) + courierEarnedFee
        );
        const newCurrent = money(
          newAvailable - Number(wallet.pending_debt_balance)
        );

        await wallet.update(
          {
            available_balance: newAvailable,
            total_earned: newEarned,
            current_balance: newCurrent
          },
          { transaction }
        );

        await CourierTransaction.create(
          {
            courier_id: payload.courier_id,
            payment_id: payment.id,
            order_id: payload.order_id || payload.reservation_id || null,
            order_snapshot_id: orderSnapshot.id,
            type: "CREDIT",
            transaction_category: "CARD_EARNING",
            payment_method_code: paymentMethod.code,
            amount: courierEarnedFee,
            order_total_amount: totals.total_amount,
            courier_earned_fee: courierEarnedFee,
            previous_balance: wallet.current_balance,
            new_balance: newCurrent,
            resulting_signed_balance: courierEarnedFee,
            settlement_status: "NOT_APPLICABLE",
            can_pay_pending: false,
            description: "Card order earning credited to wallet"
          },
          { transaction }
        );
      }
    }

    return {
      payment_id: payment.id,
      order_snapshot_id: orderSnapshot.id,
      reservation_id: payload.reservation_id || null,
      status: "APPROVED",
      settlement_status: settlementStatus,
      totals
    };
  });
}

async function getPaymentById(paymentId) {
  return Payment.findByPk(paymentId, {
    include: [
      { model: PaymentMethod, as: "paymentMethod" },
      { model: PaymentStatus, as: "status" },
      { model: PaymentAttempt, as: "attempts" },
      {
        model: OrderSnapshot,
        as: "orderSnapshot",
        include: [{ model: OrderItemSnapshot, as: "items" }]
      }
    ]
  });
}

async function listPayments(filters) {
  const where = {};

  if (filters.reservationId) where.reservation_id = filters.reservationId;
  if (filters.orderSnapshotId) where.order_snapshot_id = filters.orderSnapshotId;
  if (filters.orderId) where.order_id = filters.orderId;
  if (filters.courierId) where.courier_id = filters.courierId;

  return Payment.findAll({
    where,
    include: [
      { model: PaymentMethod, as: "paymentMethod" },
      { model: PaymentStatus, as: "status" }
    ],
    order: [["created_at", "DESC"]]
  });
}

module.exports = {
  calculatePreview,
  createPayment,
  getPaymentById,
  listPayments
};