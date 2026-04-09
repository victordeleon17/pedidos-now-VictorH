const db = require("../db");

async function create(data, executor = db) {
  const sql = `
    INSERT INTO payments (
      id, order_snapshot_id, courier_id, reservation_id, order_id, external_payment_id,
      idempotency_key, payment_method_id, coupon_id,
      gross_amount, order_total_amount, coupon_discount, net_amount,
      service_fee, courier_earned_fee, tip_amount,
      resulting_balance_amount, total_refunded, currency_code,
      status_id, settlement_status, settlement_due_at, settled_at,
      external_reference, payment_gateway,
      cancelled_by, cancellation_reason,
      ip_address, request_id, correlation_id, origin_service,
      paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.id,
    data.order_snapshot_id,
    data.courier_id || null,
    data.reservation_id || null,
    data.order_id || null,
    data.external_payment_id || null,
    data.idempotency_key,
    data.payment_method_id,
    data.coupon_id || null,
    data.gross_amount,
    data.order_total_amount,
    data.coupon_discount || 0,
    data.net_amount,
    data.service_fee || 0,
    data.courier_earned_fee || 0,
    data.tip_amount || 0,
    data.resulting_balance_amount || 0,
    data.total_refunded || 0,
    data.currency_code || "GTQ",
    data.status_id,
    data.settlement_status || "NOT_APPLICABLE",
    data.settlement_due_at || null,
    data.settled_at || null,
    data.external_reference || null,
    data.payment_gateway || null,
    data.cancelled_by || null,
    data.cancellation_reason || null,
    data.ip_address || null,
    data.request_id || null,
    data.correlation_id || null,
    data.origin_service || null,
    data.paid_at || null,
  ];

  await executor.query(sql, params);
  return findById(data.id, executor);
}

async function findById(id, executor = db) {
  const [rows] = await executor.query(
    `SELECT
      p.*,
      ps.code AS status_code,
      pm.code AS payment_method_code,
      pm.name AS payment_method_name
     FROM payments p
     JOIN payment_statuses ps ON ps.id = p.status_id
     JOIN payment_methods pm ON pm.id = p.payment_method_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByIdempotencyKey(idempotencyKey, executor = db) {
  const [rows] = await executor.query(
    `SELECT *
     FROM payments
     WHERE idempotency_key = ?
     LIMIT 1`,
    [idempotencyKey]
  );
  return rows[0] || null;
}

async function list(filters = {}, executor = db) {
  const where = [];
  const params = [];

  if (filters.reservationId) {
    where.push("p.reservation_id = ?");
    params.push(filters.reservationId);
  }

  if (filters.orderSnapshotId) {
    where.push("p.order_snapshot_id = ?");
    params.push(filters.orderSnapshotId);
  }

  if (filters.orderId) {
    where.push("p.order_id = ?");
    params.push(filters.orderId);
  }

  if (filters.courierId) {
    where.push("p.courier_id = ?");
    params.push(filters.courierId);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await executor.query(
    `SELECT
      p.id,
      p.order_snapshot_id,
      p.courier_id,
      p.reservation_id,
      p.order_id,
      p.order_total_amount,
      p.currency_code,
      p.settlement_status,
      p.created_at,
      ps.code AS status_code,
      pm.code AS payment_method_code
     FROM payments p
     JOIN payment_statuses ps ON ps.id = p.status_id
     JOIN payment_methods pm ON pm.id = p.payment_method_id
     ${sqlWhere}
     ORDER BY p.created_at DESC`,
    params
  );

  return rows;
}

async function updateSettlement(data, executor = db) {
  await executor.query(
    `UPDATE payments
     SET settlement_status = ?,
         settled_at = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.settlement_status, data.settled_at || null, data.id]
  );

  return findById(data.id, executor);
}

module.exports = {
  create,
  findById,
  findByIdempotencyKey,
  list,
  updateSettlement,
};