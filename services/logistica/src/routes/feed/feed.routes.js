const express = require('express');
const router = express.Router();
const feedController = require('../../controllers/feed');

router.get('/disponibles', feedController.obtenerFeedDisponibles);
router.get('/:id/preview', feedController.obtenerPreviewPedido);
router.patch('/:id/aceptar', feedController.aceptarPedido);

module.exports = router;
