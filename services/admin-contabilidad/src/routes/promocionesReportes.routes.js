//Jeff. Daniel Ramos - Admin-conta
const express = require('express');
const router = express.Router();

const controller = require('../controllers/promocionesReportes.controller');

router.post('/', controller.crearReporte);
router.get('/', controller.listarReportes);

module.exports = router;
