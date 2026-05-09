const express = require('express');
const router = express.Router();
const controller = require('../controller/reembolso.controller');
const { validarToken } = require('../middleware/auth');

// Rutas públicas
router.get('/', controller.getAllReembolsos);

// Rutas protegidas
router.post('/', validarToken, controller.crearReembolso);

module.exports = router;