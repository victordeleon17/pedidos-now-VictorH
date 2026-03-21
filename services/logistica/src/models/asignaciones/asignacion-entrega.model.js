const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const AsignacionEntrega = sequelize.define('AsignacionEntrega', {
    id_asignacion: {
        type: DataTypes.BIGINT,
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
        comment: 'ID de la entrega'
    },
    repartidor_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: 'ID del repartidor asignado'
    },
    asignado_por_usuario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: 'ID del usuario que realizó la asignación'
    },
    fecha_asignacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora de la asignación'
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si es la asignación activa actual'
    }
}, {
    tableName: 'asignaciones_entrega',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['entrega_id'], name: 'idx_asig_entrega' },
        { fields: ['repartidor_id'], name: 'idx_asig_repartidor' },
        { fields: ['activa'], name: 'idx_asig_activa' },
        { fields: ['fecha_asignacion'], name: 'idx_asig_fecha' }
    ],
    comment: 'Historial de asignaciones de repartidores a entregas (permite reasignaciones)'
});

module.exports = AsignacionEntrega;
