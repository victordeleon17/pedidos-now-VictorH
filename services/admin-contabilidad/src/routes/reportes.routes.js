const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportes.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas que requieren autenticación
router.get('/ventas', verificarToken, controller.getVentas);
router.get('/pedidos', verificarToken, controller.getPedidos);
router.get('/crecimiento', verificarToken, controller.getCrecimiento);
router.get('/costos', verificarToken, controller.getCostos);

module.exports = router;