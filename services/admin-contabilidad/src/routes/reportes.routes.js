const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportes.controller');
const { validarToken } = require('../middleware/auth');

// Rutas que requieren autenticación
router.get('/ventas', validarToken, controller.getVentas);
router.get('/pedidos', validarToken, controller.getPedidos);
router.get('/crecimiento', validarToken, controller.getCrecimiento);
router.get('/costos', validarToken, controller.getCostos);

router.get('/pagos-fecha', validarToken, controller.getPagosPorFecha);
router.get('/propinas', validarToken, controller.getPropinas);
router.get('/chats', validarToken, controller.getChats);
router.get('/usuarios', validarToken, controller.getUsuarios);
router.get('/pedidos-externos', validarToken, controller.getPedidosExternos);
router.get('/reembolsos-compensaciones', validarToken, controller.getReembolsosYCompensaciones);
router.get('/estadisticas-entidad', validarToken, controller.getEstadisticasPorEntidad);

module.exports = router;