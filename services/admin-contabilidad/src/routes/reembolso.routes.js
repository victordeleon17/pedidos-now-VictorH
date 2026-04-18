const express = require('express');
const router = express.Router();
const controller = require('../controller/reembolso.controller');
const { validarToken } = require('../middleware/auth');

router.get('/', controller.getAllReembolsos);
router.post('/', controller.crearReembolso);
router.get('/', validarToken, controller.getAllReembolsos);
router.post('/', validarToken, controller.crearReembolso);

module.exports = router;