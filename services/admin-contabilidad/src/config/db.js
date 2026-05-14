// Admin-contabilidad Kenneth & Emmanuel
const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ========== CONFIGURACIÓN POSTGRESQL CON NEON.TECH ==========

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const sequelize = new Sequelize(
    process.env.DATABASE_URL,
    {
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        ssl: true,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

module.exports = { pool, sequelize };