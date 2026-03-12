const { DataTypes } = require('sequelize');
const sequelize = require('../../../db/db');

const Repartidor = sequelize.define('Repartidor', {
    id_repartidor: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        comment: 'ID del usuario en el sistema de autenticación'
    },
    codigo_repartidor: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'Código único del repartidor'
    },
    nombres: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Nombres del repartidor'
    },
    apellidos: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Apellidos del repartidor'
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Teléfono de contacto'
    },
    correo: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Correo electrónico'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el repartidor está activo en el sistema'
    }
}, {
    tableName: 'repartidores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Maestro de repartidores (administrado por módulo de Administración)'
});

module.exports = Repartidor;
