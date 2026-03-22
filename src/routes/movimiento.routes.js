const express = require('express');
const router = express.Router();
const controller = require('../controller/movimiento.controller');

router.post('/ingreso-pedido', controller.ingresoPedido);
router.post('/egreso', controller.egreso);

router.get('/test', (req, res) => {
    res.send('Movimiento OK');
})

module.exports = router;