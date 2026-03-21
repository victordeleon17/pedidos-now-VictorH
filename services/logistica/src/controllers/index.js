// ============================================================
// ARCHIVO CENTRAL DE CONTROLADORES - MÓDULO LOGÍSTICA
// ============================================================

const entregasController = require('./entregas');
const asignacionesController = require('./asignaciones');
const incidenciasController = require('./incidencias');
const estadisticasController = require('./estadisticas');

module.exports = {
    entregas: entregasController,
    asignaciones: asignacionesController,
    incidencias: incidenciasController,
    estadisticas: estadisticasController
};
