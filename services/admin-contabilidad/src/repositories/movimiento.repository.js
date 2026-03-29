const db = require('../config/db');

const crearMovimiento = async (data) => {
    const [result] = await db.query(
        `INSERT INTO movimiento_financiero
    (cuenta_id, tipo, subtipo, modulo_origen, 
    referencia_id, monto, descripcion, estado)
    VALUES (?, 'ingreso', 'pedido', 
    'restaurante', ?, ?, ?, 'procesado')`,
    [data.cuenta_id, data.referencia_id, 
        data.monto, data.descripcion]
    );
    return result.insertId;
};

const actualizarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo + ?
        WHERE id = ?`,
        [monto, cuenta_id]
    );
};

const crearEgreso = async (data) => {
    const [result] = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES (?, 'egreso', ?, 'reembolso',
        ?, ?, ?, 'procesado')`,
        [
            data.cuenta_id,
            data.subtipo,
            data.referencia_id,
            data.monto,
            data.descripcion
        ]
    );
    return result.insertId;
};

const crearEgresoConn = async (conn, data) => {
    const [result] = await conn.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES (?, 'egreso', ?, 'reembolso', ?, ?, ?, 'procesado')`,
        [
            data.cuenta_id,
            data.subtipo,
            data.referencia_id,
            data.monto,
            data.descripcion
        ]
    );

    return result.insertId;
};

const restarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo - ?
        WHERE id = ?`,
        [monto, cuenta_id]
    );
};

const getFondos = async () => {
    const [rows] = await db.query(
        'SELECT id, saldo FROM cuenta_fondo'
    ); 
    return rows;
};

module.exports = {
    crearMovimiento,
    actualizarSaldo,
    crearEgreso,
    crearEgresoConn, 
    restarSaldo,
    getFondos
}