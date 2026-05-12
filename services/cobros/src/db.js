const { Pool } = require("pg");

const usaSsl = process.env.DB_SSL === "true";

const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  ssl: usaSsl
    ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        ca: process.env.DB_CA
          ? process.env.DB_CA.replace(/\n/g, "\n")
          : undefined
      }
    : undefined
});

function toPostgresQuery(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

const pool = {
  async query(sql, params = []) {
    const result = await pgPool.query(toPostgresQuery(sql), params);
    return [result.rows, result];
  }
};

module.exports = pool;
