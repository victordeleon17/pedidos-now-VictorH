// ============================================================
// ARCHIVO CENTRAL DE MODELOS - MÓDULO LOGÍSTICA
// ============================================================
// Este archivo centraliza la importación de todos los modelos,
// define sus relaciones y los exporta para uso en controladores

const sequelize = require('../../db/db');

// ============================================================
// IMPORTAR TODOS LOS MODELOS
// ============================================================

// Modelos de Repartidores (desde Administración)
const Repartidor = require('./repartidores/repartidor.model');
const EstadoOperativoRepartidor = require('./repartidores/estado-operativo-repartidor.model');

// Modelos de Logística
const Entrega = require('./entregas/entrega.model');
const AsignacionEntrega = require('./asignaciones/asignacion-entrega.model');
const HistorialEstadoEntrega = require('./historial/historial-estado.model');
const IncidenciaEntrega = require('./incidencias/incidencia.model');

// ============================================================
// DEFINIR RELACIONES (ASSOCIATIONS)
// ============================================================

// ==================== MÓDULO: REPARTIDORES ====================

// Repartidor <-> EstadoOperativoRepartidor (1:1)
Repartidor.hasOne(EstadoOperativoRepartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'estado_operativo' 
});
EstadoOperativoRepartidor.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ==================== MÓDULO: ENTREGAS ====================

// Repartidor <-> Entrega (1:N)
// Un repartidor puede tener múltiples entregas asignadas
Repartidor.hasMany(Entrega, { 
    foreignKey: 'repartidor_id', 
    as: 'entregas' 
});
Entrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// Entrega <-> HistorialEstadoEntrega (1:N)
// Una entrega tiene múltiples registros de cambios de estado
Entrega.hasMany(HistorialEstadoEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'historial' 
});
HistorialEstadoEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// ==================== MÓDULO: ASIGNACIONES ====================

// Entrega <-> AsignacionEntrega (1:N)
// Una entrega puede tener múltiples asignaciones (reasignaciones)
Entrega.hasMany(AsignacionEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'asignaciones' 
});
AsignacionEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// Repartidor <-> AsignacionEntrega (1:N)
// Un repartidor puede tener múltiples asignaciones en su historial
Repartidor.hasMany(AsignacionEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'asignaciones' 
});
AsignacionEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ==================== MÓDULO: INCIDENCIAS ====================

// Entrega <-> IncidenciaEntrega (1:N)
// Una entrega puede tener múltiples incidencias
Entrega.hasMany(IncidenciaEntrega, { 
    foreignKey: 'entrega_id', 
    as: 'incidencias' 
});
IncidenciaEntrega.belongsTo(Entrega, { 
    foreignKey: 'entrega_id', 
    as: 'entrega' 
});

// Repartidor <-> IncidenciaEntrega (1:N)
// Un repartidor puede reportar múltiples incidencias
Repartidor.hasMany(IncidenciaEntrega, { 
    foreignKey: 'repartidor_id', 
    as: 'incidencias_reportadas' 
});
IncidenciaEntrega.belongsTo(Repartidor, { 
    foreignKey: 'repartidor_id', 
    as: 'repartidor' 
});

// ============================================================
// EXPORTAR SEQUELIZE Y TODOS LOS MODELOS
// ============================================================

module.exports = {
    sequelize,
    
    // Modelos de Repartidores
    Repartidor,
    EstadoOperativoRepartidor,
    
    // Modelos de Logística
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega
};
