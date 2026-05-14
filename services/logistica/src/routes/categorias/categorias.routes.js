const express = require('express');
const router = express.Router();
const categoriasController = require('../../controllers/categorias');

router.get('/', categoriasController.listarCategorias);
router.post('/', categoriasController.crearCategoria);
router.get('/:id', categoriasController.obtenerCategoria);
router.put('/:id', categoriasController.actualizarCategoria);
router.patch('/:id/toggle', categoriasController.toggleCategoria);

module.exports = router;
