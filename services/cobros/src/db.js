const mysql = require("mysql2/promise");

const usaSsl = process.env.DB_SSL === "true";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: usaSsl
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
        ca: process.env.DB_CA
          ? process.env.DB_CA.replace(/\\n/g, "\n")
          : undefined
      }
    : undefined
});

module.exports = pool;