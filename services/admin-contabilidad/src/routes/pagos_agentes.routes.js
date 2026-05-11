const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagos_agentes.controller');

console.log(controller);

router.get('/', controller.getAllPagosAgentes);
router.get('/total', controller.getTotalPagos);
router.post('/', controller.crearPagoAgente);

module.exports = router;