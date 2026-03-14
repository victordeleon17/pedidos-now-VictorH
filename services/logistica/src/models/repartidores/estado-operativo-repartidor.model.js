const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const EstadoOperativoRepartidor = sequelize.define('EstadoOperativoRepartidor', {
    id_estado_operativo: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    repartidor_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        references: {
            model: 'repartidores',
            key: 'id_repartidor'
        },
        comment: 'ID del repartidor'
    },
    estado: {
        type: DataTypes.ENUM(
            'disponible',
            'ocupado',
            'en_ruta',
            'desconectado',
            'inactivo',
            'suspendido'
        ),
        allowNull: false,
        defaultValue: 'desconectado',
        comment: 'Estado operativo actual del repartidor'
    },
    modulo_actual: {
        type: DataTypes.ENUM('logistica', 'paqueteria', 'ninguno'),
        allowNull: false,
        defaultValue: 'ninguno',
        comment: 'Módulo en el que está trabajando actualmente'
    },
    ultimo_login: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se conectó'
    },
    ultima_actividad: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última actividad registrada'
    }
}, {
    tableName: 'estados_operativos_repartidor',
    timestamps: false,
    updatedAt: 'updated_at',
    comment: 'Estado operativo en tiempo real de los repartidores'
});

module.exports = EstadoOperativoRepartidor;
