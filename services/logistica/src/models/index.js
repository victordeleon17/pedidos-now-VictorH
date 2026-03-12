// ============================================================
// ARCHIVO CENTRAL DE MODELOS - MÓDULO LOGÍSTICA
// ============================================================
// Este archivo centraliza la importación de todos los modelos,
// define sus relaciones y los exporta para uso en controladores

const sequelize = require('../../db/db');

// ============================================================
// IMPORTAR TODOS LOS MODELOS
// ============================================================

// TODO: Importar modelos cuando sean creados
// const Entrega = require('./entregas/entrega.model');
// const AsignacionEntrega = require('./asignaciones/asignacion-entrega.model');
// const HistorialEstado = require('./historial/historial-estado.model');
// const Incidencia = require('./incidencias/incidencia.model');

// ============================================================
// DEFINIR RELACIONES (ASSOCIATIONS)
// ============================================================

// ==================== MÓDULO: ENTREGAS ====================

// TODO: Definir relaciones entre modelos
// Ejemplo:
// Entrega.hasMany(HistorialEstado, { foreignKey: 'id_entrega', as: 'historial' });
// HistorialEstado.belongsTo(Entrega, { foreignKey: 'id_entrega', as: 'entrega' });

// ==================== MÓDULO: ASIGNACIONES ====================

// TODO: Definir relaciones de asignaciones

// ==================== MÓDULO: INCIDENCIAS ====================

// TODO: Definir relaciones de incidencias

// ============================================================
// EXPORTAR SEQUELIZE Y TODOS LOS MODELOS
// ============================================================

module.exports = {
    sequelize,
    
    // TODO: Exportar modelos cuando sean creados
    // Entrega,
    // AsignacionEntrega,
    // HistorialEstado,
    // Incidencia,
};
