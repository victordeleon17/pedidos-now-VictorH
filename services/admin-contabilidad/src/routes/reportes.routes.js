const express = require('express');
const router = express.Router();
const controller = require('../controller/reportes.controller');

console.log("CONTROLLER:", controller);

router.get('/pagos-por-fecha', controller.getPagosPorFecha);
router.get('/ventas', controller.getVentas);
router.get('/pedidos', controller.getPedidos);
router.get('/propinas', controller.getPropinas);
router.get('/costos', controller.getCostos);
router.get('/crecimiento', controller.getCrecimiento);
router.get('/chats', controller.getChats);
router.get('/usuarios', controller.getUsuarios);
router.get('/pedidos-externos', controller.getPedidosExternos);

module.exports = router;