const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const Entrega = sequelize.define('Entrega', {
    id_entrega: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_origen: {
        type: DataTypes.ENUM('restaurante', 'negocio'),
        allowNull: false,
        comment: 'Módulo origen de la entrega'
    },
    origen_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del pedido/orden en el módulo origen'
    },
    empresa_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del restaurante o negocio'
    },
    sucursal_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID de la sucursal (si aplica)'
    },
    cliente_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del cliente que recibirá la entrega'
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        comment: 'ID del repartidor asignado (desde Administración)'
    },
    estado_entrega: {
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
        defaultValue: 'pendiente',
        comment: 'Estado actual de la entrega'
    },
    direccion_entrega: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Dirección completa de entrega'
    },
    referencia_direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Referencias adicionales de ubicación'
    },
    instrucciones_entrega: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Instrucciones especiales para el repartidor'
    },
    monto_cobrar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Monto que el repartidor debe cobrar al cliente'
    },
    fecha_entrega_estimada: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha/hora estimada de entrega'
    },
    fecha_entrega_real: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha/hora real de entrega completada'
    }
}, {
    tableName: 'entregas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { 
            unique: true, 
            fields: ['tipo_origen', 'origen_id'],
            name: 'uq_entrega_origen'
        },
        { fields: ['empresa_id'], name: 'idx_entregas_empresa_id' },
        { fields: ['sucursal_id'], name: 'idx_entregas_sucursal_id' },
        { fields: ['cliente_id'], name: 'idx_entregas_cliente_id' },
        { fields: ['repartidor_id'], name: 'idx_entregas_repartidor_id' },
        { fields: ['estado_entrega'], name: 'idx_entregas_estado_entrega' }
    ],
    comment: 'Tabla principal de entregas gestionadas por el módulo de Logística'
});

module.exports = Entrega;
