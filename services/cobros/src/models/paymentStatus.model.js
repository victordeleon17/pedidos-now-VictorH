const db = require("../db");

async function findByCode(code, executor = db) {
  const [rows] = await executor.query(
    "SELECT id, code, description, is_active FROM payment_statuses WHERE code = ? LIMIT 1",
    [code]
  );
  return rows[0] || null;
}

async function findAllActive(executor = db) {
  const [rows] = await executor.query(
    "SELECT id, code, description FROM payment_statuses WHERE is_active = true ORDER BY code"
  );
  return rows;
}

module.exports = {
  findByCode,
  findAllActive,
};
