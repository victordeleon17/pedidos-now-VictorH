const express = require('express');
const router = express.Router();
const notificacionesController = require('../../controllers/notificaciones');

router.get('/', notificacionesController.listarNotificaciones);
router.get('/:id', notificacionesController.obtenerNotificacion);
router.patch('/:id/reintentar', notificacionesController.reintentarNotificacion);

module.exports = router;
