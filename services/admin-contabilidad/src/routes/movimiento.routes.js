const express = require('express');
const router = express.Router();

const controller = require('../controllers/movimiento.controller');
const { validarToken } = require('../middleware/auth');
const { validarMonto } = require('../middleware/validar');

// Health/test de este módulo
router.get('/test', (req, res) => {
    res.json({
        ok: true,
        message: 'Movimiento OK'
    });
});

// Rutas públicas / consulta
router.get('/', controller.getAllMovimientos);
router.get('/fondos', controller.getFondos);
router.get('/fondos/reembolsos', controller.getFondoReembolsos);

// Rutas con ID
router.get('/:id', controller.getMovimientoById);

// Rutas de operación desde Broker u otros servicios
router.post('/ingreso-pedido', validarToken, validarMonto, controller.ingresoPedido);
router.post('/egreso', validarToken, validarMonto, controller.egreso);
router.post('/fondos/reembolsos/recargar', validarToken, validarMonto, controller.recargarFondo);

// CRUD general preparado para integración
router.post('/', validarToken, validarMonto, controller.crearMovimiento);
router.put('/:id', validarToken, validarMonto, controller.updateMovimiento);
router.delete('/:id', validarToken, controller.deleteMovimiento);

module.exports = router;