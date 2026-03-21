const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const IncidenciaEntrega = sequelize.define('IncidenciaEntrega', {
    id_incidencia: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    entrega_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'entregas',
            key: 'id_entrega'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID de la entrega afectada'
    },
    repartidor_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: 'ID del repartidor que reportó (si aplica)'
    },
    tipo_incidencia: {
        type: DataTypes.ENUM(
            'direccion_incorrecta',
            'cliente_ausente',
            'paquete_danado',
            'rechazo_cliente',
            'accidente',
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
        { fields: ['entrega_id'], name: 'idx_inc_entrega' },
        { fields: ['repartidor_id'], name: 'idx_inc_repartidor' },
        { fields: ['tipo_incidencia'], name: 'idx_inc_tipo' },
        { fields: ['resuelta'], name: 'idx_inc_resuelta' }
    ],
    comment: 'Registro de incidencias operativas durante entregas'
});

module.exports = IncidenciaEntrega;
