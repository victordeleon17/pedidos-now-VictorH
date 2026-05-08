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
  const weight_lbs = money(payload.weight_lbs || 0);
  const weight_fee = money(Math.min(weight_lbs, 90));
  const weather_traffic_fee = payload.apply_weather_surcharge || payload.apply_traffic_surcharge
    ? weight_fee
    : 0;
  const insurance_fee = money(Number(payload.insurance_value || 0) * 0.015);

  const total_discounts = money(
    items_discount_total + product_discounts + coupon_discount
  );

  const base_before_priority = money(
    subtotal -
      total_discounts +
      service_fee +
      weight_fee +
      weather_traffic_fee +
      insurance_fee
  );

  const priority_fee = payload.priority_shipping
    ? money(base_before_priority * 0.1)
    : 0;

  const total_amount = money(
    base_before_priority + priority_fee + tip_amount
  );

  return {
    subtotal,
    items_discount_total,
    product_discounts,
    coupon_discount,
    total_discounts,
    service_fee,
    weight_lbs,
    weight_fee,
    weather_traffic_fee,
    insurance_fee,
    priority_fee,
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

    if (paymentMethod.code === "COUPON" && totals.total_amount <= 0) {
      throw new Error("COUPON payments must keep total_amount greater than 0");
    }

    const courierEarnedFee = money(payload.courier_earned_fee || 0);
    const approvedExtraFee = money(payload.approved_extra_fee || 0);
    const cardType = payload.card_type || (paymentMethod.code === "CARD_CREDIT"
      ? "CREDIT"
      : paymentMethod.code === "CARD_DEBIT"
        ? "DEBIT"
        : null);

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
        weight_fee: totals.weight_fee,
        weather_traffic_fee: totals.weather_traffic_fee,
        insurance_fee: totals.insurance_fee,
        priority_fee: totals.priority_fee,
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
        card_type: cardType,
        gross_amount: totals.subtotal,
        order_total_amount: totals.total_amount,
        coupon_discount: totals.coupon_discount,
        net_amount: money(totals.total_amount - totals.tip_amount),
        service_fee: totals.service_fee,
        weight_fee: totals.weight_fee,
        weather_traffic_fee: totals.weather_traffic_fee,
        insurance_fee: totals.insurance_fee,
        priority_fee: totals.priority_fee,
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
            transaction_category: paymentMethod.code === "COUPON" ? "COUPON_EARNING" : "CARD_EARNING",
            payment_method_code: paymentMethod.code,
            amount: courierEarnedFee,
            order_total_amount: totals.total_amount,
            courier_earned_fee: courierEarnedFee,
            previous_balance: wallet.current_balance,
            new_balance: newCurrent,
            resulting_signed_balance: courierEarnedFee,
            settlement_status: "NOT_APPLICABLE",
            can_pay_pending: false,
            description: paymentMethod.code === "COUPON"
              ? "Coupon order earning credited to wallet"
              : "Card order earning credited to wallet"
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

async function getStatusByCode(code, transaction) {
  const status = await PaymentStatus.findOne({ where: { code }, transaction });

  if (!status) {
    throw new Error(`${code} payment status not found`);
  }

  return status;
}

async function applyWalletAdjustment({ payment, paymentMethod, amount, category, description, transaction }) {
  if (!payment.courier_id || amount <= 0) return;

  const wallet = await CourierWallet.findOne({
    where: { courier_id: payment.courier_id },
    transaction
  });

  if (!wallet) return;

  const previousBalance = money(wallet.current_balance);
  let newAvailable = money(wallet.available_balance);
  let newDebt = money(wallet.pending_debt_balance);
  let newEarned = money(wallet.total_earned);
  let type = "DEBIT";
  let signedAmount = money(-amount);

  if (paymentMethod.code === "CASH") {
    newDebt = money(Math.max(0, newDebt - amount));
    type = "CREDIT";
    signedAmount = amount;
  } else {
    newAvailable = money(Math.max(0, newAvailable - amount));
    newEarned = money(Math.max(0, newEarned - amount));
  }

  const newCurrent = money(newAvailable - newDebt);

  await wallet.update(
    {
      pending_debt_balance: newDebt,
      available_balance: newAvailable,
      total_earned: newEarned,
      current_balance: newCurrent
    },
    { transaction }
  );

  await CourierTransaction.create(
    {
      courier_id: payment.courier_id,
      payment_id: payment.id,
      order_id: payment.order_id || payment.reservation_id || null,
      order_snapshot_id: payment.order_snapshot_id,
      type,
      transaction_category: category,
      payment_method_code: paymentMethod.code,
      amount,
      order_total_amount: money(payment.order_total_amount),
      courier_earned_fee: amount,
      previous_balance: previousBalance,
      new_balance: newCurrent,
      resulting_signed_balance: signedAmount,
      settlement_status: paymentMethod.code === "CASH" ? "SETTLED" : "NOT_APPLICABLE",
      settled_at: new Date(),
      can_pay_pending: false,
      description
    },
    { transaction }
  );
}

async function cancelPayment(paymentId, { reason } = {}) {
  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: PaymentMethod, as: "paymentMethod" },
        { model: PaymentStatus, as: "status" }
      ],
      transaction
    });

    if (!payment) throw new Error("Payment not found");
    if (["CANCELLED", "REFUNDED"].includes(payment.status?.code)) {
      throw new Error("Payment cannot be cancelled in its current status");
    }

    const cancelledStatus = await getStatusByCode("CANCELLED", transaction);
    const walletAdjustment = payment.paymentMethod.code === "CASH"
      ? money(payment.order_total_amount)
      : money(payment.courier_earned_fee);

    await payment.update(
      {
        status_id: cancelledStatus.id,
        cancellation_reason: reason || "Cancelled by Cobros",
        settlement_status: payment.settlement_status === "PENDING" ? "SETTLED" : payment.settlement_status
      },
      { transaction }
    );

    await OrderSnapshot.update(
      { status_id: cancelledStatus.id },
      { where: { id: payment.order_snapshot_id }, transaction }
    );

    if (payment.paymentMethod.code === "CASH") {
      await CourierTransaction.update(
        {
          settlement_status: "SETTLED",
          settled_at: new Date(),
          can_pay_pending: false,
          description: "Cash debt cancelled with payment"
        },
        {
          where: {
            payment_id: payment.id,
            transaction_category: "CASH_DEBT",
            settlement_status: "PENDING"
          },
          transaction
        }
      );
    }

    await applyWalletAdjustment({
      payment,
      paymentMethod: payment.paymentMethod,
      amount: walletAdjustment,
      category: payment.paymentMethod.code === "CASH" ? "CASH_CANCEL_ADJUSTMENT" : "PAYMENT_CANCEL_DEBIT",
      description: "Payment cancellation wallet adjustment",
      transaction
    });

    return {
      payment_id: payment.id,
      status: "CANCELLED",
      cancellation_reason: reason || "Cancelled by Cobros"
    };
  });
}

async function refundPayment(paymentId, { amount, reason } = {}) {
  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: PaymentMethod, as: "paymentMethod" },
        { model: PaymentStatus, as: "status" }
      ],
      transaction
    });

    if (!payment) throw new Error("Payment not found");
    if (["CANCELLED", "DENIED"].includes(payment.status?.code)) {
      throw new Error("Payment cannot be refunded in its current status");
    }

    const refundAmount = money(amount);
    const refundable = money(Number(payment.order_total_amount) - Number(payment.total_refunded));
    if (refundAmount > refundable) {
      throw new Error("Refund amount exceeds refundable balance");
    }

    const totalRefunded = money(Number(payment.total_refunded) + refundAmount);
    const finalStatusCode = totalRefunded >= Number(payment.order_total_amount)
      ? "REFUNDED"
      : "PARTIALLY_REFUNDED";
    const refundStatus = await getStatusByCode(finalStatusCode, transaction);
    const ratio = Number(payment.order_total_amount) > 0
      ? refundAmount / Number(payment.order_total_amount)
      : 0;
    const walletAdjustment = payment.paymentMethod.code === "CASH"
      ? refundAmount
      : money(Number(payment.courier_earned_fee) * ratio);

    await payment.update(
      {
        status_id: refundStatus.id,
        total_refunded: totalRefunded
      },
      { transaction }
    );

    await OrderSnapshot.update(
      { status_id: refundStatus.id },
      { where: { id: payment.order_snapshot_id }, transaction }
    );

    await PaymentAttempt.create(
      {
        payment_id: payment.id,
        result: "SUCCESS",
        external_reference: `mock-refund-${Date.now()}`,
        response_code: "00",
        response_message: reason || "Mock refund approved",
        origin_service: "cobros"
      },
      { transaction }
    );

    if (payment.paymentMethod.code === "CASH") {
      const debtTx = await CourierTransaction.findOne({
        where: {
          payment_id: payment.id,
          transaction_category: "CASH_DEBT",
          settlement_status: "PENDING"
        },
        transaction
      });

      if (debtTx) {
        const remainingDebt = money(Math.max(0, Number(debtTx.order_total_amount) - refundAmount));
        await debtTx.update(
          {
            amount: remainingDebt,
            order_total_amount: remainingDebt,
            settlement_status: remainingDebt === 0 ? "SETTLED" : "PENDING",
            settled_at: remainingDebt === 0 ? new Date() : null,
            can_pay_pending: remainingDebt > 0
          },
          { transaction }
        );
      }
    }

    await applyWalletAdjustment({
      payment,
      paymentMethod: payment.paymentMethod,
      amount: walletAdjustment,
      category: payment.paymentMethod.code === "CASH" ? "CASH_REFUND_ADJUSTMENT" : "REFUND_DEBIT",
      description: "Payment refund wallet adjustment",
      transaction
    });

    return {
      payment_id: payment.id,
      status: finalStatusCode,
      refunded_amount: refundAmount,
      total_refunded: totalRefunded,
      refundable_balance: money(Number(payment.order_total_amount) - totalRefunded)
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
  listPayments,
  cancelPayment,
  refundPayment
};
