require("dotenv").config();

const usaSsl = process.env.DB_SSL === "true";

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "cobrosdb",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialect: "postgres",
  logging: false,
  dialectOptions: usaSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
          ca: process.env.DB_CA
            ? process.env.DB_CA.replace(/\\n/g, "\n")
            : undefined
        }
      }
    : undefined
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig
};
