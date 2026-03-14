const express = require('express');
const router = express.Router();
const precioController = require('../../controllers/precios/precio.controller');

// GET /api/precios/historial - Obtener todos los cambios de precio por rango de fechas
router.get('/historial', precioController.getHistorialByFecha);

// GET /api/precios/producto/:producto_id/actual - Obtener precio actual de un producto
router.get('/producto/:producto_id/actual', precioController.getPrecioActual);

// GET /api/precios/producto/:producto_id/historial - Obtener historial de precios de un producto
router.get('/producto/:producto_id/historial', precioController.getHistorialByProducto);

// GET /api/precios/producto/:producto_id/comparar - Comparar precios entre fechas
router.get('/producto/:producto_id/comparar', precioController.compararPrecios);

// PUT /api/precios/producto/:producto_id - Actualizar precio de un producto
router.put('/producto/:producto_id', precioController.actualizarPrecio);

module.exports = router;
