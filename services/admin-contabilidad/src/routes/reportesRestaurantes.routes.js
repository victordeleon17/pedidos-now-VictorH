// Admin-contabilidad Emmanuel

const express = require('express');
const router = express.Router();
const reportesRestaurantesController = require('../controllers/reportesRestaurantes.controller');

router.get('/restaurantes/resumen', reportesRestaurantesController.obtenerResumenRestaurantes);
router.get('/restaurantes/:entidadId/resumen', reportesRestaurantesController.obtenerResumenRestaurantePorId);
router.get('/restaurantes/cancelaciones-multas', reportesRestaurantesController.obtenerReporteCancelacionesYMultas);

module.exports = router;