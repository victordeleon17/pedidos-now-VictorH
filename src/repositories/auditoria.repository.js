const db = require('../config/db');

const registrarLog = async (conn, data) => {
    await conn.query(
        `INSERT INTO auditoria_financiera (accion, descripcion, monto)
         VALUES (?, ?, ?)`,
        [data.accion, data.descripcion, data.monto]
    );
};

module.exports = { registrarLog };