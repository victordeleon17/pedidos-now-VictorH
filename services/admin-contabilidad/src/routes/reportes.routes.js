const express = require('express');
const router = express.Router();
const controller = require('../controller/reportes.controller');
const { validarToken } = require('../middleware/auth');

console.log("CONTROLLER:", controller);

//Rutas que requieren autenticación
router.get('/ventas', validarToken, controller.getReporteVentas);
router.get('/pedidos', validarToken, controller.getReportePedidos);
router.get('/crecimiento', validarToken, controller.getReporteCrecimiento);
router.get('/costos', validarToken, controller.getReporteCostos);

module.exports = router;