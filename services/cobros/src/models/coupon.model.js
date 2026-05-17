const db = require("../db");

async function findActiveByCode(code, executor = db) {
  const [rows] = await executor.query(
    `SELECT id, code, description, discount_type, discount_value, min_amount,
            max_discount_amount, max_uses, current_uses, start_date, end_date, is_active
     FROM coupons
     WHERE code = ?
       AND is_active = true
       AND NOW() BETWEEN start_date AND end_date
     LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}

module.exports = {
  findActiveByCode,
};
