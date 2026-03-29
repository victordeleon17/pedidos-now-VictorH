const express = require('express');
const router = express.Router();
const controller = require('../controller/movimiento.controller');
const {validarMonto} = require('../middleware/validar');

router.post('/ingreso-pedido', controller.ingresoPedido);
router.post('/egreso', controller.egreso);
router.get('/fondos', controller.getFondos);
router.get('/fondo-reembolsos', controller.getFondoReembolsos);
router.post('/fondo-reembolsos', controller.recargarFondo);
router.post('/egreso', validarMonto, controller.egreso);

router.get('/test', (req, res) => {
    res.send('Movimiento OK');
})

module.exports = router;