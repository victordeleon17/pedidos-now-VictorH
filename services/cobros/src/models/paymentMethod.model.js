const db = require("../db");

async function findByCode(code, executor = db) {
  const [rows] = await executor.query(
    "SELECT id, code, name, description, is_active FROM payment_methods WHERE code = ? LIMIT 1",
    [code]
  );
  return rows[0] || null;
}

async function findAllActive(executor = db) {
  const [rows] = await executor.query(
    "SELECT id, code, name, description FROM payment_methods WHERE is_active = 1 ORDER BY name"
  );
  return rows;
}

module.exports = {
  findByCode,
  findAllActive,
};