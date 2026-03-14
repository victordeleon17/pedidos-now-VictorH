const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const HistorialEstadoEntrega = sequelize.define('HistorialEstadoEntrega', {
    id_historial_estado: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    entrega_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'entregas',
            key: 'id_entrega'
        },
        comment: 'ID de la entrega'
    },
    estado_anterior: {
        type: DataTypes.ENUM(
            'pendiente',
            'asignada',
            'en_preparacion',
            'lista_para_recoger',
            'en_camino',
            'entregada',
            'cancelada',
            'fallida'
        ),
        allowNull: true,
        comment: 'Estado previo de la entrega (NULL en primer registro)'
    },
    estado_nuevo: {
        type: DataTypes.ENUM(
            'pendiente',
            'asignada',
            'en_preparacion',
            'lista_para_recoger',
            'en_camino',
            'entregada',
            'cancelada',
            'fallida'
        ),
        allowNull: false,
        comment: 'Nuevo estado de la entrega'
    },
    cambiado_por_usuario_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del usuario que realizó el cambio de estado'
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones o notas sobre el cambio'
    }
}, {
    tableName: 'historial_estados_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['entrega_id'], name: 'idx_historial_entrega_id' },
        { fields: ['estado_nuevo'], name: 'idx_historial_estado_nuevo' },
        { fields: ['created_at'], name: 'idx_historial_created_at' }
    ],
    comment: 'Auditoría completa de cambios de estado de entregas'
});

module.exports = HistorialEstadoEntrega;
