// Admin-contabilidad Kenneth

const db = require('../config/db');

const getAllMovimientos = async () => {
    const result = await db.query(
        'SELECT * FROM movimiento_financiero'
    );
    return result.rows;
};

const crearMovimiento = async (data) => {

    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen, 
        referencia_id, monto, descripcion, 
        pedido_id, repartidor_id, estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id`,
        [
            data.cuenta_id || 1,
            data.tipo,
            data.subtipo,
            data.modulo_origen,
            data.referencia_id || null,
            data.monto,
            data.descripcion,
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'pendiente'
        ]
    );

    return result.rows[0].id;
};

const actualizarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo + $1
        WHERE id = $2`,
        [monto, cuenta_id]
    );
};

const restarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo - $1
        WHERE id = $2`,
        [monto, cuenta_id]
    );
};

const crearEgreso = async (data) => {

    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES ($1, 'egreso', $2, 'reembolso', $3, $4, $5, 'procesado')
        RETURNING id`,
        [
            data.cuenta_id,
            data.subtipo,
            data.referencia_id,
            data.monto,
            data.descripcion
        ]
    );

    return result.rows[0].id;
};

const getFondos = async () => {
    const result = await db.query(
        'SELECT id, saldo FROM cuenta_fondo'
    );
    return result.rows;
};

//Admin Emmanuel 
const getMovimientoById = async (id) => {
    const result = await db.query(
        `SELECT *
        FROM movimiento_financiero
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

const updateMovimiento = async (id, data) => {
    const movimientoActual = await getMovimientoById(id);

    if (!movimientoActual) {
        return null;
    }

    const result = await db.query(
        `UPDATE movimiento_financiero
        SET 
            cuenta_id = $1,
            tipo = $2,
            subtipo = $3,
            modulo_origen = $4,
            referencia_id = $5,
            monto = $6,
            descripcion = $7,
            pedido_id = $8,
            repartidor_id = $9,
            estado = $10
        WHERE id = $11
        RETURNING *`,
        [
            data.cuenta_id ?? movimientoActual.cuenta_id,
            data.tipo ?? movimientoActual.tipo,
            data.subtipo ?? movimientoActual.subtipo,
            data.modulo_origen ?? movimientoActual.modulo_origen,
            data.referencia_id ?? movimientoActual.referencia_id,
            data.monto ?? movimientoActual.monto,
            data.descripcion ?? movimientoActual.descripcion,
            data.pedido_id ?? movimientoActual.pedido_id,
            data.repartidor_id ?? movimientoActual.repartidor_id,
            data.estado ?? movimientoActual.estado,
            id
        ]
    );

    return result.rows[0];
};

const deleteMovimiento = async (id) => {
    const result = await db.query(
        `DELETE FROM movimiento_financiero
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows.length > 0;
};

const ingresoPedido = async (data) => {
    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion,
        pedido_id, repartidor_id, estado)
        VALUES ($1, 'ingreso', 'pedido', $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.modulo_origen || 'broker',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Ingreso por pedido',
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'procesado'
        ]
    );

    return result.rows[0];
};

const egreso = async (data) => {
    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion,
        pedido_id, repartidor_id, estado)
        VALUES ($1, 'egreso', $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.subtipo || 'general',
            data.modulo_origen || 'admin-contabilidad',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Egreso registrado',
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'procesado'
        ]
    );

    return result.rows[0];
};

const getFondoReembolsos = async () => {
    const result = await db.query(
        `SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN tipo = 'ingreso' AND subtipo = 'fondo_reembolsos' THEN monto
                    WHEN tipo = 'egreso' AND subtipo = 'reembolso' THEN -monto
                    ELSE 0
                END
            ), 0) AS saldo_fondo_reembolsos
        FROM movimiento_financiero`
    );

    return result.rows[0];
};

const recargarFondo = async (data) => {
    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES ($1, 'ingreso', 'fondo_reembolsos', $2, $3, $4, $5, 'procesado')
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.modulo_origen || 'admin-contabilidad',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Recarga de fondo de reembolsos'
        ]
    );

    return result.rows[0];
};


module.exports = {
    crearMovimiento,
    actualizarSaldo,
    crearEgreso,
    restarSaldo,
    getFondos,
    getAllMovimientos,

    getMovimientoById,
    updateMovimiento,
    deleteMovimiento,
    ingresoPedido,
    egreso,
    getFondoReembolsos,
    recargarFondo
};