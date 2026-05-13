const express = require('express');
const router = express.Router();
const repartidoresController = require('../../controllers/repartidores');

router.get('/disponibles', repartidoresController.listarDisponibles);
router.get('/me', repartidoresController.obtenerPerfil);
router.get('/me/metricas', repartidoresController.obtenerMetricas);
router.patch('/me/ubicacion', repartidoresController.actualizarUbicacion);
router.patch('/me/estado', repartidoresController.cambiarEstado);

module.exports = router;
