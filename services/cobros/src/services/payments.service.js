const db = require("../db");

// helper: redondeo seguro a 2 decimales
function money(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function calcTotals({ items, product_discounts = 0, coupon_discount = 0, service_fee = 0, tip_amount = 0 }) {
  const subtotal = money(
    items.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0)
  );

  const itemsDiscountTotal = money(
    items.reduce((sum, it) => sum + Number(it.item_discount || 0), 0)
  );

  const totalDiscounts = money(Number(product_discounts) + Number(coupon_discount) + itemsDiscountTotal);

  const total = money(subtotal - totalDiscounts + Number(service_fee) + Number(tip_amount));

  return {
    subtotal,
    items_discount_total: itemsDiscountTotal,
    product_discounts: money(product_discounts),
    coupon_discount: money(coupon_discount),
    total_discounts: totalDiscounts,
    service_fee: money(service_fee),
    tip_amount: money(tip_amount),
    total_amount: total,
  };
}

async function getStatusIdByCode(code) {
  const [rows] = await db.query("SELECT id FROM payment_statuses WHERE code = ? LIMIT 1", [code]);
  if (!rows.length) throw new Error(`payment_statuses missing code: ${code}`);
  return rows[0].id;
}

async function getMethodIdByCode(code) {
  const [rows] = await db.query("SELECT id FROM payment_methods WHERE code = ? LIMIT 1", [code]);
  if (!rows.length) throw new Error(`payment_methods missing code: ${code}`);
  return rows[0].id;
}

async function calculatePreview(payload) {
  return calcTotals(payload);
}

async function createPayment(payload) {
  const {
    customer_id,
    courier_id = null,
    business_id,
    delivery_address_id,
    reservation_id = null,

    currency_code = "GTQ",
    payment_method_code, // CASH | CARD_CREDIT | CARD_DEBIT | COUPON (tu mapeo)

    coupon_code = null, // opcional
    product_discounts = 0,
    coupon_discount = 0,
    service_fee = 0,
    tip_amount = 0,

    items,
    idempotency_key,
  } = payload;

  // 1) calcular totales
  const totals = calcTotals({ items, product_discounts, coupon_discount, service_fee, tip_amount });

  // 2) resolver FK ids
  const statusPendingId = await getStatusIdByCode("PENDING");
  const methodId = await getMethodIdByCode(payment_method_code);

  let couponId = null;
  if (coupon_code) {
    const [cRows] = await db.query("SELECT id FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1", [coupon_code]);
    if (!cRows.length) throw new Error("Invalid coupon_code");
    couponId = cRows[0].id;
  }

  // 3) transacción DB
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // A) Insert order snapshot
    const [orderRes] = await conn.query(
      `INSERT INTO orders_snapshot
      (customer_id, courier_id, business_id, delivery_address_id, reservation_id,
       subtotal, product_discounts, coupon_discount, service_fee, tip_amount, total_amount,
       currency_code, status_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        courier_id,
        business_id,
        delivery_address_id,
        reservation_id,
        totals.subtotal,
        totals.product_discounts,
        totals.coupon_discount,
        totals.service_fee,
        totals.tip_amount,
        totals.total_amount,
        currency_code,
        statusPendingId,
        "financial snapshot",
      ]
    );

    // En MySQL, si PK es UUID con DEFAULT(UUID()), no siempre te da insertId.
    // Así que recuperamos el UUID generado con SELECT LAST_INSERT_ID() no aplica.
    // Solución: pedimos el id recién insertado usando reservation_id + created_at (no ideal),
    // o mejor: generamos UUID en app. Para hacerlo simple y correcto: generamos UUID en app.
    // -----> Para no reescribir tu DB ahora: haremos SELECT por el registro más reciente.
    const [orderRow] = await conn.query(
      `SELECT id FROM orders_snapshot WHERE reservation_id <=> ? ORDER BY created_at DESC LIMIT 1`,
      [reservation_id]
    );
    const orderSnapshotId = orderRow[0].id;

    // B) Insert items
    for (const it of items) {
      const itemSubtotal = money(Number(it.unit_price) * Number(it.quantity) - Number(it.item_discount || 0));
      await conn.query(
        `INSERT INTO order_items_snapshot
         (order_id, product_id, external_product_id, product_name, quantity, unit_price, item_discount, item_subtotal, is_combo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderSnapshotId,
          it.product_id,                 // UUID (string)
          it.external_product_id || null, // PROD-xx
          it.product_name,
          it.quantity,
          it.unit_price,
          it.item_discount || 0,
          itemSubtotal,
          it.is_combo ? 1 : 0,
        ]
      );
    }

    // C) Insert payment
    const [payRes] = await conn.query(
      `INSERT INTO payments
      (order_snapshot_id, reservation_id, idempotency_key, payment_method_id, coupon_id,
       gross_amount, coupon_discount, net_amount, service_fee, tip_amount, currency_code,
       status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderSnapshotId,
        reservation_id,
        idempotency_key,
        methodId,
        couponId,
        totals.subtotal,
        totals.coupon_discount,
        money(totals.subtotal - totals.total_discounts),
        totals.service_fee,
        totals.tip_amount,
        currency_code,
        statusPendingId,
      ]
    );

    const [payRow] = await conn.query(
      `SELECT id FROM payments WHERE idempotency_key = ? LIMIT 1`,
      [idempotency_key]
    );
    const paymentId = payRow[0].id;

    // D) Insert attempt (por ahora "SUCCESS" simulado, luego se conecta al banco)
    await conn.query(
      `INSERT INTO payment_attempts
      (payment_id, result, response_message, request_id, correlation_id, origin_service)
      VALUES (?, 'SUCCESS', 'mock success - no bank call yet', NULL, NULL, 'payments')`,
      [paymentId]
    );

    // E) Actualizar estado a APPROVED (mock)
    const statusApprovedId = await getStatusIdByCode("APPROVED");
    await conn.query(`UPDATE payments SET status_id = ?, paid_at = NOW() WHERE id = ?`, [statusApprovedId, paymentId]);

    await conn.commit();

    return {
      payment_id: paymentId,
      order_snapshot_id: orderSnapshotId,
      status: "APPROVED",
      totals,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getPaymentById(paymentId) {
  const [rows] = await db.query(
    `SELECT 
      p.id, p.order_snapshot_id, p.reservation_id, p.order_id, p.external_payment_id,
      p.idempotency_key, p.gross_amount, p.coupon_discount, p.net_amount, p.service_fee, p.tip_amount, p.total_refunded,
      p.currency_code, p.external_reference, p.payment_gateway, p.paid_at, p.created_at, p.updated_at,
      ps.code AS status_code,
      pm.code AS method_code, pm.name AS method_name
     FROM payments p
     JOIN payment_statuses ps ON ps.id = p.status_id
     JOIN payment_methods pm ON pm.id = p.payment_method_id
     WHERE p.id = ?`,
    [paymentId]
  );

  if (!rows.length) return null;

  const payment = rows[0];

  const [attempts] = await db.query(
    `SELECT id, result, external_reference, response_code, response_message, created_at
     FROM payment_attempts
     WHERE payment_id = ?
     ORDER BY created_at DESC`,
    [paymentId]
  );

  return { ...payment, attempts };
}

async function listPayments({ orderSnapshotId, reservationId }) {
  const where = [];
  const params = [];

  if (orderSnapshotId) {
    where.push("p.order_snapshot_id = ?");
    params.push(orderSnapshotId);
  }
  if (reservationId) {
    where.push("p.reservation_id = ?");
    params.push(reservationId);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT p.id, p.order_snapshot_id, p.reservation_id, p.idempotency_key,
            p.gross_amount, p.net_amount, p.currency_code, p.created_at,
            ps.code AS status_code,
            pm.code AS method_code
     FROM payments p
     JOIN payment_statuses ps ON ps.id = p.status_id
     JOIN payment_methods pm ON pm.id = p.payment_method_id
     ${sqlWhere}
     ORDER BY p.created_at DESC
     LIMIT 100`,
    params
  );

  return rows;
}

module.exports = {
  calculatePreview,
  createPayment,
  getPaymentById,
  listPayments,
};