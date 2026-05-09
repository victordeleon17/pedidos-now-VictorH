const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const entregasRoutes = require('./entregas');
const asignacionesRoutes = require('./asignaciones');
const incidenciasRoutes = require('./incidencias');
const estadisticasRoutes = require('./estadisticas');
const feedRoutes = require('./feed');
const repartidoresRoutes = require('./repartidores');
const categoriasRoutes = require('./categorias');
const notificacionesRoutes = require('./notificaciones');
const { attachDevUser } = require('../middlewares');

router.use(attachDevUser);

// Montar rutas
router.use('/feed', feedRoutes);
router.use('/entregas', entregasRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/incidencias', incidenciasRoutes);
router.use('/estadisticas', estadisticasRoutes);
router.use('/repartidores', repartidoresRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/notificaciones', notificacionesRoutes);

module.exports = router;
