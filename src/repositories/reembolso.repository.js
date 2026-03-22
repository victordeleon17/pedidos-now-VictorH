const db = require('../config/db');

const crearReembolsoConn = async (conn, data) => {
    const [result] = await conn.query(
        `INSERT INTO reembolso (usuario_id, pedido_id, monto, motivo)
        VALUES (?, ?, ?, ?)`,
        [data.usuario_id, data.pedido_id, data.monto, data.motivo]
    );
    return result.insertId;
}

module.exports = {
    crearReembolsoConn
};