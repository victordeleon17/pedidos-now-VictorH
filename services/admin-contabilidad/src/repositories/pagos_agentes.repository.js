const db = require('../config/db');

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM pagos_agentes');
    return rows;
};

const getTotalPagosAgentes = async () => {
    const [rows] = await db.query(`SELECT SUM(salario) AS total FROM pagos_agentes`);
    return rows[0];
};

const crearPagoAgente = async (data) => {
    const [result] = await db.query(
        `INSERT INTO pagos_agentes (agente_id, salario,
        fecha_pago) VALUES (?, ?, NOW())`,
        [data.agente_id, data.salario] 
    );
    return result.insertId;    
};

module.exports = {
    getAll,
    getTotalPagosAgentes,
    crearPagoAgente
};