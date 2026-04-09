const db = require("../db");

async function create(data, executor = db) {
  const sql = `
    INSERT INTO orders_snapshot (
      id, customer_id, courier_id, business_id, delivery_address_id,
      reservation_id, external_business_id, external_customer_id, external_address_id,
      subtotal, product_discounts, coupon_discount, service_fee, courier_earned_fee,
      approved_extra_fee, tip_amount, total_amount, currency_code,
      final_payment_method_code, status_id, notes, delivered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.id,
    data.customer_id,
    data.courier_id || null,
    data.business_id,
    data.delivery_address_id,
    data.reservation_id || null,
    data.external_business_id || null,
    data.external_customer_id || null,
    data.external_address_id || null,
    data.subtotal,
    data.product_discounts,
    data.coupon_discount,
    data.service_fee,
    data.courier_earned_fee,
    data.approved_extra_fee,
    data.tip_amount,
    data.total_amount,
    data.currency_code,
    data.final_payment_method_code || null,
    data.status_id,
    data.notes || null,
    data.delivered_at || null,
  ];

  await executor.query(sql, params);
  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM orders_snapshot
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByReservationId(reservationId, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM orders_snapshot
     WHERE reservation_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [reservationId]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  findByReservationId,
};