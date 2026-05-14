const { sequelize } = require('../config/db');

// ========== CREAR MOVIMIENTO ==========
const crearMovimiento = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen, referencia_id, monto, descripcion, pedido_id, repartidor_id, estado, fecha)
        VALUES (:cuenta_id, :tipo, :subtipo, :modulo_origen, :referencia_id, :monto, :descripcion, :pedido_id, :repartidor_id, :estado, CURRENT_TIMESTAMP)
        RETURNING *`,
        {
            replacements: {
                cuenta_id: data.cuenta_id,
                tipo: data.tipo, // 'ingreso' o 'egreso'
                subtipo: data.subtipo, // 'cobro_cliente', 'reembolso', etc.
                modulo_origen: data.modulo_origen,
                referencia_id: data.referencia_id || null,
                monto: data.monto,
                descripcion: data.descripcion,
                pedido_id: data.pedido_id || null,
                repartidor_id: data.repartidor_id || null,
                estado: data.estado || 'completado'
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (filtros = {}) => {
    let query = `SELECT * FROM movimiento_financiero WHERE 1=1`;
    const replacements = {};

    if (filtros.cuenta_id) {
        query += ` AND cuenta_id = :cuenta_id`;
        replacements.cuenta_id = filtros.cuenta_id;
    }

    if (filtros.tipo) {
        query += ` AND tipo = :tipo`;
        replacements.tipo = filtros.tipo;
    }

    if (filtros.subtipo) {
        query += ` AND subtipo = :subtipo`;
        replacements.subtipo = filtros.subtipo;
    }

    if (filtros.estado) {
        query += ` AND estado = :estado`;
        replacements.estado = filtros.estado;
    }

    if (filtros.inicio && filtros.fin) {
        query += ` AND DATE(fecha) BETWEEN :inicio AND :fin`;
        replacements.inicio = filtros.inicio;
        replacements.fin = filtros.fin;
    }

    query += ` ORDER BY fecha DESC`;

    return await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });
};

// ========== OBTENER SALDO ACTUAL ==========

const obtenerSaldoActual = async (cuenta_id) => {
    const result = await sequelize.query(
        `SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as ingresos,
            COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as egresos
        FROM movimiento_financiero 
        WHERE cuenta_id = :cuenta_id AND estado = 'completado'`,
        {
            replacements: { cuenta_id },
            type: sequelize.QueryTypes.SELECT
        }
    );

    const movimientos = result[0];
    const saldo_actual = parseFloat(movimientos.ingresos) - parseFloat(movimientos.egresos);

    return {
        ingresos: parseFloat(movimientos.ingresos),
        egresos: parseFloat(movimientos.egresos),
        saldo_actual
    };
};

const crearEgreso = async (data) => {

    return await crearMovimiento({
        cuenta_id: data.cuenta_id || 2,
        tipo: 'egreso',
        subtipo: 'reembolso',
        modulo_origen: 'reembolsos',
        referencia_id: data.referencia_id,
        monto: data.monto,
        descripcion: data.descripcion,
        pedido_id: data.pedido_id || null,
        repartidor_id: null,
        estado: 'completado'
    });
};

const restarSaldo = async () => {
    return true;
};

module.exports = {
    crearMovimiento,
    obtenerMovimientos,
    obtenerSaldoActual,
    crearEgreso,
    restarSaldo
};