const movRepo = require('../repositories/movimiento.repository');
const { sequelize } = require('../config/db');

// ========== CREAR INGRESO ==========

const crearIngreso = async (data) => {
    const movimiento = await movRepo.crearIngreso({
        ...data,
        estado: 'completado'
    });

    // Sumar al saldo
    await movRepo.sumarSaldo(data.cuenta_id, data.monto);

    return movimiento;
};

// ========== CREAR EGRESO ==========

const crearEgreso = async (data) => {
    const saldoAnterior = await movRepo.obtenerSaldoActual(data.cuenta_id);

    // Verificar fondos disponibles
    if (saldoAnterior < data.monto) {
        throw new Error('Fondos insuficientes');
    }

    const movimiento = await movRepo.crearEgreso({
        ...data,
        estado: 'completado'
    });

    // Restar del saldo
    await movRepo.restarSaldo(data.cuenta_id, data.monto);

    return movimiento;
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (filtros = {}) => {
    return await movRepo.obtenerMovimientos(filtros);
};

// ========== OBTENER SALDO ==========

const obtenerSaldo = async (cuenta_id) => {
    return await movRepo.obtenerSaldoActual(cuenta_id);
};

// ========== OBTENER MOVIMIENTOS POR PERÍODO ==========

const obtenerMovimientosPorPeriodo = async (cuenta_id, inicio, fin) => {
    return await movRepo.obtenerMovimientosPorPeriodo(cuenta_id, inicio, fin);
};

// ========== OBTENER ESTADÍSTICAS ==========

const obtenerEstadisticas = async (cuenta_id, inicio, fin) => {
    return await movRepo.obtenerEstadisticas(cuenta_id, inicio, fin);
};

module.exports = {
    crearIngreso,
    crearEgreso,
    obtenerMovimientos,
    obtenerSaldo,
    obtenerMovimientosPorPeriodo,
    obtenerEstadisticas
};