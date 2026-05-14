const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimiento.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Aplicar validación de token a todas las rutas
router.use(verificarToken);

// POST - Crear movimiento (ingreso o egreso)
router.post('/', movimientoController.crearMovimiento);

// GET - Obtener todos los movimientos con filtros
router.get('/', movimientoController.obtenerMovimientos);

// GET - Obtener saldo actual de una cuenta
router.get('/saldo/:cuenta_id', movimientoController.obtenerSaldo);

// GET - Obtener movimientos por período
router.get('/periodo', movimientoController.obtenerMovimientosPorPeriodo);

// GET - Obtener estadísticas
router.get('/estadisticas', movimientoController.obtenerEstadisticas);

module.exports = router;