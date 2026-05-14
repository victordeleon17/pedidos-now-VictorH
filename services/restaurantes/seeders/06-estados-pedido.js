'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('EstadosPedido', [
      {
        nombre: 'Recibido',
        descripcion: 'Pedido recibido y en espera de confirmación',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Confirmado',
        descripcion: 'Pedido confirmado por el restaurante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'En Preparación',
        descripcion: 'El restaurante está preparando el pedido',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Listo',
        descripcion: 'Pedido listo para entrega o recogida',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'En Camino',
        descripcion: 'Pedido enviado para entrega a domicilio',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Entregado',
        descripcion: 'Pedido entregado al cliente',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Cancelado por Cliente',
        descripcion: 'Pedido cancelado por el cliente',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Cancelado por Restaurante',
        descripcion: 'Pedido cancelado por el restaurante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Rechazado',
        descripcion: 'Pedido rechazado por el restaurante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('EstadosPedido', null, {});
  }
};