const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM pagos_agentes');
    return rows;
};

const getTotalPagosAgentes = async () => {
    const [rows] = await db.query(`SELECT SUM(salario) AS total FROM pagos_agentes`);
    return rows[0];
};

module.exports = {
    getAll,
    getTotalPagosAgentes
};