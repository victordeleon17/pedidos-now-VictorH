const movService = require('../services/movimiento.service');

// ========== CREAR MOVIMIENTO ==========

const crearMovimiento = async (req, res) => {
    try {
        const { cuenta_id, tipo, subtipo, monto, descripcion, referencia_id } = req.body;

        if (!cuenta_id || !tipo || !subtipo || !monto) {
            return res.status(400).json({
                ok: false,
                error: 'cuenta_id, tipo, subtipo y monto son requeridos'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'Monto debe ser mayor a 0'
            });
        }

        let movimiento;
        if (tipo === 'ingreso') {
            movimiento = await movService.crearIngreso({
                cuenta_id,
                subtipo,
                monto,
                descripcion: descripcion || null,
                referencia_id: referencia_id || null
            });
        } else if (tipo === 'egreso') {
            movimiento = await movService.crearEgreso({
                cuenta_id,
                subtipo,
                monto,
                descripcion: descripcion || null,
                referencia_id: referencia_id || null
            });
        } else {
            return res.status(400).json({
                ok: false,
                error: 'tipo debe ser "ingreso" o "egreso"'
            });
        }

        res.status(201).json({
            ok: true,
            movimiento
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (req, res) => {
    try {
        const { cuenta_id, tipo, subtipo, inicio, fin } = req.query;
        
        const filtros = {};
        if (cuenta_id) filtros.cuenta_id = cuenta_id;
        if (tipo) filtros.tipo = tipo;
        if (subtipo) filtros.subtipo = subtipo;
        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const movimientos = await movService.obtenerMovimientos(filtros);
        
        res.json({
            ok: true,
            count: movimientos.length,
            movimientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener movimientos',
            detalle: error.message
        });
    }
};

// ========== OBTENER SALDO ==========

const obtenerSaldo = async (req, res) => {
    try {
        const { cuenta_id } = req.params;
        
        if (!cuenta_id) {
            return res.status(400).json({
                ok: false,
                error: 'cuenta_id requerido'
            });
        }

        const saldo = await movService.obtenerSaldo(cuenta_id);
        
        res.json({
            ok: true,
            cuenta_id,
            saldo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener saldo',
            detalle: error.message
        });
    }
};

// ========== OBTENER MOVIMIENTOS POR PERÍODO ==========

const obtenerMovimientosPorPeriodo = async (req, res) => {
    try {
        const { cuenta_id, inicio, fin } = req.query;
        
        if (!cuenta_id || !inicio || !fin) {
            return res.status(400).json({
                ok: false,
                error: 'cuenta_id, inicio y fin son requeridos'
            });
        }

        const movimientos = await movService.obtenerMovimientosPorPeriodo(cuenta_id, inicio, fin);
        
        res.json({
            ok: true,
            cuenta_id,
            periodo: { inicio, fin },
            count: movimientos.length,
            movimientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener movimientos',
            detalle: error.message
        });
    }
};

// ========== OBTENER ESTADÍSTICAS ==========

const obtenerEstadisticas = async (req, res) => {
    try {
        const { cuenta_id, inicio, fin } = req.query;
        
        if (!cuenta_id || !inicio || !fin) {
            return res.status(400).json({
                ok: false,
                error: 'cuenta_id, inicio y fin son requeridos'
            });
        }

        const estadisticas = await movService.obtenerEstadisticas(cuenta_id, inicio, fin);
        
        res.json({
            ok: true,
            estadisticas: {
                total_movimientos: Number(estadisticas.total_movimientos),
                total_ingresos: Number(estadisticas.total_ingresos) || 0,
                total_egresos: Number(estadisticas.total_egresos) || 0,
                saldo_actual: Number(estadisticas.saldo_actual) || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener estadísticas',
            detalle: error.message
        });
    }
};

module.exports = {
    crearMovimiento,
    obtenerMovimientos,
    obtenerSaldo,
    obtenerMovimientosPorPeriodo,
    obtenerEstadisticas
};