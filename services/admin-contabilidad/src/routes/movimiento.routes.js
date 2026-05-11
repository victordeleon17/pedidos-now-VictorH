const express = require('express');
const router = express.Router();
const controller = require('../controllers/movimiento.controller');
const {validarMonto} = require('../middleware/validar');

// Rutas públicas
router.get('/', controller.getAllMovimientos);
router.get('/:id', controller.getMovimientoById);

// Rutas protegidas
router.post('/', validarToken, controller.crearMovimiento);
router.put('/:id', validarToken, controller.updateMovimiento);
router.delete('/:id', validarToken, controller.deleteMovimiento);

router.get('/test', (req, res) => {
    res.send('Movimiento OK');
})

module.exports = router;