const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const IncidenciaEntrega = sequelize.define('IncidenciaEntrega', {
    id_incidencia: {
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
        comment: 'ID de la entrega afectada'
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        comment: 'ID del repartidor que reportó (si aplica)'
    },
    tipo_incidencia: {
        type: DataTypes.ENUM(
            'cliente_no_responde',
            'direccion_incorrecta',
            'problema_en_comercio',
            'pedido_danado',
            'cancelacion_cliente',
            'otro'
        ),
        allowNull: false,
        comment: 'Tipo de incidencia reportada'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Descripción detallada de la incidencia'
    },
    resuelta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la incidencia fue resuelta'
    }
}, {
    tableName: 'incidencias_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['entrega_id'], name: 'idx_incidencias_entrega_id' },
        { fields: ['repartidor_id'], name: 'idx_incidencias_repartidor_id' },
        { fields: ['tipo_incidencia'], name: 'idx_incidencias_tipo' },
        { fields: ['resuelta'], name: 'idx_incidencias_resuelta' }
    ],
    comment: 'Registro de incidencias operativas durante entregas'
});

module.exports = IncidenciaEntrega;
