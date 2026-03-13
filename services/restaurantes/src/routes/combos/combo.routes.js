const express = require('express');
const router = express.Router();
const comboController = require('../../controllers/combos/combo.controller');

// GET /api/combos - Obtener todos los combos
router.get('/', comboController.getAll);

// GET /api/combos/:id - Obtener un combo por ID
router.get('/:id', comboController.getById);

// GET /api/combos/restaurante/:restaurante_id - Obtener combos por restaurante
router.get('/restaurante/:restaurante_id', comboController.getByRestaurante);

// POST /api/combos - Crear un nuevo combo
router.post('/', comboController.create);

// PUT /api/combos/:id - Actualizar un combo
router.put('/:id', comboController.update);

// DELETE /api/combos/:id - Eliminar (inactivar) un combo
router.delete('/:id', comboController.delete);

// PATCH /api/combos/:id/activo - Activar/desactivar un combo
router.patch('/:id/activo', comboController.toggleActivo);

// POST /api/combos/:id/productos - Agregar productos a un combo
router.post('/:id/productos', comboController.addProductos);

// DELETE /api/combos/:id/productos/:producto_id - Remover producto de un combo
router.delete('/:id/productos/:producto_id', comboController.removeProducto);

module.exports = router;
